import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUpload = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        toast.success(`✅ ${file.name} uploaded successfully!`);
        onFileUploaded(result);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0];
      if (file.errors[0].code === 'file-too-large') {
        toast.error('❌ File too large. Maximum size is 100MB.');
      } else {
        toast.error('❌ File rejected. Please try again.');
      }
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="upload-icon">
          {uploading ? (
            <CheckCircle size={48} color="#10b981" />
          ) : (
            <Upload size={48} />
          )}
        </div>

        {uploading ? (
          <div>
            <div className="upload-text">Encrypting and uploading...</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="upload-subtext">{uploadProgress}% complete</div>
          </div>
        ) : (
          <div>
            <div className="upload-text">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </div>
            <div className="upload-subtext">
              or click to select a file (max 100MB)
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          className="upload-button"
          onClick={() => document.querySelector('input[type="file"]').click()}
          disabled={uploading}
        >
          <File size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <AlertCircle size={16} />
          <strong>Security Features:</strong>
        </div>
        <ul style={{ paddingLeft: '24px', lineHeight: '1.6' }}>
          <li>Files encrypted with AES-256-GCM before storage</li>
          <li>Secure key management and authentication tags</li>
          <li>Files transmitted over HTTPS</li>
          <li>Rate limiting and file size restrictions</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;