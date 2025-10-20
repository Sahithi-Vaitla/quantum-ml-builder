import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

function CustomNode({ data, id, selected }) {
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);

  // Color scheme based on node type
  const getNodeStyle = () => {
    const styles = {
      input: {
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        icon: '🗄️',
        color: '#3b82f6'
      },
      preprocess: {
        gradient: 'linear-gradient(135deg, #a855f7, #9333ea)',
        icon: '🎛️',
        color: '#a855f7'
      },
      ml: {
        gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
        icon: '🧠',
        color: '#ec4899'
      },
      quantum: {
        gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
        icon: '⚛️',
        color: '#14b8a6'
      },
      output: {
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
        icon: '📊',
        color: '#f97316'
      }
    };

    return styles[data.nodeType] || styles.input;
  };

  const style = getNodeStyle();

  // Check if node is configured
  const isConfigured = () => {
    if (!data.config) return false;
    
    switch (data.nodeType) {
      case 'input':
        return data.customData !== undefined;
      case 'preprocess':
        return data.config.operation !== undefined;
      case 'ml':
        return data.config.modelType !== undefined || data.config.task !== undefined;
      case 'quantum':
        return data.config.circuit && data.config.circuit.length > 0;
      case 'output':
        return true;
      default:
        return false;
    }
  };

  const configured = isConfigured();

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div 
      className={`custom-node ${selected ? 'selected' : ''} ${configured ? 'configured' : 'unconfigured'}`}
      onMouseEnter={() => setShowDeleteBtn(true)}
      onMouseLeave={() => setShowDeleteBtn(false)}
    >
      {/* Configuration Status Badge (clickable for info) */}
      {data.nodeType !== 'output' && (
        <div 
          className={`config-badge ${configured ? 'success' : 'warning'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (data.onConfigClick) {
              data.onConfigClick({ id, data });
            }
          }}
          style={{ cursor: 'pointer' }}
          title="Click to configure"
        >
          {configured ? (
            <CheckCircle2 size={12} />
          ) : (
            <AlertCircle size={12} />
          )}
        </div>
      )}

      {/* Delete Button (shown on hover) */}
      {showDeleteBtn && (
        <button 
          className="delete-btn"
          onClick={handleDelete}
          title="Delete node"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* INPUT Handles (Blue) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="node-handle handle-input handle-left"
        title="Input: Receives data"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="node-handle handle-input handle-top"
        title="Input: Receives data"
      />

      {/* OUTPUT Handles (Orange) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="node-handle handle-output handle-right"
        title="Output: Sends data"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="node-handle handle-output handle-bottom"
        title="Output: Sends data"
      />

      {/* Node Content */}
      <div className="node-content">
        <div className="node-icon" style={{ background: style.gradient }}>
          <span>{style.icon}</span>
        </div>
        <div className="node-label">{data.label}</div>
        
        {/* Configuration Hint */}
        {!configured && data.nodeType !== 'output' && (
          <div className="config-hint">Click ℹ️ to configure</div>
        )}
        
        {data.nodeType === 'quantum' && (
          <div className="quantum-indicator">
            <span className="quantum-pulse"></span>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-node {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          min-width: 180px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .custom-node:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          border-color: ${style.color};
        }

        .custom-node.selected {
          border-color: ${style.color};
          box-shadow: 0 0 0 3px ${style.color}33;
        }

        .custom-node.unconfigured {
          border-color: #fbbf24;
          background: linear-gradient(135deg, #fffbeb, #ffffff);
        }

        .custom-node.configured {
          border-color: #10b981;
        }

        /* Configuration Status Badge */
        .config-badge {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 10;
          transition: transform 0.2s;
        }

        .config-badge:hover {
          transform: scale(1.15);
        }

        .config-badge.success {
          background: #10b981;
          color: white;
        }

        .config-badge.warning {
          background: #fbbf24;
          color: white;
          animation: pulse-badge 2s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        /* Delete Button */
        .delete-btn {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          opacity: 0;
          animation: fadeIn 0.2s forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        .delete-btn:hover {
          background: #dc2626;
          transform: scale(1.15);
        }

        .node-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .node-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .node-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          text-align: center;
        }

        .config-hint {
          font-size: 11px;
          color: #f59e0b;
          background: #fffbeb;
          padding: 4px 10px;
          border-radius: 6px;
          margin-top: 4px;
          font-weight: 600;
          white-space: nowrap;
          border: 1px solid #fde68a;
        }

        /* Quantum Pulse Indicator */
        .quantum-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .quantum-pulse {
          display: block;
          width: 8px;
          height: 8px;
          background: #14b8a6;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }

        /* Connection Handles */
        .node-handle {
          width: 14px !important;
          height: 14px !important;
          border: 3px solid white !important;
          opacity: 1 !important;
          visibility: visible !important;
          transition: all 0.2s !important;
          cursor: crosshair !important;
        }

        .handle-input {
          background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .handle-input:hover {
          transform: scale(1.5) !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
        }

        .handle-output {
          background: linear-gradient(135deg, #f97316, #ea580c) !important;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }

        .handle-output:hover {
          transform: scale(1.5) !important;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3) !important;
        }

        .custom-node:hover .node-handle {
          opacity: 1 !important;
        }

        .react-flow__handle-connecting {
          background: #10b981 !important;
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.4) !important;
          transform: scale(1.6) !important;
        }

        .react-flow__handle-valid {
          background: #10b981 !important;
        }

        .react-flow__handle-invalid {
          background: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}

export default memo(CustomNode);