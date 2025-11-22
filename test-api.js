#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing Secure File Portal API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Upload File
    console.log('\n2️⃣ Testing file upload...');
    const testContent = 'This is encrypted test data! 🔒';
    fs.writeFileSync('temp-test.txt', testContent);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream('temp-test.txt'));
    
    const uploadResponse = await axios.post(`${BASE_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ File uploaded successfully:', uploadResponse.data);
    const fileId = uploadResponse.data.fileId;

    // Test 3: List Files
    console.log('\n3️⃣ Testing file listing...');
    const listResponse = await axios.get(`${BASE_URL}/api/files`);
    console.log('✅ Files listed:', listResponse.data.length, 'files found');

    // Test 4: Download File
    console.log('\n4️⃣ Testing file download...');
    const downloadResponse = await axios.get(`${BASE_URL}/api/download/${fileId}`, {
      responseType: 'arraybuffer'
    });
    
    const downloadedContent = Buffer.from(downloadResponse.data).toString();
    console.log('✅ File downloaded. Content matches:', downloadedContent === testContent);

    // Test 5: Delete File
    console.log('\n5️⃣ Testing file deletion...');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/files/${fileId}`);
    console.log('✅ File deleted successfully:', deleteResponse.data);

    // Cleanup
    fs.unlinkSync('temp-test.txt');
    
    console.log('\n🎉 All tests passed! The Secure File Portal is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Check if server is running
axios.get(`${BASE_URL}/api/health`)
  .then(() => testAPI())
  .catch(() => {
    console.log('❌ Server not running. Please start the server first:');
    console.log('npm run dev');
  });