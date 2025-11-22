import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import SecurityInfo from './components/SecurityInfo';
import { Shield } from 'lucide-react';

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUploaded = (newFile) => {
    setFiles(prev => [newFile, ...prev]);
  };

  const handleFileDeleted = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="container">
      <Toaster position="top-right" />
      
      <header className="header">
        <h1>
          <Shield size={40} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Secure File Portal
        </h1>
        <p>Upload and download files with military-grade AES-256-GCM encryption</p>
      </header>

      <div className="main-content">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Upload Files</h2>
          <FileUpload onFileUploaded={handleFileUploaded} />
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Your Files</h2>
          <FileList 
            files={files} 
            loading={loading} 
            onFileDeleted={handleFileDeleted}
            onRefresh={fetchFiles}
          />
        </div>
      </div>

      <SecurityInfo />
    </div>
  );
}

export default App;