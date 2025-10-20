import { useState } from 'react';
import { X, Cpu, Zap, RefreshCw, Settings, Plus, Trash2, Eye } from 'lucide-react';

function QuantumConfigModal({ isOpen, onClose, onApply }) {
  const [numQubits, setNumQubits] = useState(3);
  const [shots, setShots] = useState(1000);
  const [encodingMethod, setEncodingMethod] = useState('angle');
  const [circuit, setCircuit] = useState([
    { id: 1, gate: 'H', qubits: [0], params: {} },
    { id: 2, gate: 'CNOT', qubits: [0, 1], params: {} },
    { id: 3, gate: 'H', qubits: [2], params: {} }
  ]);
  const [showCircuitPreview, setShowCircuitPreview] = useState(true);

   const clearCircuit = () => {
    setCircuit([
      { id: 1, gate: 'H', qubits: [0], params: {} },
      { id: 2, gate: 'CNOT', qubits: [0, 1], params: {} },
      { id: 3, gate: 'H', qubits: [2], params: {} }
    ]);
  };


  if (!isOpen) return null;

  const availableGates = [
    { 
      id: 'H', 
      name: 'Hadamard', 
      symbol: 'H',
      qubits: 1, 
      color: '#3b82f6',
      desc: 'Creates superposition' 
    },
    { 
      id: 'X', 
      name: 'Pauli-X', 
      symbol: 'X',
      qubits: 1, 
      color: '#ef4444',
      desc: 'Quantum NOT gate' 
    },
    { 
      id: 'Y', 
      name: 'Pauli-Y', 
      symbol: 'Y',
      qubits: 1, 
      color: '#f59e0b',
      desc: 'Y-axis rotation' 
    },
    { 
      id: 'Z', 
      name: 'Pauli-Z', 
      symbol: 'Z',
      qubits: 1, 
      color: '#8b5cf6',
      desc: 'Phase flip gate' 
    },
    { 
      id: 'CNOT', 
      name: 'CNOT', 
      symbol: '⊕',
      qubits: 2, 
      color: '#10b981',
      desc: 'Controlled NOT' 
    },
    { 
      id: 'RX', 
      name: 'RX', 
      symbol: 'Rx',
      qubits: 1, 
      color: '#ec4899',
      desc: 'X-rotation',
      hasParam: true 
    },
    { 
      id: 'RY', 
      name: 'RY', 
      symbol: 'Ry',
      qubits: 1, 
      color: '#14b8a6',
      desc: 'Y-rotation',
      hasParam: true 
    },
    { 
      id: 'RZ', 
      name: 'RZ', 
      symbol: 'Rz',
      qubits: 1, 
      color: '#f97316',
      desc: 'Z-rotation',
      hasParam: true 
    }
  ];

  const addGate = (gateType) => {
    const gate = availableGates.find(g => g.id === gateType);
    const newGate = {
      id: Date.now(),
      gate: gateType,
      qubits: gate.qubits === 1 ? [0] : [0, 1],
      params: gate.hasParam ? { angle: Math.PI / 2 } : {}
    };
    setCircuit([...circuit, newGate]);
  };

  const removeGate = (id) => {
    setCircuit(circuit.filter(g => g.id !== id));
  };

  const updateGateQubit = (gateId, qubitIndex, newQubit) => {
    setCircuit(circuit.map(g => {
      if (g.id === gateId) {
        const newQubits = [...g.qubits];
        newQubits[qubitIndex] = parseInt(newQubit);
        return { ...g, qubits: newQubits };
      }
      return g;
    }));
  };

  const updateGateParam = (gateId, value) => {
    setCircuit(circuit.map(g => {
      if (g.id === gateId) {
        return { ...g, params: { angle: parseFloat(value) } };
      }
      return g;
    }));
  };

 const handleApply = () => {
    const config = {
      numQubits,
      shots,
      encodingMethod,
      circuit: circuit.map(g => ({
        gate: g.gate,
        qubits: g.qubits,
        params: g.params
      }))
    };
    onApply(config);
    onClose();
  };

  // Render circuit visualization
  const renderCircuitDiagram = () => {
    const qubitLines = [];
    for (let i = 0; i < numQubits; i++) {
      qubitLines.push(
        <div key={i} className="qubit-line">
          <div className="qubit-label">|q{i}⟩</div>
          <div className="qubit-wire">
            {circuit.map((gate, gateIndex) => {
              const gateInfo = availableGates.find(g => g.id === gate.gate);
              
              // Single qubit gate
              if (gate.qubits.length === 1 && gate.qubits[0] === i) {
                return (
                  <div 
                    key={`${gate.id}-${i}`} 
                    className="circuit-gate"
                    style={{ 
                      background: gateInfo.color,
                      left: `${gateIndex * 80 + 20}px`
                    }}
                  >
                    {gateInfo.symbol}
                    {gate.params.angle !== undefined && (
                      <div className="gate-param">
                        {(gate.params.angle / Math.PI).toFixed(2)}π
                      </div>
                    )}
                  </div>
                );
              }
              
              // CNOT control
              if (gate.gate === 'CNOT' && gate.qubits[0] === i) {
                return (
                  <div 
                    key={`${gate.id}-${i}`} 
                    className="cnot-control"
                    style={{ left: `${gateIndex * 80 + 20}px` }}
                  >
                    <div className="control-dot"></div>
                    <div 
                      className="control-line"
                      style={{
                        height: `${Math.abs(gate.qubits[1] - gate.qubits[0]) * 60}px`,
                        top: gate.qubits[1] > gate.qubits[0] ? '20px' : 'auto',
                        bottom: gate.qubits[1] < gate.qubits[0] ? '20px' : 'auto'
                      }}
                    ></div>
                  </div>
                );
              }
              
              // CNOT target
              if (gate.gate === 'CNOT' && gate.qubits[1] === i) {
                return (
                  <div 
                    key={`${gate.id}-${i}`} 
                    className="cnot-target"
                    style={{ left: `${gateIndex * 80 + 20}px` }}
                  >
                    <div className="target-symbol">⊕</div>
                  </div>
                );
              }
              
              return null;
            })}
          </div>
          <div className="measurement-box">M</div>
        </div>
      );
    }
    return qubitLines;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <Cpu className="header-icon" />
            <h2>Quantum Circuit Configuration</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Quantum Settings */}
          <div className="config-section">
            <div className="section-header">
              <Settings size={18} />
              <h3>Quantum System</h3>
            </div>
            
            <div className="quantum-params">
              <div className="param-box">
                <label className="param-label">
                  Number of Qubits: <strong>{numQubits}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={numQubits}
                  onChange={(e) => {
                    const newNum = parseInt(e.target.value);
                    setNumQubits(newNum);
                    // Clear circuit when changing qubit count
                    setCircuit([]);
                  }}
                  className="slider"
                />
                <div className="param-hint">
                  {numQubits} qubit(s) = {Math.pow(2, numQubits)} possible states
                </div>
              </div>

              <div className="param-box">
                <label className="param-label">
                  Measurement Shots: <strong>{shots}</strong>
                </label>
                <select
                  value={shots}
                  onChange={(e) => setShots(parseInt(e.target.value))}
                  className="param-select"
                >
                  <option value="100">100 (Fast)</option>
                  <option value="500">500 (Balanced)</option>
                  <option value="1000">1000 (Accurate)</option>
                  <option value="5000">5000 (High Precision)</option>
                </select>
                <div className="param-hint">
                  Number of times to run the circuit
                </div>
              </div>
            </div>
          </div>


           {/* Data Encoding Section */}
          <div className="config-section encoding-section">
            <div className="section-header">
              <Zap size={18} />
              <h3>Data Encoding</h3>
              <div className="hybrid-badge">
                <span className="hybrid-icon">🔗</span>
                Hybrid Mode
              </div>
            </div>
            
            <div className="encoding-explainer">
              <p>
                When quantum follows preprocessing, classical data is encoded into quantum states using one of these methods:
              </p>
            </div>

            <div className="encoding-methods">
              <div 
                className={`encoding-option ${encodingMethod === 'basis' ? 'selected' : ''}`}
                onClick={() => setEncodingMethod('basis')}
              >
                <div className="option-header">
                  <div className="option-radio">
                    {encodingMethod === 'basis' && <div className="radio-dot"></div>}
                  </div>
                  <div className="option-title">Basis Embedding</div>
                </div>
                <div className="option-desc">
                  Maps binary data to computational basis states like |00⟩, |01⟩, |10⟩, |11⟩
                </div>
                <div className="option-example">
                  Example: [1, 0] → |10⟩
                </div>
              </div>

              <div 
                className={`encoding-option ${encodingMethod === 'angle' ? 'selected' : ''}`}
                onClick={() => setEncodingMethod('angle')}
              >
                <div className="option-header">
                  <div className="option-radio">
                    {encodingMethod === 'angle' && <div className="radio-dot"></div>}
                  </div>
                  <div className="option-title">Angle Embedding ⭐ Recommended</div>
                </div>
                <div className="option-desc">
                  Encodes features as rotation angles using RY gates - works well with normalized data
                </div>
                <div className="option-example">
                  Example: [0.5, 0.8] → RY(0.5π), RY(0.8π)
                </div>
              </div>

              <div 
                className={`encoding-option ${encodingMethod === 'amplitude' ? 'selected' : ''}`}
                onClick={() => setEncodingMethod('amplitude')}
              >
                <div className="option-header">
                  <div className="option-radio">
                    {encodingMethod === 'amplitude' && <div className="radio-dot"></div>}
                  </div>
                  <div className="option-title">Amplitude Embedding</div>
                </div>
                <div className="option-desc">
                  Encodes data directly as quantum state amplitudes - most data-efficient
                </div>
                <div className="option-example">
                  Example: [0.6, 0.8] → 0.6|0⟩ + 0.8|1⟩
                </div>
              </div>
            </div>

            <div className="encoding-info">
              <div className="info-icon">💡</div>
              <div>
                <strong>Hybrid Workflow Detected:</strong> When quantum follows preprocessing, 
                your data will be encoded using <strong>{encodingMethod}</strong> embedding before applying gates. 
                The quantum circuit will then extract features for the ML block to use.
              </div>
            </div>
          </div>

          {/* Gate Palette */}
          <div className="config-section">
            <div className="section-header">
              <Zap size={18} />
              <h3>Quantum Gates</h3>
            </div>
            
            <div className="gates-palette">
              {availableGates.map((gate) => (
                <button
                  key={gate.id}
                  className="gate-btn"
                  onClick={() => addGate(gate.id)}
                  style={{ borderColor: gate.color }}
                >
                  <div 
                    className="gate-symbol"
                    style={{ background: gate.color }}
                  >
                    {gate.symbol}
                  </div>
                  <div className="gate-info">
                    <div className="gate-name">{gate.name}</div>
                    <div className="gate-desc">{gate.desc}</div>
                  </div>
                  <Plus size={16} className="gate-add-icon" />
                </button>
              ))}
            </div>
          </div>

          {/* Circuit Builder */}
          <div className="config-section">
            <div className="section-header">
              <RefreshCw size={18} />
              <h3>Circuit Operations ({circuit.length} gates)</h3>
              <div className="header-actions">
                <button 
                  className="preview-toggle"
                  onClick={() => setShowCircuitPreview(!showCircuitPreview)}
                >
                  <Eye size={16} />
                  {showCircuitPreview ? 'Hide' : 'Show'} Preview
                </button>
                {circuit.length > 0 && (
                  <button className="clear-btn" onClick={clearCircuit}>
                    <Trash2 size={16} />
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {circuit.length === 0 ? (
              <div className="empty-circuit">
                <p>No gates added yet</p>
                <p className="empty-hint">Click on gates above to build your quantum circuit</p>
              </div>
            ) : (
              <div className="circuit-list">
                {circuit.map((gate, index) => {
                  const gateInfo = availableGates.find(g => g.id === gate.gate);
                  return (
                    <div key={gate.id} className="circuit-item">
                      <div className="item-number">{index + 1}</div>
                      <div 
                        className="item-gate"
                        style={{ background: gateInfo.color }}
                      >
                        {gateInfo.symbol}
                      </div>
                      <div className="item-details">
                        <div className="item-name">{gateInfo.name}</div>
                        <div className="item-qubits">
                          {gate.qubits.length === 1 ? (
                            <>
                              Qubit: 
                              <select
                                value={gate.qubits[0]}
                                onChange={(e) => updateGateQubit(gate.id, 0, e.target.value)}
                                className="qubit-select"
                              >
                                {Array.from({ length: numQubits }, (_, i) => (
                                  <option key={i} value={i}>q{i}</option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <>
                              Control: 
                              <select
                                value={gate.qubits[0]}
                                onChange={(e) => updateGateQubit(gate.id, 0, e.target.value)}
                                className="qubit-select"
                              >
                                {Array.from({ length: numQubits }, (_, i) => (
                                  <option key={i} value={i}>q{i}</option>
                                ))}
                              </select>
                              Target: 
                              <select
                                value={gate.qubits[1]}
                                onChange={(e) => updateGateQubit(gate.id, 1, e.target.value)}
                                className="qubit-select"
                              >
                                {Array.from({ length: numQubits }, (_, i) => (
                                  <option key={i} value={i}>q{i}</option>
                                ))}
                              </select>
                            </>
                          )}
                        </div>
                        {gate.params.angle !== undefined && (
                          <div className="item-param">
                            Angle: 
                            <input
                              type="number"
                              step="0.1"
                              value={(gate.params.angle / Math.PI).toFixed(2)}
                              onChange={(e) => updateGateParam(gate.id, parseFloat(e.target.value) * Math.PI)}
                              className="angle-input"
                            />
                            π
                          </div>
                        )}
                      </div>
                      <button 
                        className="item-remove"
                        onClick={() => removeGate(gate.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Circuit Visualization */}
          {showCircuitPreview && circuit.length > 0 && (
            <div className="config-section preview-section">
              <h3>Circuit Diagram</h3>
              <div className="circuit-diagram">
                {renderCircuitDiagram()}
              </div>
            </div>
          )}

          {/* Circuit Summary */}
          {circuit.length > 0 && (
            <div className="summary-section">
              <h4>Configuration Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Qubits:</span>
                  <span className="summary-value">{numQubits}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Gates:</span>
                  <span className="summary-value">{circuit.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Shots:</span>
                  <span className="summary-value">{shots}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">States:</span>
                  <span className="summary-value">{Math.pow(2, numQubits)}</span>
                </div>
              </div>
            </div>
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
            disabled={circuit.length === 0}
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
          max-width: 1000px;
          max-height: 90vh;
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
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
          flex: 1;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .preview-toggle,
        .clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preview-toggle:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .clear-btn {
          color: #ef4444;
          border-color: #fca5a5;
        }

        .clear-btn:hover {
          background: #fee2e2;
          border-color: #ef4444;
        }

        .quantum-params {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .param-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
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
          background: #8b5cf6;
          cursor: pointer;
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #7c3aed;
          transform: scale(1.2);
        }

        .param-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          margin-bottom: 8px;
        }

        .param-hint {
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }

        .gates-palette {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .gate-btn {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .gate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gate-symbol {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .gate-info {
          flex: 1;
          text-align: left;
        }

        .gate-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        .gate-desc {
          font-size: 11px;
          color: #6b7280;
        }

        .gate-add-icon {
          color: #9ca3af;
        }

        .empty-circuit {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }

        .empty-circuit p {
          margin: 0 0 8px 0;
          font-size: 16px;
        }

        .empty-hint {
          font-size: 13px !important;
        }

        .circuit-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .circuit-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .item-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #6b7280;
          font-size: 13px;
          flex-shrink: 0;
        }

        .item-gate {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-name {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }

        .item-qubits,
        .item-param {
          font-size: 13px;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .qubit-select,
        .angle-input {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }

        .angle-input {
          width: 60px;
        }

        .item-remove {
          background: #fee2e2;
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .item-remove:hover {
          background: #fecaca;
          transform: scale(1.05);
        }

        .preview-section {
          background: #f9fafb;
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }

        .preview-section h3 {
          margin: 0 0 20px 0;
          font-size: 15px;
          font-weight: 600;
          color: #374151;
        }

        .circuit-diagram {
          background: white;
          border-radius: 10px;
          padding: 20px;
          overflow-x: auto;
        }

        .qubit-line {
          display: flex;
          align-items: center;
          height: 60px;
          position: relative;
        }

        .qubit-label {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          width: 40px;
          flex-shrink: 0;
        }

        .qubit-wire {
          flex: 1;
          height: 2px;
          background: #d1d5db;
          position: relative;
          margin: 0 10px;
        }

        .measurement-box {
          width: 32px;
          height: 32px;
          border: 2px solid #6b7280;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #6b7280;
          font-size: 14px;
          flex-shrink: 0;
          background: white;
        }

        .circuit-gate {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          transform: translateY(-50%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .gate-param {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .cnot-control,
        .cnot-target {
          position: absolute;
          transform: translateY(-50%);
        }

        .control-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
        }

        .control-line {
          position: absolute;
          width: 2px;
          background: #10b981;
          left: 5px;
        }

        .target-symbol {
          width: 40px;
          height: 40px;
          border: 3px solid #10b981;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #10b981;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }

        .summary-section {
          background: linear-gradient(135deg, #f3e8ff, #ede9fe);
          border: 2px solid #8b5cf6;
          border-radius: 12px;
          padding: 20px;
        }

        .summary-section h4 {
          margin: 0 0 16px 0;
          font-size: 15px;
          font-weight: 600;
          color: #6b21a8;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
          font-size: 18px;
          color: #1f2937;
          font-weight: 700;
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
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Encoding Section Styles */
        .encoding-section {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 24px;
        }

        .hybrid-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .hybrid-icon {
          font-size: 14px;
        }

        .encoding-explainer {
          background: white;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 16px;
          border: 1px solid #bfdbfe;
        }

        .encoding-explainer p {
          margin: 0;
          font-size: 13px;
          color: #1e40af;
          line-height: 1.6;
        }

        .encoding-methods {
          display: grid;
          gap: 12px;
          margin-bottom: 16px;
        }

        .encoding-option {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .encoding-option:hover {
          border-color: #3b82f6;
          transform: translateX(4px);
        }

        .encoding-option.selected {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff, white);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .option-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .encoding-option.selected .option-radio {
          border-color: #3b82f6;
        }

        .radio-dot {
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .option-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }

        .option-desc {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 8px;
          padding-left: 32px;
        }

        .option-example {
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: #3b82f6;
          background: #eff6ff;
          padding: 8px 12px;
          border-radius: 6px;
          margin-left: 32px;
          border-left: 3px solid #3b82f6;
        }

        .encoding-info {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 14px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .encoding-info div {
          font-size: 13px;
          color: #92400e;
          line-height: 1.6;
        }

        .encoding-info strong {
          color: #78350f;
        }

        @media (max-width: 768px) {
          .gates-palette {
            grid-template-columns: 1fr;
          }

          .quantum-params {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default QuantumConfigModal;