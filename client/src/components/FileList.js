import React from 'react';
import { Download, Trash2, RefreshCw, File, Folder } from 'lucide-react';
import toast from 'react-hot-toast';

const FileList = ({ files, loading, onFileDeleted, onRefresh }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      toast.loading('🔓 Decrypting and downloading...', { id: fileId });
      
      const response = await fetch(`/api/download/${fileId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('✅ File downloaded successfully!', { id: fileId });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`❌ Download failed: ${error.message}`, { id: fileId });
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      toast.loading('🗑️ Deleting file...', { id: fileId });
      
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onFileDeleted(fileId);
        toast.success('✅ File deleted successfully!', { id: fileId });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`❌ Delete failed: ${error.message}`, { id: fileId });
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  if (loading) {
    return (
      <div className="loading">
        <RefreshCw size={24} className="animate-spin" style={{ marginRight: '10px' }} />
        Loading files...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Folder size={64} />
        </div>
        <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No files uploaded yet</div>
        <div style={{ fontSize: '0.9rem', color: '#999' }}>
          Upload your first file to get started
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          {files.length} file{files.length !== 1 ? 's' : ''} • All encrypted with AES-256-GCM
        </div>
        <button 
          onClick={onRefresh}
          className="action-button"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-info">
              <div className="file-name">
                <span style={{ marginRight: '8px' }}>
                  {getFileIcon(file.mimeType)}
                </span>
                {file.originalName}
              </div>
              <div className="file-meta">
                {formatFileSize(file.size)} • Uploaded {formatDate(file.uploadDate)}
              </div>
            </div>
            
            <div className="file-actions">
              <button
                onClick={() => handleDownload(file.id, file.originalName)}
                className="action-button download"
                title="Download file"
              >
                <Download size={14} style={{ marginRight: '5px' }} />
                Download
              </button>
              
              <button
                onClick={() => handleDelete(file.id, file.originalName)}
                className="action-button delete"
                title="Delete file"
              >
                <Trash2 size={14} style={{ marginRight: '5px' }} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;