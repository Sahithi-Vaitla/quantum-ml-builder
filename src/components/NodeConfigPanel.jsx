import { X } from 'lucide-react';
import { useState } from 'react';

const availableIcons = ['🗄️', '🎛️', '🧠', '⚛️', '📊', '🔧', '📈', '💾', '🎯', '⚡'];

function NodeConfigPanel({ node, isOpen, onClose, onUpdate }) {
  const [label, setLabel] = useState(node?.data?.label || '');
  const [selectedIcon, setSelectedIcon] = useState(node?.data?.icon || '📦');
  const [notes, setNotes] = useState(node?.data?.notes || '');

  if (!isOpen || !node) return null;

  const handleSave = () => {
    onUpdate(node.id, {
      label,
      icon: selectedIcon,
      notes
    });
    onClose();
  };

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel" onClick={(e) => e.stopPropagation()}>
        <div className="config-header">
          <h3>Configure Node</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="config-content">
          <div className="form-group">
            <label htmlFor="node-label">Label</label>
            <input
              id="node-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter node name"
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-grid">
              {availableIcons.map((icon) => (
                <button
                  key={icon}
                  className={`icon-btn ${selectedIcon === icon ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="node-notes">Notes (optional)</label>
            <textarea
              id="node-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add description or notes about this node"
              rows={3}
            />
          </div>
        </div>

        <div className="config-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      <style jsx>{`
        .config-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .config-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .config-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .config-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .config-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--quantum-accent);
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .icon-btn {
          width: 100%;
          aspect-ratio: 1;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          border-color: var(--quantum-accent);
          transform: scale(1.1);
        }

        .icon-btn.selected {
          border-color: var(--quantum-accent);
          background: rgba(20, 184, 166, 0.1);
        }

        .config-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-primary {
          background: var(--quantum-accent);
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #0d9488;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}

export default NodeConfigPanel;