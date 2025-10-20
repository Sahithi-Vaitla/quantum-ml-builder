// src/components/ValidationModal.jsx
import { X, AlertCircle, AlertTriangle, CheckCircle, Play } from 'lucide-react';

function ValidationModal({ isOpen, onClose, validationResult, onProceed }) {
  if (!isOpen || !validationResult) return null;

  const { isValid, errors, warnings, hasWarnings } = validationResult;

  const handleProceed = () => {
    if (isValid) {
      onProceed();
      onClose();
    }
  };

  return (
    <div className="validation-modal-overlay" onClick={onClose}>
      <div className="validation-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`validation-header ${isValid ? 'valid' : 'invalid'}`}>
          <div className="header-content">
            {isValid ? (
              <>
                <CheckCircle size={28} />
                <div>
                  <h2>Ready to Run</h2>
                  <p>Your workflow passed validation</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={28} />
                <div>
                  <h2>Validation Failed</h2>
                  <p>{errors.length} issue{errors.length !== 1 ? 's' : ''} must be fixed</p>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="validation-content">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="validation-section">
              <div className="section-header error">
                <AlertCircle size={20} />
                <h3>Errors ({errors.length})</h3>
              </div>
              <div className="issues-list">
                {errors.map((error, idx) => (
                  <div key={idx} className="issue-item error">
                    <div className="issue-message">{error.message}</div>
                    <div className="issue-fix">
                      <span className="fix-label">Fix:</span> {error.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="validation-section">
              <div className="section-header warning">
                <AlertTriangle size={20} />
                <h3>Warnings ({warnings.length})</h3>
              </div>
              <div className="issues-list">
                {warnings.map((warning, idx) => (
                  <div key={idx} className="issue-item warning">
                    <div className="issue-message">{warning.message}</div>
                    <div className="issue-fix">
                      <span className="fix-label">Suggestion:</span> {warning.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success message */}
          {isValid && warnings.length === 0 && (
            <div className="validation-section">
              <div className="success-message">
                <CheckCircle size={48} />
                <p>Your workflow is configured correctly and ready to run!</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="validation-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          
          {isValid ? (
            <button onClick={handleProceed} className="btn btn-success">
              <Play size={18} />
              {hasWarnings ? 'Run Anyway' : 'Run Workflow'}
            </button>
          ) : (
            <button className="btn btn-disabled" disabled>
              Fix Errors First
            </button>
          )}
        </div>
      </div>

      <style>{`
        .validation-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .validation-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
          overflow: hidden;
        }

        [data-theme="dark"] .validation-modal {
          background: var(--bg-surface);
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

        /* Header */
        .validation-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e5e7eb;
        }

        [data-theme="dark"] .validation-header {
          border-bottom-color: #374151;
        }

        .validation-header.valid {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
        }

        [data-theme="dark"] .validation-header.valid {
          background: linear-gradient(135deg, #064e3b, #065f46);
          color: #d1fae5;
        }

        .validation-header.invalid {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
        }

        [data-theme="dark"] .validation-header.invalid {
          background: linear-gradient(135deg, #7f1d1d, #991b1b);
          color: #fee2e2;
        }

        .header-content {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .header-content h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .header-content p {
          margin: 4px 0 0 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .close-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 8px;
          color: inherit;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        /* Content */
        .validation-content {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .validation-section {
          margin-bottom: 24px;
        }

        .validation-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid;
        }

        .section-header.error {
          color: #dc2626;
          border-color: #fecaca;
        }

        [data-theme="dark"] .section-header.error {
          color: #f87171;
          border-color: #7f1d1d;
        }

        .section-header.warning {
          color: #f59e0b;
          border-color: #fde68a;
        }

        [data-theme="dark"] .section-header.warning {
          color: #fbbf24;
          border-color: #78350f;
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        /* Issues */
        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-item {
          padding: 16px;
          border-radius: 12px;
          border: 2px solid;
        }

        .issue-item.error {
          background: #fef2f2;
          border-color: #fecaca;
        }

        [data-theme="dark"] .issue-item.error {
          background: #7f1d1d;
          border-color: #991b1b;
        }

        .issue-item.warning {
          background: #fffbeb;
          border-color: #fde68a;
        }

        [data-theme="dark"] .issue-item.warning {
          background: #78350f;
          border-color: #92400e;
        }

        .issue-message {
          font-weight: 600;
          margin-bottom: 8px;
          color: #1f2937;
        }

        [data-theme="dark"] .issue-message {
          color: #f9fafb;
        }

        .issue-fix {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        [data-theme="dark"] .issue-fix {
          color: #d1d5db;
        }

        .fix-label {
          font-weight: 600;
          color: #374151;
        }

        [data-theme="dark"] .fix-label {
          color: #e5e7eb;
        }

        /* Success message */
        .success-message {
          text-align: center;
          padding: 32px;
          color: #059669;
        }

        [data-theme="dark"] .success-message {
          color: #34d399;
        }

        .success-message svg {
          margin-bottom: 16px;
        }

        .success-message p {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
        }

        [data-theme="dark"] .success-message p {
          color: #d1d5db;
        }

        /* Footer */
        .validation-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f9fafb;
        }

        [data-theme="dark"] .validation-footer {
          border-top-color: #374151;
          background: #1f2937;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        [data-theme="dark"] .btn-secondary {
          background: #374151;
          color: #f9fafb;
          border-color: #4b5563;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        [data-theme="dark"] .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-success:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        [data-theme="dark"] .btn-disabled {
          background: #374151;
          color: #6b7280;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .validation-modal {
            width: 95%;
            max-height: 90vh;
          }

          .validation-header {
            padding: 20px;
          }

          .header-content h2 {
            font-size: 20px;
          }

          .validation-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default ValidationModal;