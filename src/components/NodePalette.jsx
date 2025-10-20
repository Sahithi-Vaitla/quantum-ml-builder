import { Database, Sliders, Brain, Atom, BarChart3, Zap, Sparkles } from 'lucide-react';

const nodeTypes = [
  {
    id: 'input',
    label: 'Input Data',
    icon: Database,
    color: '#3b82f6',
    description: 'Load or generate input data for your workflow'
  },
  {
    id: 'preprocess',
    label: 'Preprocess',
    icon: Sliders,
    color: '#8b5cf6',
    description: 'Normalize, transform, or extract features'
  },
  {
    id: 'classical-ml',
    label: 'Classical ML',
    icon: Brain,
    color: '#ec4899',
    description: 'Neural networks, regression, classification'
  },
  {
    id: 'quantum',
    label: 'Quantum Circuit',
    icon: Atom,
    color: '#14b8a6',
    description: 'Design and execute quantum operations'
  },
  {
    id: 'output',
    label: 'Output',
    icon: BarChart3,
    color: '#f59e0b',
    description: 'Visualize results and metrics'
  }
];

function NodePalette({ onLoadTemplate }) {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="node-palette">
      <div className="palette-header">
        <h3>Node Library</h3>
        <p>Drag nodes to the canvas</p>
      </div>

      <div className="palette-content">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <div
              key={nodeType.id}
              className="palette-node"
              draggable
              onDragStart={(e) => onDragStart(e, nodeType)}
              role="button"
              tabIndex={0}
              aria-label={`Drag ${nodeType.label} node to canvas`}
            >
              <div
                className="node-icon"
                style={{ backgroundColor: `${nodeType.color}15` }}
              >
                <Icon size={20} color={nodeType.color} />
              </div>
              <div className="node-info">
                <h4>{nodeType.label}</h4>
                <p>{nodeType.description}</p>
              </div>
              {nodeType.id === 'quantum' && (
                <div className="quantum-indicator">
                  <span className="pulse"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Templates Section */}
      <div className="templates-section">
        <h4 className="templates-title">
          <Sparkles size={14} />
          Quick Start Templates
        </h4>
        <div className="templates-grid">
          <button 
            className="template-btn"
            onClick={() => onLoadTemplate('simple-ml')}
            title="Simple ML workflow"
          >
            <span className="template-icon">🧠</span>
            <span className="template-name">Simple ML</span>
          </button>
          <button 
            className="template-btn"
            onClick={() => onLoadTemplate('quantum-bell')}
            title="Quantum Bell State"
          >
            <span className="template-icon">⚛️</span>
            <span className="template-name">Bell State</span>
          </button>
          <button 
            className="template-btn"
            onClick={() => onLoadTemplate('clustering')}
            title="K-Means Clustering"
          >
            <span className="template-icon">🔮</span>
            <span className="template-name">Clustering</span>
          </button>
          <button 
            className="template-btn"
            onClick={() => onLoadTemplate('full-pipeline')}
            title="Complete ML Pipeline"
          >
            <span className="template-icon">🚀</span>
            <span className="template-name">Full Pipeline</span>
          </button>
        </div>
      </div>


      <div className="palette-footer">
  <div className="tip-box">
    <span className="tip-icon">💡</span>
    <div>
      <p><strong>How to connect:</strong></p>
      <p className="tip-detail">🔵 Blue dots = Inputs (receive data)</p>
      <p className="tip-detail">🟠 Orange dots = Outputs (send data)</p>
      <p className="tip-action">Drag from orange → to blue</p>
    </div>
  </div>
</div>

      <style jsx>{`
        .node-palette {
          background-color: var(--bg-surface);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .palette-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .palette-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .palette-header p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin: 0;
        }

        .palette-content {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .palette-node {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          cursor: grab;
          transition: all 0.2s ease;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
        }

        .palette-node:hover {
          border-color: var(--quantum-accent);
          box-shadow: 0 4px 12px var(--shadow-color);
          transform: translateY(-2px);
        }

        .palette-node:active {
          cursor: grabbing;
          transform: scale(0.98);
        }

        .palette-node:focus-visible {
          outline: 2px solid var(--quantum-accent);
          outline-offset: 2px;
        }

        .node-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .palette-node:hover .node-icon {
          transform: scale(1.15) translateY(-3px);
          animation: float 2s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: scale(1.15) translateY(-3px);
          }
          50% {
            transform: scale(1.15) translateY(-6px);
          }
        }

        .node-info {
          flex: 1;
          min-width: 0;
        }

        .node-info h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .node-info p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        /* Quantum node special indicator */
        .quantum-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .pulse {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--quantum-accent);
          animation: pulse-animation 2s ease-in-out infinite;
        }

        @keyframes pulse-animation {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        .palette-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .tip-box {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .tip-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .tip-box p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .tip-detail {
          margin-top: 4px !important;
        }

        .tip-action {
          margin-top: 8px !important;
          font-weight: 500;
        }

        /* Scrollbar styling for palette content */
        .palette-content::-webkit-scrollbar {
          width: 6px;
        }

        .palette-content::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 3px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .node-palette {
            width: 240px;
          }

          .node-info p {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .node-palette {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 240px;
            z-index: 50;
            box-shadow: 2px 0 8px var(--shadow-color);
          }
        }

        /* Templates Section */
        .templates-section {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
        }

        .templates-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .template-btn {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 10px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-family: inherit;
        }

        .template-btn:hover {
          border-color: var(--quantum-accent);
          background: var(--bg-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px var(--shadow-color);
        }

        .template-btn:active {
          transform: translateY(0);
        }

        .template-icon {
          font-size: 1.25rem;
        }

        .template-name {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-primary);
          text-align: center;
        }

        
      `}</style>
    </aside>
  );
}

export default NodePalette;