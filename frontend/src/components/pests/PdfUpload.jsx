import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PdfUpload({ onFileSelect, initialFile, onClear }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(initialFile || null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setErrorMsg(null);
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Invalid file format. Please upload a valid .pdf document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum limit of 10MB.');
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onClear) onClear();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="pdf-upload-wrapper" style={{ margin: '1rem 0' }}>
      {selectedFile ? (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <div style={{ background: '#10B981', color: '#FFFFFF', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#065F46' }}>{selectedFile.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                {formatFileSize(selectedFile.size)} • PDF Document
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleRemove}
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragActive ? '2px dashed var(--primary)' : '2px dashed #CBD5E1',
            background: dragActive ? 'rgba(16, 185, 129, 0.05)' : '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={handleChange}
          />

          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
            <UploadCloud size={36} />
          </div>

          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
            Click or drag & drop agricultural PDF report
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Upload inspection report, laboratory test, or field observation PDF (Max 10MB)
          </div>

          {errorMsg && (
            <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
