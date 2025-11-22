import React from 'react';
import { Shield, Lock, Key, Server, CheckCircle } from 'lucide-react';

const SecurityInfo = () => {
  return (
    <div className="security-info">
      <h3>
        <Shield size={24} />
        Security Overview
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#4f46e5', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} />
            Encryption at Rest
          </h4>
          <ul className="security-features">
            <li>
              <CheckCircle size={16} color="#10b981" />
              AES-256-GCM encryption
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Authenticated encryption with additional data (AEAD)
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Unique initialization vectors (IV) per file
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Authentication tags for integrity verification
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#4f46e5', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} />
            Encryption in Transit
          </h4>
          <ul className="security-features">
            <li>
              <CheckCircle size={16} color="#10b981" />
              HTTPS/TLS 1.3 encryption
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Certificate pinning ready
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Secure headers (HSTS, CSP)
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              CORS protection
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#4f46e5', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} />
            Key Management
          </h4>
          <ul className="security-features">
            <li>
              <CheckCircle size={16} color="#10b981" />
              256-bit master key
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Environment-based key storage
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              Key rotation ready
            </li>
            <li>
              <CheckCircle size={16} color="#10b981" />
              HSM integration ready
            </li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px' }}>
        <strong style={{ color: '#856404' }}>🔐 Security Note:</strong>
        <span style={{ color: '#856404', marginLeft: '8px' }}>
          This implementation uses military-grade AES-256-GCM encryption. Files are encrypted before storage and decrypted only during download. 
          The master key should be stored securely in production environments using proper key management systems.
        </span>
      </div>
    </div>
  );
};

export default SecurityInfo;