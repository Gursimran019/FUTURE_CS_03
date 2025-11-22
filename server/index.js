const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { encryptFile, decryptFile } = require('./crypto-utils');

const app = express();
const PORT = process.env.PORT || 5000;

// Create necessary directories
const uploadsDir = path.join(__dirname, 'uploads');
const metadataDir = path.join(__dirname, 'metadata');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.UPLOAD_RATE_LIMIT) || 10,
  message: { error: 'Too many upload requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types but validate size
    cb(null, true);
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Upload endpoint
app.post('/api/upload', uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const tempPath = req.file.path;
    const encryptedPath = `${tempPath}.enc`;

    // Encrypt the file
    await encryptFile(tempPath, encryptedPath);

    // Delete the temporary unencrypted file
    fs.unlinkSync(tempPath);

    // Save metadata
    const metadata = {
      id: path.basename(encryptedPath, '.enc'),
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date().toISOString(),
      encryptedPath: encryptedPath,
    };

    const metadataPath = path.join(metadataDir, `${metadata.id}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({
      id: metadata.id,
      originalName: metadata.originalName,
      size: metadata.size,
      mimeType: metadata.mimeType,
      uploadDate: metadata.uploadDate,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// List files endpoint
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(metadataDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join(metadataDir, file), 'utf8');
        return JSON.parse(content);
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Download endpoint
app.get('/api/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const metadataPath = path.join(metadataDir, `${fileId}.json`);

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const encryptedPath = metadata.encryptedPath;

    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'Encrypted file not found' });
    }

    // Decrypt to temporary file
    const tempDecryptedPath = `${encryptedPath}.dec`;
    await decryptFile(encryptedPath, tempDecryptedPath);

    // Send file
    res.download(tempDecryptedPath, metadata.originalName, (err) => {
      // Clean up temporary decrypted file
      if (fs.existsSync(tempDecryptedPath)) {
        fs.unlinkSync(tempDecryptedPath);
      }

      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'File download failed' });
  }
});

// Delete endpoint
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const metadataPath = path.join(metadataDir, `${fileId}.json`);

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Delete encrypted file
    if (fs.existsSync(metadata.encryptedPath)) {
      fs.unlinkSync(metadata.encryptedPath);
    }

    // Delete metadata
    fs.unlinkSync(metadataPath);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Encryption enabled with AES-256-GCM`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
});
