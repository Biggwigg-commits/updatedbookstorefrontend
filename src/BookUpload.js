import React, { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function BookUpload({ books, onUploadSuccess }) {
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setMessage('');
      } else {
        setMessage('Please select an image file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedBook || !selectedFile) {
      setMessage('Please select both a book and an image file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${BACKEND_URL}/api/books/${selectedBook}/upload-cover`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Book cover uploaded successfully!');
        setSelectedFile(null);
        setSelectedBook('');
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        const error = await response.json();
        setMessage(`Upload failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h3>📚 Upload Book Cover</h3>
        <p>Select a book and upload a custom cover image</p>
        
        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="book-select">Select Book:</label>
            <select 
              id="book-select"
              value={selectedBook} 
              onChange={(e) => setSelectedBook(e.target.value)}
              className="book-select"
            >
              <option value="">Choose a book...</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="file-input">Select Image:</label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFile && (
              <p className="file-info">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
              </p>
            )}
          </div>

          <button 
            onClick={handleUpload} 
            disabled={uploading || !selectedBook || !selectedFile}
            className="upload-btn"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Cover'}
          </button>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookUpload;