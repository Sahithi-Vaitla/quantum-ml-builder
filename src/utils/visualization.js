// Visualization utilities for ML and Quantum results

// Format ML results for display
export function formatMLResults(mlResult) {
  if (!mlResult || mlResult.type !== 'ml-result') return null;

  const { metrics, formattedMetrics, history, config, hybrid } = mlResult;

  return {
    title: 'Machine Learning Results',
    sections: [
      {
        name: 'Model Configuration',
        data: {
          'Model Type': config.modelType,
          'Input Shape': config.inputShape,
          'Number of Classes': config.numClasses,
          'Training Epochs': config.epochs
        }
      },
      {
        name: 'Performance Metrics',
        data: formattedMetrics
      },
      {
        name: 'Training History',
        chart: {
          type: 'line',
          data: {
            labels: Array.from({ length: history.loss.length }, (_, i) => i),
            datasets: [
              {
                label: 'Training Loss',
                data: history.loss,
                color: '#ef4444'
              },
              {
                label: 'Training Accuracy',
                data: history.accuracy,
                color: '#10b981'
              }
            ]
          }
        }
      }
    ],
    hybrid: hybrid?.isHybrid ? {
      type: 'Quantum → ML',
      message: 'This model was trained using quantum-enhanced features'
    } : null
  };
}

// Format Quantum results for display
export function formatQuantumResults(quantumResult) {
  if (!quantumResult || quantumResult.type !== 'quantum-result') return null;

  const { state, probabilities, metrics, formattedMetrics, config, hybrid } = quantumResult;

  return {
    title: 'Quantum Simulation Results',
    sections: [
      {
        name: 'Circuit Configuration',
        data: {
          'Number of Qubits': config.numQubits,
          'Circuit Depth': config.circuitDepth,
          'Shots': config.shots
        }
      },
      {
        name: 'Quantum Metrics',
        data: formattedMetrics
      },
      {
        name: 'State Distribution',
        chart: {
          type: 'bar',
          data: {
            labels: state.map(s => s.state),
            datasets: [
              {
                label: 'Probability',
                data: state.map(s => s.probability),
                color: '#3b82f6'
              }
            ]
          }
        }
      },
      {
        name: 'Quantum States',
        table: {
          headers: ['State', 'Probability', 'Amplitude'],
          rows: state.map(s => [
            s.state,
            (s.probability * 100).toFixed(2) + '%',
            `${s.amplitude.real.toFixed(3)} + ${s.amplitude.imag.toFixed(3)}i`
          ])
        }
      }
    ],
    hybrid: hybrid?.isHybrid ? {
      type: 'ML → Quantum',
      message: 'This quantum circuit was initialized with ML predictions'
    } : null
  };
}

// Format Hybrid workflow results
export function formatHybridResults(mlResult, quantumResult) {
  return {
    title: 'Hybrid Quantum-ML Results',
    sections: [
      {
        name: 'Workflow Summary',
        data: {
          'Workflow Type': 'Hybrid Quantum-Classical',
          'ML Model': mlResult.config.modelType,
          'Quantum Qubits': quantumResult.config.numQubits,
          'Integration': 'Bidirectional'
        }
      },
      {
        name: 'ML Performance',
        data: mlResult.formattedMetrics
      },
      {
        name: 'Quantum Metrics',
        data: quantumResult.formattedMetrics
      },
      {
        name: 'Combined Performance',
        chart: {
          type: 'comparison',
          data: {
            ml: {
              accuracy: mlResult.metrics.accuracy || 0,
              loss: mlResult.history.loss[mlResult.history.loss.length - 1] || 0
            },
            quantum: {
              purity: quantumResult.metrics.purity || 0,
              entropy: quantumResult.metrics.entropy || 0
            }
          }
        }
      }
    ]
  };
}

// Format Output node results
export function formatOutputResults(outputResult) {
  if (!outputResult || outputResult.type !== 'output') return null;

  const { inputs } = outputResult;
  const sections = [];

  // Check what types of inputs we have
  const hasML = inputs.some(i => i.data?.type === 'ml-result');
  const hasQuantum = inputs.some(i => i.data?.type === 'quantum-result');
  const hasPreprocessed = inputs.some(i => i.data?.type === 'preprocessed');

  // Add sections for each input type
  inputs.forEach((input, index) => {
    const data = input.data;
    
    if (data.type === 'ml-result') {
      const mlViz = formatMLResults(data);
      sections.push(...mlViz.sections);
    } else if (data.type === 'quantum-result') {
      const qViz = formatQuantumResults(data);
      sections.push(...qViz.sections);
    } else if (data.type === 'preprocessed') {
      sections.push({
        name: `Preprocessed Data ${index + 1}`,
        data: {
          'Original Shape': `${data.originalShape[0]} × ${data.originalShape[1]}`,
          'New Shape': `${data.newShape[0]} × ${data.newShape[1]}`,
          'Operations': data.operations.join(', ')
        }
      });
    }
  });

  // Check if this is a hybrid workflow
  const isHybrid = hasML && hasQuantum;

  return {
    title: isHybrid ? 'Hybrid Workflow Results' : 'Workflow Results',
    sections,
    summary: {
      'Total Inputs': inputs.length,
      'ML Nodes': inputs.filter(i => i.data?.type === 'ml-result').length,
      'Quantum Nodes': inputs.filter(i => i.data?.type === 'quantum-result').length,
      'Preprocessing Nodes': inputs.filter(i => i.data?.type === 'preprocessed').length,
      'Hybrid Workflow': isHybrid ? 'Yes' : 'No'
    }
  };
}

// Create chart data for results
export function createChartData(results) {
  const charts = [];

  // ML Training History
  if (results.type === 'ml-result' && results.history) {
    charts.push({
      id: 'training-loss',
      title: 'Training Loss Over Time',
      type: 'line',
      data: {
        x: Array.from({ length: results.history.loss.length }, (_, i) => i + 1),
        y: results.history.loss,
        label: 'Loss'
      }
    });

    if (results.history.accuracy) {
      charts.push({
        id: 'training-accuracy',
        title: 'Training Accuracy Over Time',
        type: 'line',
        data: {
          x: Array.from({ length: results.history.accuracy.length }, (_, i) => i + 1),
          y: results.history.accuracy.map(a => a * 100),
          label: 'Accuracy (%)'
        }
      });
    }
  }

  // Quantum State Probabilities
  if (results.type === 'quantum-result' && results.state) {
    charts.push({
      id: 'quantum-probabilities',
      title: 'Quantum State Probabilities',
      type: 'bar',
      data: {
        labels: results.state.map(s => s.state),
        values: results.state.map(s => s.probability * 100),
        label: 'Probability (%)'
      }
    });
  }

  return charts;
}

// Generate summary statistics
export function generateSummary(results) {
  const summary = {
    timestamp: new Date().toISOString(),
    nodeType: results.type,
    status: 'success'
  };

  if (results.type === 'ml-result') {
    summary.model = results.config.modelType;
    summary.accuracy = results.metrics.accuracy;
    summary.finalLoss = results.history.loss[results.history.loss.length - 1];
  } else if (results.type === 'quantum-result') {
    summary.numQubits = results.config.numQubits;
    summary.purity = results.metrics.purity;
    summary.entropy = results.metrics.entropy;
  }

  return summary;
}

// Export results as JSON
export function exportResults(results, filename = 'results.json') {
  const data = {
    timestamp: new Date().toISOString(),
    results,
    summary: generateSummary(results)
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

// Export results as CSV
export function exportResultsCSV(results, filename = 'results.csv') {
  let csv = '';

  if (results.type === 'ml-result') {
    csv = 'Epoch,Loss,Accuracy\n';
    results.history.loss.forEach((loss, i) => {
      csv += `${i + 1},${loss},${results.history.accuracy[i] || ''}\n`;
    });
  } else if (results.type === 'quantum-result') {
    csv = 'State,Probability,Real,Imaginary\n';
    results.state.forEach(s => {
      csv += `${s.state},${s.probability},${s.amplitude.real},${s.amplitude.imag}\n`;
    });
  }

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}