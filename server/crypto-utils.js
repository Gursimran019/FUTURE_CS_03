const crypto = require('crypto');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// AES-256-GCM encryption parameters
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

// Get master key from environment
const getMasterKey = () => {
  const key = process.env.MASTER_KEY;
  if (!key) {
    throw new Error('MASTER_KEY not set in environment variables');
  }
  
  // Convert hex string to buffer
  const keyBuffer = Buffer.from(key, 'hex');
  
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Master key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
  }
  
  return keyBuffer;
};

/**
 * Encrypt a file using AES-256-GCM
 * @param {string} inputPath - Path to the file to encrypt
 * @param {string} outputPath - Path where encrypted file will be saved
 * @returns {Promise<void>}
 */
const encryptFile = async (inputPath, outputPath) => {
  try {
    // Read the file
    const data = await readFile(inputPath);
    
    // Generate a random IV for this file
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Get the master key
    const key = getMasterKey();
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the data
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ]);
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV + Auth Tag + Encrypted Data
    // Format: [16-byte IV][16-byte Auth Tag][Encrypted Data]
    const result = Buffer.concat([iv, authTag, encrypted]);
    
    // Write to output file
    await writeFile(outputPath, result);
    
    return {
      success: true,
      ivLength: iv.length,
      authTagLength: authTag.length,
      encryptedSize: encrypted.length,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt a file using AES-256-GCM
 * @param {string} inputPath - Path to the encrypted file
 * @param {string} outputPath - Path where decrypted file will be saved
 * @returns {Promise<void>}
 */
const decryptFile = async (inputPath, outputPath) => {
  try {
    // Read the encrypted file
    const data = await readFile(inputPath);
    
    // Extract IV, Auth Tag, and encrypted data
    const iv = data.slice(0, IV_LENGTH);
    const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);
    
    // Get the master key
    const key = getMasterKey();
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    // Write to output file
    await writeFile(outputPath, decrypted);
    
    return {
      success: true,
      decryptedSize: decrypted.length,
    };
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Generate a secure random key for AES-256
 * @returns {string} Hex-encoded key
 */
const generateKey = () => {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
};

module.exports = {
  encryptFile,
  decryptFile,
  generateKey,
};
