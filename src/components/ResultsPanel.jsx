import { useEffect, useState } from 'react';
import { X, Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react';

// Count-up animation hook
function useCountUp(end, duration = 1000, shouldAnimate) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(end);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, shouldAnimate]);

  return count;
}

function ResultsPanel({ isOpen, onClose, showSuccess, workflowResults }) {
  const [hasAnimated, setHasAnimated] = useState(false);

  // Helper to parse percentage strings like "85.50%" to numbers like 85.5
  const parsePercentage = (value) => {
    if (typeof value === 'number') return value * 100;
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', ''));
    }
    return 0;
  };

  // Extract values for animations at component level (not inside conditionals)
  const mlAccuracy = workflowResults?.type === 'ml' 
    ? parsePercentage(workflowResults.summary?.accuracy) 
    : 0;
  const mlPrecision = workflowResults?.type === 'ml'
    ? parsePercentage(workflowResults.summary?.precision)
    : 0;
  const quantumFidelity = workflowResults?.type === 'quantum'
    ? parsePercentage(workflowResults.summary?.fidelity)
    : 0;

  // Call hooks at top level - ALWAYS, not conditionally
  const animatedAccuracy = useCountUp(Math.round(mlAccuracy), 1500, hasAnimated && isOpen);
  const animatedPrecision = useCountUp(Math.round(mlPrecision), 1500, hasAnimated && isOpen);
  const animatedFidelity = useCountUp(Math.round(quantumFidelity), 1500, hasAnimated && isOpen);

  // Reset animation state when panel closes
  useEffect(() => {
    if (!isOpen) {
      setHasAnimated(false);
    } else if (workflowResults) {
      setHasAnimated(true);
    }
  }, [isOpen, workflowResults]);

  if (!isOpen) return null;

  // Handle different result types
  const renderResults = () => {
    if (!workflowResults) {
      return (
        <div className="empty-results">
          <Activity className="empty-icon" />
          <p>No results yet</p>
          <p className="empty-hint">Run your workflow to see results</p>
        </div>
      );
    }

    // Handle error results
    if (workflowResults.type === 'error') {
      return (
        <div className="error-card">
          <AlertCircle className="error-icon" />
          <h3>Execution Error</h3>
          <p className="error-message">{workflowResults.error}</p>
        </div>
      );
    }

    // Handle info results
    if (workflowResults.type === 'info') {
      return (
        <div className="info-card">
          <Activity className="info-icon" />
          <h3>Workflow Complete</h3>
          <p>{workflowResults.message}</p>
          <div className="info-stats">
            <div className="stat-item">
              <span className="stat-label">Nodes Executed</span>
              <span className="stat-value">{workflowResults.nodesExecuted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Execution Time</span>
              <span className="stat-value">{workflowResults.executionTime}ms</span>
            </div>
          </div>
        </div>
      );
    }

    // Success notification (for CSV upload)
if (workflowResults.type === 'success') {
  return (
    <div className="success-notification">
      <div className="success-icon-wrapper">
        <CheckCircle className="success-icon-large" />
      </div>
      <h3 className="success-title">{workflowResults.message}</h3>
      <p className="success-details">{workflowResults.details}</p>
      {workflowResults.filename && (
        <div className="success-filename">
          📄 {workflowResults.filename}
        </div>
      )}
    </div>
  );
}

    // ML Results
    // ML Results
if (workflowResults.type === 'ml') {
  const accuracy = parsePercentage(workflowResults.summary?.accuracy);
  const precision = parsePercentage(workflowResults.summary?.precision);
  const recall = parsePercentage(workflowResults.summary?.recall);
  const f1Score = parsePercentage(workflowResults.summary?.f1Score);

  return (
    <>
      {/* ⚛️ QUANTUM INDICATOR BANNER - Shows when quantum features were used */}
      {workflowResults.quantumTransformed && (
        <div className="quantum-indicator-banner">
          <div className="quantum-badge">
            <span className="quantum-icon">⚛️</span>
            <span className="quantum-text">QUANTUM-ENHANCED ML</span>
          </div>
          
          <div className="quantum-info">
            <div className="info-row">
              <span className="info-label">Encoding Method:</span>
              <span className="info-value">{workflowResults.encodingMethod || 'angle'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value" style={{ color: '#059669' }}>✓ Quantum Features Applied</span>
            </div>
            
            <div className="quantum-desc">
              📊 Your data was transformed using quantum encoding before ML training. 
              This creates a higher-dimensional feature space that may capture complex patterns 
              classical methods might miss.
            </div>
          </div>
        </div>
      )}

      {/* Original ML Card */}
      <div className="result-card ml-card">
        <h3 className="card-title">🧠 Machine Learning</h3>
        
        <div className="metric-row">
          <span className="metric-label">Accuracy</span>
          <span className="metric-value">{animatedAccuracy}%</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill ml-fill"
            style={{ width: `${animatedAccuracy}%` }}
          ></div>
        </div>

        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Precision</span>
            <span className="metric-value-sm">{animatedPrecision}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Recall</span>
            <span className="metric-value-sm">{Math.round(recall)}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">F1 Score</span>
            <span className="metric-value-sm">{Math.round(f1Score)}%</span>
          </div>
        </div>

        <div className="config-info">
          <span className="config-label">Model: {workflowResults.modelType}</span>
          <span className="config-label">
            Samples: {workflowResults.summary?.correctPredictions}/{workflowResults.summary?.totalSamples}
          </span>
        </div>

        {workflowResults.confusionMatrix && (
          <div className="confusion-matrix">
            <div className="matrix-title">Confusion Matrix</div>
            <div className="matrix-grid">
              <div className="matrix-cell tp">
                <span className="cell-label">TP</span>
                <span className="cell-value">{workflowResults.confusionMatrix.tp}</span>
              </div>
              <div className="matrix-cell fp">
                <span className="cell-label">FP</span>
                <span className="cell-value">{workflowResults.confusionMatrix.fp}</span>
              </div>
              <div className="matrix-cell fn">
                <span className="cell-label">FN</span>
                <span className="cell-value">{workflowResults.confusionMatrix.fn}</span>
              </div>
              <div className="matrix-cell tn">
                <span className="cell-label">TN</span>
                <span className="cell-value">{workflowResults.confusionMatrix.tn}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

    // Quantum Results

// Quantum Results
if (workflowResults.type === 'quantum') {
  const fidelity = parsePercentage(workflowResults.summary?.fidelity);

  return (
    <>
      <div className="result-card quantum-card">
        <h3 className="card-title">⚛️ Quantum Circuit</h3>
        
        <div className="metric-row">
          <span className="metric-label">Fidelity</span>
          <span className="metric-value">{animatedFidelity}%</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill quantum-fill"
            style={{ width: `${animatedFidelity}%` }}
          ></div>
        </div>

        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Qubits</span>
            <span className="metric-value-sm">{workflowResults.summary?.numQubits}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Gates</span>
            <span className="metric-value-sm">{workflowResults.summary?.gatesApplied}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Shots</span>
            <span className="metric-value-sm">{workflowResults.summary?.totalShots}</span>
          </div>
        </div>

        {workflowResults.stateVisualization && workflowResults.stateVisualization.length > 0 && (
          <div className="state-section">
            <div className="section-header">
              <div className="state-title">Quantum State Distribution</div>
              <div className="state-description">
                Probability of measuring each quantum state
              </div>
            </div>
            
            {workflowResults.stateVisualization.slice(0, 6).map((state, idx) => (
              <div key={idx} className="state-row">
                <span className="state-label">|{state.state}⟩</span>
                <div className="state-bar-container">
                  <div 
                    className="state-bar"
                    style={{ width: `${state.probability * 100}%` }}
                  />
                </div>
                <span className="state-value">{(state.probability * 100).toFixed(1)}%</span>
              </div>
            ))}
            
            <div className="state-info">
              💡 Each bar shows the probability of the system collapsing to that state when measured
            </div>
          </div>
        )}
      </div>
    </>
  );
}

    // Clustering Results
    if (workflowResults.type === 'clustering') {
      return (
        <>
          <div className="result-card clustering-card">
            <h3 className="card-title">🔮 K-Means Clustering</h3>
            
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Clusters</span>
                <span className="metric-value-sm">{workflowResults.summary?.numClusters}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Iterations</span>
                <span className="metric-value-sm">{workflowResults.summary?.iterations}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Points</span>
                <span className="metric-value-sm">{workflowResults.summary?.totalPoints}</span>
              </div>
            </div>

            {workflowResults.clusters && (
              <div className="clusters-section">
                <div className="state-title">Cluster Distribution</div>
                {workflowResults.clusters.map((cluster, idx) => (
                  <div key={idx} className="state-row">
                    <span className="state-label">Cluster {cluster.id}</span>
                    <div className="state-bar-container">
                      <div 
                        className="state-bar cluster-bar"
                        style={{ width: cluster.percentage }}
                      />
                    </div>
                    <span className="state-value">{cluster.count} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    // Hybrid Results
    if (workflowResults.type === 'hybrid') {
      const mlAcc = parsePercentage(workflowResults.summary?.mlAccuracy);
      const quantumFid = parsePercentage(workflowResults.summary?.quantumFidelity);

      return (
        <>
          <div className="hybrid-badge">
            <Zap size={16} />
            <span>Hybrid Quantum-ML Workflow</span>
          </div>
          
          <div className="result-card ml-card">
            <h3 className="card-title">🧠 ML Component</h3>
            <div className="metric-row">
              <span className="metric-label">Accuracy</span>
              <span className="metric-value">{Math.round(mlAcc)}%</span>
            </div>
          </div>

          <div className="result-card quantum-card">
            <h3 className="card-title">⚛️ Quantum Component</h3>
            <div className="metric-row">
              <span className="metric-label">Fidelity</span>
              <span className="metric-value">{Math.round(quantumFid)}%</span>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const executionTime = workflowResults?.executionTime 
    ? (workflowResults.executionTime / 1000).toFixed(2) 
    : null;

  return (
    <div className={`results-panel ${isOpen ? 'panel-open' : ''}`}>
      {/* Header */}
      <div className="results-header">
        <div className="header-content">
          <Activity className="header-icon" />
          <div>
            <h2>Results</h2>
            {showSuccess && executionTime && (
              <div className="success-badge">
                <CheckCircle size={14} />
                <span>Completed in {executionTime}s</span>
              </div>
            )}
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="results-content">
        {renderResults()}
      </div>

      <style jsx>{`
        .results-panel {
          width: 400px;
          height: 100%;
          background: var(--bg-surface);
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .results-panel.panel-open {
          transform: translateX(0);
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
        }

        .header-icon {
          width: 24px;
          height: 24px;
        }

        .results-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .success-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          margin-top: 4px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          animation: successPop 0.3s ease;
        }

        @keyframes successPop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .results-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .result-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          animation: cardFadeIn 0.5s ease forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        .result-card.ml-card {
          animation-delay: 0.1s;
        }

        .result-card.quantum-card {
          animation-delay: 0.2s;
        }

        .result-card.clustering-card {
          animation-delay: 0.1s;
        }

        @keyframes cardFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .metric-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }

        .metric-value-sm {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .ml-fill {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .quantum-fill {
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .metric-item {
          text-align: center;
          padding: 12px 8px;
          background: var(--bg-surface);
          border-radius: 8px;
        }

        .metric-item .metric-label {
          display: block;
          font-size: 0.75rem;
          margin-bottom: 4px;
        }

        .config-info {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .config-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .confusion-matrix {
          margin-top: 16px;
        }

        .matrix-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .matrix-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .matrix-cell {
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        .matrix-cell.tp {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .matrix-cell.tn {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .matrix-cell.fp {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .matrix-cell.fn {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .cell-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .cell-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .state-section, .clusters-section {
          margin-top: 16px;
        }

        .state-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .state-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .state-label {
          font-size: 0.875rem;
          font-family: 'Courier New', monospace;
          color: var(--text-primary);
          min-width: 80px;
        }

        .state-bar-container {
          flex: 1;
          height: 20px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .state-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cluster-bar {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .state-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 60px;
          text-align: right;
        }

        .hybrid-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 1px solid #fbbf24;
          border-radius: 8px;
          color: #92400e;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 16px;
          animation: cardFadeIn 0.5s ease forwards;
          animation-delay: 0.05s;
          opacity: 0;
        }

        .error-card, .info-card {
          padding: 24px;
          text-align: center;
        }

        .error-icon {
          width: 48px;
          height: 48px;
          color: #ef4444;
          margin: 0 auto 16px;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          color: var(--quantum-accent);
          margin: 0 auto 16px;
        }

        .error-card h3, .info-card h3 {
          margin: 0 0 12px 0;
          color: var(--text-primary);
        }

        .error-message {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 12px;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .info-stats {
          display: flex;
          gap: 16px;
          margin-top: 20px;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          opacity: 0.3;
          margin-bottom: 16px;
        }

        .empty-results p {
          margin: 4px 0;
        }

        .empty-hint {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        /* Section Header Spacing */
.section-header {
  margin-bottom: 20px;
}

.state-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: 0.01em;
}

.state-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0;
}

/* State Section with Better Spacing */
.state-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.state-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 2px 0;
}

.state-label {
  font-size: 0.9375rem;
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
  min-width: 80px;
  font-weight: 500;
}

.state-bar-container {
  flex: 1;
  height: 26px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.state-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 6px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.state-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 2s infinite;
}

.state-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 60px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.state-info {
  margin-top: 20px;
  padding: 14px 16px;
  background: var(--bg-hover);
  border-left: 3px solid var(--quantum-accent);
  border-radius: 6px;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Success Notification */
.success-notification {
  text-align: center;
  padding: 40px 24px;
  animation: cardFadeIn 0.5s ease forwards;
}

.success-icon-wrapper {
  margin: 0 auto 20px;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.success-icon-large {
  width: 36px;
  height: 36px;
  color: white;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.success-details {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.success-filename {
  display: inline-block;
  padding: 8px 16px;
  background: var(--bg-hover);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

/* ⚛️ Quantum Indicator Banner */
.quantum-indicator-banner {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border: 2px solid #8b5cf6;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  animation: slideInFromLeft 0.5s ease;
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.quantum-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.quantum-icon {
  font-size: 20px;
}

.quantum-text {
  letter-spacing: 0.5px;
}

.quantum-info {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #c4b5fd;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-of-type {
  border-bottom: none;
  margin-bottom: 12px;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.info-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 700;
  text-transform: capitalize;
}

.quantum-desc {
  font-size: 13px;
  color: #6b21a8;
  line-height: 1.6;
  background: #faf5ff;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #8b5cf6;
}
      `}</style>
    </div>
  );
}

export default ResultsPanel;