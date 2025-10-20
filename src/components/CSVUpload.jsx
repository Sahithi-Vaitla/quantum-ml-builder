import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

const CSVUpload = ({ onDataLoaded, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [labelColumn, setLabelColumn] = useState('last');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Read and preview file
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const previewLines = lines.slice(0, 6); // Show first 5 rows + header
      setPreview({
        lines: previewLines,
        totalRows: lines.length - (hasHeaders ? 1 : 0)
      });
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows = lines.map(line => {
      // Simple CSV parser - handles basic cases
      return line.split(',').map(val => val.trim());
    });

    let headers = null;
    let dataRows = rows;

    if (hasHeaders) {
      headers = rows[0];
      dataRows = rows.slice(1);
    }

    // Convert to numbers and separate features/labels
    const data = [];
    const labels = [];

    for (const row of dataRows) {
      if (row.length === 0) continue;

      const numericRow = row.map(val => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      });

      let features, label;

      if (labelColumn === 'first') {
        label = numericRow[0];
        features = numericRow.slice(1);
      } else if (labelColumn === 'last') {
        label = numericRow[numericRow.length - 1];
        features = numericRow.slice(0, -1);
      } else {
        // No label column - use all as features, generate dummy labels
        features = numericRow;
        label = 0;
      }

      data.push(features);
      labels.push(label);
    }

    return {
      data,
      labels,
      features: headers ? (labelColumn === 'first' ? headers.slice(1) : headers.slice(0, -1)) : null,
      shape: [data.length, data[0]?.length || 0],
      metadata: {
        source: 'csv',
        filename: file.name,
        hasHeaders,
        labelColumn
      }
    };
  };

  const handleLoad = () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = parseCSV(event.target.result);
        console.log('CSV Loaded:', parsedData);
        onDataLoaded(parsedData);
      } catch (err) {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="csv-modal-overlay" onClick={onClose} />
      <div className="csv-modal-container">
        <div className="csv-modal">
          {/* Header */}
          <div className="csv-modal-header">
            <div className="csv-modal-title">
              <Upload className="title-icon" />
              <h2>Upload CSV Dataset</h2>
            </div>
            <button onClick={onClose} className="close-button">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="csv-modal-content">
            {/* File Input */}
            <div className="file-input-section">
              <label className="section-label">Select CSV File</label>
              <div className="file-drop-zone">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="file-drop-label">
                  <Upload className="upload-icon" />
                  <p className="file-name">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="file-hint">CSV files only</p>
                </label>
              </div>
            </div>

            {/* Configuration */}
            {file && (
              <div className="config-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasHeaders}
                    onChange={(e) => setHasHeaders(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span>First row contains headers</span>
                </label>

                <div>
                  <label className="section-label">Label Column Location</label>
                  <select
                    value={labelColumn}
                    onChange={(e) => setLabelColumn(e.target.value)}
                    className="select-input"
                  >
                    <option value="last">Last Column (Labels)</option>
                    <option value="first">First Column (Labels)</option>
                    <option value="none">No Labels (Unsupervised)</option>
                  </select>
                  <p className="input-hint">Which column contains the target/label values</p>
                </div>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="preview-section">
                <h3 className="section-label">Preview ({preview.totalRows} rows)</h3>
                <div className="preview-box">
                  <pre className="preview-text">{preview.lines.join('\n')}</pre>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-box">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="info-box">
              <CheckCircle size={20} />
              <div>
                <p className="info-title">CSV Format Guidelines:</p>
                <ul className="info-list">
                  <li>Numeric data only (features and labels)</li>
                  <li>One sample per row</li>
                  <li>Label should be in first or last column</li>
                  <li>Example: feature1,feature2,feature3,label</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="csv-modal-footer">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button onClick={handleLoad} disabled={!file} className="btn-load">
              Load Dataset
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .csv-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 9998;
        }

        .csv-modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          pointer-events: none;
        }

        .csv-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          pointer-events: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .csv-modal-header {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          padding: 20px 24px;
          border-radius: 16px 16px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .csv-modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          width: 24px;
          height: 24px;
          color: white;
        }

        .csv-modal-title h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .close-button {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .csv-modal-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .file-input-section {
          margin-bottom: 24px;
        }

        .section-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .file-drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          transition: border-color 0.2s;
          cursor: pointer;
        }

        .file-drop-zone:hover {
          border-color: #3b82f6;
        }

        .file-input-hidden {
          display: none;
        }

        .file-drop-label {
          cursor: pointer;
          display: block;
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          color: #9ca3af;
          margin: 0 auto 12px;
        }

        .file-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin: 0 0 4px 0;
        }

        .file-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .config-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .checkbox-input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .select-input {
          width: 100%;
          padding: 10px 12px;
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #111827;
          cursor: pointer;
        }

        .input-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 4px 0 0 0;
        }

        .preview-section {
          margin-bottom: 24px;
        }

        .preview-box {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
        }

        .preview-text {
          font-size: 0.75rem;
          color: #374151;
          font-family: 'Courier New', monospace;
          margin: 0;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
          font-size: 0.875rem;
          margin-bottom: 16px;
        }

        .info-box {
          display: flex;
          align-items: start;
          gap: 8px;
          padding: 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          color: #1e40af;
          font-size: 0.875rem;
        }

        .info-title {
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .info-list {
          margin: 0;
          padding-left: 20px;
          font-size: 0.75rem;
          line-height: 1.6;
        }

        .csv-modal-footer {
          padding: 16px 24px;
          background: #f9fafb;
          border-radius: 0 0 16px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f9fafb;
        }

        .btn-load {
          padding: 10px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-load:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-load:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default CSVUpload;