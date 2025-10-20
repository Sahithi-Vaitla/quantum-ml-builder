import { useState } from 'react';
import { X, Brain, Settings, Layers, TrendingUp, Target, Zap } from 'lucide-react';

function MLConfigModal({ isOpen, onClose, csvData, onApply }) {
  const [modelType, setModelType] = useState('perceptron');
  const [task, setTask] = useState('classification');
  const [epochs, setEpochs] = useState(50);
  const [learningRate, setLearningRate] = useState(0.01);
  const [batchSize, setBatchSize] = useState(32);
  const [hiddenLayers, setHiddenLayers] = useState([64, 32]);
  const [k, setK] = useState(3); // For clustering

  if (!isOpen) return null;

  const hasData = csvData && csvData.data && csvData.data.length > 0;

  const modelOptions = [
    {
      id: 'perceptron',
      name: 'Perceptron',
      desc: 'Simple linear classifier',
      icon: '⚡',
      complexity: 'Low',
      speed: 'Very Fast',
      accuracy: 'Moderate'
    },
    {
      id: 'neural-network',
      name: 'Neural Network',
      desc: 'Deep learning model',
      icon: '🧠',
      complexity: 'High',
      speed: 'Moderate',
      accuracy: 'High'
    },
    {
      id: 'svm',
      name: 'SVM',
      desc: 'Support Vector Machine',
      icon: '📐',
      complexity: 'Medium',
      speed: 'Fast',
      accuracy: 'High'
    },
    {
      id: 'decision-tree',
      name: 'Decision Tree',
      desc: 'Tree-based classifier',
      icon: '🌳',
      complexity: 'Low',
      speed: 'Very Fast',
      accuracy: 'Moderate'
    }
  ];

  const handleApply = () => {
    const config = {
      modelType,
      task,
      epochs,
      learningRate,
      batchSize,
      hiddenLayers: modelType === 'neural-network' ? hiddenLayers : null,
      k: task === 'clustering' ? k : null
    };
    onApply(config);
    onClose();
  };

  const addLayer = () => {
    if (hiddenLayers.length < 5) {
      setHiddenLayers([...hiddenLayers, 32]);
    }
  };

  const removeLayer = (index) => {
    if (hiddenLayers.length > 1) {
      setHiddenLayers(hiddenLayers.filter((_, i) => i !== index));
    }
  };

  const updateLayer = (index, value) => {
    const newLayers = [...hiddenLayers];
    newLayers[index] = parseInt(value) || 1;
    setHiddenLayers(newLayers);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <Brain className="header-icon" />
            <h2>ML Model Configuration</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {!hasData ? (
            <div className="no-data-state">
              <Brain size={48} className="no-data-icon" />
              <p className="no-data-text">No data loaded yet</p>
              <p className="no-data-subtext">
                Connect preprocessed data to this ML node first
              </p>
            </div>
          ) : (
            <>
              {/* Task Selection */}
              <div className="config-section">
                <div className="section-header">
                  <Target size={18} />
                  <h3>Learning Task</h3>
                </div>
                
                <div className="task-grid">
                  <button
                    className={`task-card ${task === 'classification' ? 'active' : ''}`}
                    onClick={() => setTask('classification')}
                  >
                    <div className="task-icon">🎯</div>
                    <div className="task-title">Classification</div>
                    <div className="task-desc">Predict categories</div>
                  </button>

                  <button
                    className={`task-card ${task === 'regression' ? 'active' : ''}`}
                    onClick={() => setTask('regression')}
                  >
                    <div className="task-icon">📈</div>
                    <div className="task-title">Regression</div>
                    <div className="task-desc">Predict values</div>
                  </button>

                  <button
                    className={`task-card ${task === 'clustering' ? 'active' : ''}`}
                    onClick={() => setTask('clustering')}
                  >
                    <div className="task-icon">🔵</div>
                    <div className="task-title">Clustering</div>
                    <div className="task-desc">Find patterns</div>
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              {task !== 'clustering' && (
                <div className="config-section">
                  <div className="section-header">
                    <Layers size={18} />
                    <h3>Model Architecture</h3>
                  </div>
                  
                  <div className="model-grid">
                    {modelOptions.map((model) => (
                      <button
                        key={model.id}
                        className={`model-card ${modelType === model.id ? 'active' : ''}`}
                        onClick={() => setModelType(model.id)}
                      >
                        <div className="model-header">
                          <span className="model-icon">{model.icon}</span>
                          <div className="model-info">
                            <div className="model-name">{model.name}</div>
                            <div className="model-desc">{model.desc}</div>
                          </div>
                        </div>
                        <div className="model-stats">
                          <span className="stat">
                            <span className="stat-label">Speed:</span> {model.speed}
                          </span>
                          <span className="stat">
                            <span className="stat-label">Accuracy:</span> {model.accuracy}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Neural Network Architecture */}
              {modelType === 'neural-network' && task !== 'clustering' && (
                <div className="config-section">
                  <div className="section-header">
                    <Layers size={18} />
                    <h3>Hidden Layers</h3>
                  </div>
                  
                  <div className="layers-container">
                    <div className="layer-item input-layer">
                      <div className="layer-label">Input</div>
                      <div className="layer-neurons">
                        {csvData?.meta?.fields?.length || '?'} neurons
                      </div>
                    </div>

                    {hiddenLayers.map((neurons, index) => (
                      <div key={index} className="layer-item">
                        <div className="layer-header">
                          <div className="layer-label">Hidden {index + 1}</div>
                          {hiddenLayers.length > 1 && (
                            <button
                              className="layer-remove-btn"
                              onClick={() => removeLayer(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <input
                          type="number"
                          value={neurons}
                          onChange={(e) => updateLayer(index, e.target.value)}
                          className="layer-input"
                          min="1"
                          max="512"
                        />
                        <div className="layer-neurons">{neurons} neurons</div>
                      </div>
                    ))}

                    {hiddenLayers.length < 5 && (
                      <button className="add-layer-btn" onClick={addLayer}>
                        + Add Layer
                      </button>
                    )}

                    <div className="layer-item output-layer">
                      <div className="layer-label">Output</div>
                      <div className="layer-neurons">
                        {task === 'classification' ? '2' : '1'} neuron(s)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clustering Parameters */}
              {task === 'clustering' && (
                <div className="config-section">
                  <div className="section-header">
                    <Settings size={18} />
                    <h3>Clustering Parameters</h3>
                  </div>
                  
                  <div className="param-row">
                    <label className="param-label">
                      Number of Clusters (k): <strong>{k}</strong>
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={k}
                      onChange={(e) => setK(parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="param-hint">
                      Algorithm will group data into {k} distinct clusters
                    </div>
                  </div>
                </div>
              )}

              {/* Hyperparameters */}
              {task !== 'clustering' && (
                <div className="config-section">
                  <div className="section-header">
                    <Settings size={18} />
                    <h3>Training Parameters</h3>
                  </div>
                  
                  <div className="params-grid">
                    {/* Epochs */}
                    <div className="param-card">
                      <div className="param-header">
                        <TrendingUp size={16} />
                        <span className="param-name">Epochs</span>
                      </div>
                      <input
                        type="number"
                        value={epochs}
                        onChange={(e) => setEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                        className="param-input"
                        min="1"
                        max="1000"
                      />
                      <div className="param-desc">Training iterations</div>
                    </div>

                    {/* Learning Rate */}
                    <div className="param-card">
                      <div className="param-header">
                        <Zap size={16} />
                        <span className="param-name">Learning Rate</span>
                      </div>
                      <select
                        value={learningRate}
                        onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                        className="param-select"
                      >
                        <option value="0.001">0.001 (Slow)</option>
                        <option value="0.01">0.01 (Standard)</option>
                        <option value="0.1">0.1 (Fast)</option>
                        <option value="0.3">0.3 (Very Fast)</option>
                      </select>
                      <div className="param-desc">Step size for updates</div>
                    </div>

                    {/* Batch Size */}
                    <div className="param-card">
                      <div className="param-header">
                        <Layers size={16} />
                        <span className="param-name">Batch Size</span>
                      </div>
                      <select
                        value={batchSize}
                        onChange={(e) => setBatchSize(parseInt(e.target.value))}
                        className="param-select"
                      >
                        <option value="16">16</option>
                        <option value="32">32</option>
                        <option value="64">64</option>
                        <option value="128">128</option>
                      </select>
                      <div className="param-desc">Samples per update</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Training Summary */}
              <div className="summary-section">
                <h4>Configuration Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Task:</span>
                    <span className="summary-value">{task}</span>
                  </div>
                  {task !== 'clustering' ? (
                    <>
                      <div className="summary-item">
                        <span className="summary-label">Model:</span>
                        <span className="summary-value">{modelType}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Epochs:</span>
                        <span className="summary-value">{epochs}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Learning Rate:</span>
                        <span className="summary-value">{learningRate}</span>
                      </div>
                    </>
                  ) : (
                    <div className="summary-item">
                      <span className="summary-label">Clusters:</span>
                      <span className="summary-value">{k}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleApply}
            disabled={!hasData}
          >
            Apply Configuration
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
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

        .modal-container {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 900px;
          max-height: 85vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 24px 28px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          color: rgba(255, 255, 255, 0.9);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        .no-data-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .no-data-icon {
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .no-data-text {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .no-data-subtext {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .config-section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          color: #374151;
        }

        .section-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .task-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .task-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .task-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .task-card.active {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #3b82f615, #2563eb15);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .task-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .task-desc {
          font-size: 13px;
          color: #6b7280;
        }

        .model-grid {
          display: grid;
          gap: 12px;
        }

        .model-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .model-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .model-card.active {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #3b82f615, #2563eb15);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .model-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .model-icon {
          font-size: 24px;
        }

        .model-info {
          flex: 1;
        }

        .model-name {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .model-desc {
          font-size: 13px;
          color: #6b7280;
        }

        .model-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
        }

        .stat {
          color: #6b7280;
        }

        .stat-label {
          font-weight: 600;
        }

        .layers-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .layer-item {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
        }

        .layer-item.input-layer {
          border-color: #10b981;
          background: linear-gradient(135deg, #10b98115, #05966915);
        }

        .layer-item.output-layer {
          border-color: #ef4444;
          background: linear-gradient(135deg, #ef444415, #dc262615);
        }

        .layer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .layer-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .layer-remove-btn {
          background: #ef4444;
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          transition: all 0.2s;
        }

        .layer-remove-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .layer-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 6px;
        }

        .layer-neurons {
          font-size: 12px;
          color: #6b7280;
        }

        .add-layer-btn {
          background: white;
          border: 2px dashed #d1d5db;
          border-radius: 10px;
          padding: 12px;
          color: #3b82f6;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-layer-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .param-row {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
        }

        .param-label {
          display: block;
          margin-bottom: 12px;
          color: #374151;
          font-size: 14px;
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 8px;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.2);
        }

        .param-hint {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }

        .params-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .param-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
        }

        .param-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #374151;
        }

        .param-name {
          font-size: 14px;
          font-weight: 600;
        }

        .param-input,
        .param-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 8px;
          background: white;
        }

        .param-desc {
          font-size: 12px;
          color: #6b7280;
        }

        .summary-section {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 20px;
        }

        .summary-section h4 {
          margin: 0 0 16px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1e40af;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
        }

        .summary-value {
          font-size: 15px;
          color: #1f2937;
          font-weight: 600;
        }

        .modal-footer {
          padding: 20px 28px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f9fafb;
        }

        .btn-secondary,
        .btn-primary {
          padding: 12px 28px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .task-grid {
            grid-template-columns: 1fr;
          }

          .params-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default MLConfigModal;