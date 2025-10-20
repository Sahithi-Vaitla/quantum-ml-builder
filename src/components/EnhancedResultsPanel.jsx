import { useEffect, useRef, useState } from 'react';
import { X, TrendingUp, Target, Activity, Download, BarChart3, PieChart, Zap } from 'lucide-react';
import Chart from 'chart.js/auto';

function EnhancedResultsPanel({ isOpen, onClose, showSuccess, workflowResults }) {
  const [activeTab, setActiveTab] = useState('overview');

  console.log('🔍 DEBUG - quantumTransformed:', workflowResults?.quantumTransformed);
console.log('🔍 DEBUG - encodingMethod:', workflowResults?.encodingMethod);
console.log('🔍 DEBUG - Full object keys:', Object.keys(workflowResults || {}));

  const chartRefs = {
    training: useRef(null),
    confusion: useRef(null),
    quantum: useRef(null),
    distribution: useRef(null)
  };
  const chartInstances = useRef({});

  useEffect(() => {
    if (isOpen && workflowResults) {
      // Clean up old charts
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
      chartInstances.current = {};

      // Create new charts based on result type
      setTimeout(() => {
        if (workflowResults.type === 'ml' || workflowResults.modelType) {
          createMLCharts();
        } else if (workflowResults.type === 'quantum' || workflowResults.circuit) {
          createQuantumCharts();
        }
      }, 100);
    }

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [isOpen, workflowResults, activeTab]);

  const createMLCharts = () => {
    // Training Progress Chart
    if (chartRefs.training.current && workflowResults.trainingHistory) {
      const ctx = chartRefs.training.current.getContext('2d');
      const history = workflowResults.trainingHistory;
      
      chartInstances.current.training = new Chart(ctx, {
        type: 'line',
        data: {
          labels: history.map((_, i) => `Epoch ${i + 1}`),
          datasets: [
            {
              label: 'Training Accuracy',
              data: history.map(h => h.accuracy * 100),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Loss',
              data: history.map(h => h.loss * 100),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 13 }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Accuracy (%)'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Loss'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    }

    // Confusion Matrix Visualization
  // Confusion Matrix Visualization
if (chartRefs.confusion.current && workflowResults.confusionMatrix) {
  const ctx = chartRefs.confusion.current.getContext('2d');
  let matrix = workflowResults.confusionMatrix;
  
  // FIX: Ensure matrix is a proper 2D array
  if (!Array.isArray(matrix)) {
    console.warn('Confusion matrix is not an array, skipping visualization');
    return;
  }

  // FIX: Check if matrix rows are arrays
  if (!Array.isArray(matrix[0])) {
    console.warn('Confusion matrix rows are not arrays, skipping visualization');
    return;
  }

  const classes = matrix.length;

  chartInstances.current.confusion = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: classes }, (_, i) => `Class ${i}`),
      datasets: [{
        label: 'Correct Predictions',
        data: matrix.map((row, i) => row[i] || 0), // Diagonal (correct predictions)
        backgroundColor: '#10b981',
      }, {
        label: 'Misclassifications',
        data: matrix.map((row, i) => {
          const total = row.reduce((sum, val) => sum + (val || 0), 0);
          return total - (row[i] || 0);
        }),
        backgroundColor: '#ef4444',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          stacked: false
        },
        y: {
          stacked: false,
          title: {
            display: true,
            text: 'Count'
          }
        }
      }
    }
  });
}
  };

  const createQuantumCharts = () => {
    // Quantum State Distribution
    if (chartRefs.quantum.current && workflowResults.measurements) {
      const ctx = chartRefs.quantum.current.getContext('2d');
      const measurements = workflowResults.measurements;
      
      // Sort by count
      const sortedStates = Object.entries(measurements)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 states

      chartInstances.current.quantum = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedStates.map(([state]) => `|${state}⟩`),
          datasets: [{
            label: 'Measurement Count',
            data: sortedStates.map(([, count]) => count),
            backgroundColor: sortedStates.map((_, i) => 
              `hsl(${270 - i * 20}, 70%, 60%)`
            ),
            borderColor: sortedStates.map((_, i) => 
              `hsl(${270 - i * 20}, 70%, 50%)`
            ),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = Object.values(measurements).reduce((a, b) => a + b, 0);
                  const percentage = (context.parsed.y / total * 100).toFixed(2);
                  return `Count: ${context.parsed.y} (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Frequency'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Quantum State'
              }
            }
          }
        }
      });
    }

    // Probability Distribution
    if (chartRefs.distribution.current && workflowResults.measurements) {
      const ctx = chartRefs.distribution.current.getContext('2d');
      const measurements = workflowResults.measurements;
      const total = Object.values(measurements).reduce((a, b) => a + b, 0);
      
      const probabilities = Object.entries(measurements)
        .map(([state, count]) => ({
          state,
          probability: count / total
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 8);

      chartInstances.current.distribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: probabilities.map(p => `|${p.state}⟩`),
          datasets: [{
            data: probabilities.map(p => (p.probability * 100).toFixed(2)),
            backgroundColor: [
              '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
              '#ef4444', '#ec4899', '#14b8a6', '#f97316'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed}%`;
                }
              }
            }
          }
        }
      });
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(workflowResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum-ml-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const isMLResult = workflowResults?.type === 'ml' || workflowResults?.modelType;
  const isQuantumResult = workflowResults?.type === 'quantum' || workflowResults?.circuit;
  const isError = workflowResults?.type === 'error';

  return (
    <div className="results-overlay" onClick={onClose}>
      <div className="results-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="panel-header">
          <div className="header-content">
            <Activity className="header-icon" />
            <h2>Workflow Results</h2>
          </div>
          <div className="header-actions">
            {!isError && (
              <button className="download-btn" onClick={downloadResults}>
                <Download size={18} />
                Export
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {showSuccess && !isError && (
          <div className="success-banner">
            <div className="success-icon">✨</div>
            <div className="success-text">
              <div className="success-title">Workflow Executed Successfully!</div>
              <div className="success-subtitle">
                Completed in {workflowResults?.executionTime || 0}ms
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Execution Error</h3>
            <pre className="error-message">{workflowResults.error}</pre>
          </div>
        )}

        {/* Content */}
        {!isError && (
          <>
            {/* Tabs */}
            {(isMLResult || isQuantumResult) && (
              <div className="tabs-container">
                <button
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <Target size={16} />
                  Overview
                </button>
                <button
                  className={`tab ${activeTab === 'visualizations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('visualizations')}
                >
                  <BarChart3 size={16} />
                  Visualizations
                </button>
                <button
                  className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  <Activity size={16} />
                  Details
                </button>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-content">
                {isMLResult && (
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon" style={{ background: '#3b82f6' }}>
                        <Target size={24} />
                      </div>
                      <div className="metric-content">
                        <div className="metric-label">Accuracy</div>
                        <div className="metric-value">
                          {((workflowResults.metrics?.accuracy || 0) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon" style={{ background: '#10b981' }}>
                        <TrendingUp size={24} />
                      </div>
                      <div className="metric-content">
                        <div className="metric-label">Precision</div>
                        <div className="metric-value">
                          {((workflowResults.metrics?.precision || 0) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon" style={{ background: '#f59e0b' }}>
                        <Activity size={24} />
                      </div>
                      <div className="metric-content">
                        <div className="metric-label">Recall</div>
                        <div className="metric-value">
                          {((workflowResults.metrics?.recall || 0) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon" style={{ background: '#8b5cf6' }}>
                        <Zap size={24} />
                      </div>
                      <div className="metric-content">
                        <div className="metric-label">F1 Score</div>
                        <div className="metric-value">
                          {((workflowResults.metrics?.f1Score || 0) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                 {/* Quantum Features Indicator - NEW! */}
                {isMLResult && workflowResults.quantumTransformed && (
                  <div className="quantum-indicator-banner">
                    <div className="quantum-badge">
                      <span className="quantum-icon">⚛️</span>
                      <span className="quantum-text">Quantum-Enhanced ML</span>
                    </div>
                    <div className="quantum-info">
                      <div className="info-row">
                        <span className="info-label">Encoding Method:</span>
                        <span className="info-value">{workflowResults.encodingMethod || 'angle'} embedding</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Features:</span>
                        <span className="info-value">
                          Trained on quantum-transformed features
                        </span>
                      </div>
                      <div className="quantum-desc">
                        Classical data was encoded into quantum states, processed through a quantum circuit, 
                        and extracted as features for machine learning.
                      </div>
                    </div>
                  </div>
                )}

                {isQuantumResult && (
                  <div className="quantum-summary">
                    <div className="summary-card">
                      <h3>Circuit Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Qubits:</span>
                          <span className="info-value">{workflowResults.numQubits}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Gates:</span>
                          <span className="info-value">{workflowResults.circuit?.length || 0}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Shots:</span>
                          <span className="info-value">{workflowResults.shots}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">States Measured:</span>
                          <span className="info-value">
                            {Object.keys(workflowResults.measurements || {}).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="summary-card">
                      <h3>Top Measurement Results</h3>
                      <div className="measurements-list">
                        {Object.entries(workflowResults.measurements || {})
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([state, count]) => {
                            const total = Object.values(workflowResults.measurements).reduce((a, b) => a + b, 0);
                            const percentage = (count / total * 100).toFixed(2);
                            return (
                              <div key={state} className="measurement-item">
                                <span className="state-label">|{state}⟩</span>
                                <div className="measurement-bar">
                                  <div 
                                    className="measurement-fill"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="measurement-value">{percentage}%</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visualizations Tab */}
            {activeTab === 'visualizations' && (
              <div className="tab-content">
                {isMLResult && (
                  <div className="charts-container">
                    {workflowResults.trainingHistory && (
                      <div className="chart-card">
                        <h3>Training Progress</h3>
                        <div className="chart-wrapper">
                          <canvas ref={chartRefs.training}></canvas>
                        </div>
                      </div>
                    )}

                    {workflowResults.confusionMatrix && (
                      <div className="chart-card">
                        <h3>Classification Performance</h3>
                        <div className="chart-wrapper">
                          <canvas ref={chartRefs.confusion}></canvas>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isQuantumResult && (
                  <div className="charts-container">
                    <div className="chart-card">
                      <h3>Measurement Distribution</h3>
                      <div className="chart-wrapper">
                        <canvas ref={chartRefs.quantum}></canvas>
                      </div>
                    </div>

                    <div className="chart-card">
                      <h3>Probability Distribution</h3>
                      <div className="chart-wrapper">
                        <canvas ref={chartRefs.distribution}></canvas>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="tab-content">
                <div className="details-container">
                  <pre className="json-display">
                    {JSON.stringify(workflowResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .results-overlay {
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

        .results-panel {
          background: white;
          border-radius: 16px;
          width: 95%;
          max-width: 1200px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

        .panel-header {
          padding: 24px 28px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          color: rgba(255, 255, 255, 0.9);
        }

        .panel-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .download-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
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

        .success-banner {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 20px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: white;
        }

        .success-icon {
          font-size: 32px;
          animation: bounce 0.6s ease;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .success-text {
          flex: 1;
        }

        .success-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .success-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .error-container {
          padding: 60px 40px;
          text-align: center;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .error-title {
          font-size: 24px;
          font-weight: 700;
          color: #ef4444;
          margin: 0 0 16px 0;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          color: #991b1b;
          text-align: left;
          overflow-x: auto;
          max-height: 300px;
        }

        .tabs-container {
          display: flex;
          gap: 4px;
          padding: 0 28px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #1f2937;
          background: rgba(0, 0, 0, 0.02);
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: linear-gradient(135deg, #f9fafb, #ffffff);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .metric-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .metric-content {
          flex: 1;
        }

        .metric-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .quantum-summary {
          display: grid;
          gap: 24px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .summary-card h3 {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .info-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
        }

        .info-value {
          font-size: 16px;
          color: #1f2937;
          font-weight: 700;
        }

        .measurements-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .measurement-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .state-label {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #8b5cf6;
          min-width: 80px;
        }

        .measurement-bar {
          flex: 1;
          height: 28px;
          background: #f3f4f6;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .measurement-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          transition: width 0.3s ease;
        }

        .measurement-value {
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          min-width: 60px;
          text-align: right;
        }

        .charts-container {
          display: grid;
          gap: 24px;
        }

        .chart-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
        }

        .chart-card h3 {
          margin: 0 0 20px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .chart-wrapper {
          height: 300px;
          position: relative;
        }

        .details-container {
          background: #1f2937;
          border-radius: 12px;
          padding: 24px;
          overflow: hidden;
        }

        .json-display {
          color: #f9fafb;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
          overflow-x: auto;
        }

        /* Quantum Indicator Banner */
        .quantum-indicator-banner {
          background: linear-gradient(135deg, #ede9fe, #ddd6fe);
          border: 2px solid #8b5cf6;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
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

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .tabs-container {
            overflow-x: auto;
          }

          .tab {
            padding: 12px 16px;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}

export default EnhancedResultsPanel;