#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Secure File Portal...\n');

// Generate a secure master key
const masterKey = crypto.randomBytes(32).toString('hex');
console.log('🔑 Generated Master Key:', masterKey);

// Create .env file
const envContent = `# Secure File Portal Configuration
PORT=5000
NODE_ENV=development
MASTER_KEY=${masterKey}
CLIENT_URL=http://localhost:3000
JWT_SECRET=${crypto.randomBytes(32).toString('base64')}
MAX_FILE_SIZE=104857600
UPLOAD_RATE_LIMIT=10
`;

fs.writeFileSync('.env', envContent);
console.log('✅ Created .env file with secure configuration');

// Create test file for upload testing
const testContent = 'This is a test file for the Secure File Portal!\nIt contains sensitive data that will be encrypted with AES-256-GCM.';
fs.writeFileSync('test-file.txt', testContent);
console.log('✅ Created test-file.txt for upload testing');

console.log('\n🚀 Setup complete! Next steps:');
console.log('1. npm install');
console.log('2. cd client && npm install && cd ..');
console.log('3. npm run dev');
console.log('4. Open http://localhost:3000');
console.log('\n🔒 Your files will be encrypted with AES-256-GCM encryption!');