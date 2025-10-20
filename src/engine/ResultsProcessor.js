/**
 * ResultsProcessor.js
 * Formats computation results for visualization
 */

class ResultsProcessor {
  /**
   * Process ML results for display
   */
processMLResults(mlOutput) {
    const { metrics, predictions, modelType, trainingData, trainingHistory, quantumTransformed, encodingMethod } = mlOutput;

    return {
      type: 'ml',
      modelType,
      metrics: {
        accuracy: metrics.accuracy || 0,
        precision: metrics.precision || 0,
        recall: metrics.recall || 0,
        f1Score: metrics.f1Score || 0
      },
      summary: {
        accuracy: this.formatPercentage(metrics.accuracy),
        precision: this.formatPercentage(metrics.precision),
        recall: this.formatPercentage(metrics.recall),
        f1Score: this.formatPercentage(metrics.f1Score),
        totalSamples: metrics.totalSamples,
        correctPredictions: metrics.correctPredictions
      },
      confusionMatrix: metrics.confusionMatrix,
      trainingHistory: trainingHistory || [],
      quantumTransformed: quantumTransformed || false,
      encodingMethod: encodingMethod || null,
      charts: {
        accuracyChart: this.createAccuracyChart(metrics),
        confusionMatrixChart: this.createConfusionMatrixChart(metrics.confusionMatrix),
        predictionDistribution: this.createPredictionDistribution(predictions)
      },
      rawData: {
        predictions,
        metrics
      }
    };
  }

  /**
   * Process Quantum results for display
   */
  processQuantumResults(quantumOutput) {
    const { measurements, fidelity, visualization, numQubits, gatesApplied, circuit } = quantumOutput;

    return {
      type: 'quantum',
      numQubits: numQubits,
      shots: measurements.shots,
      measurements: measurements.measurements,  // The counts object { "00": 250, "01": 250, ... }
      circuit: circuit.gates || [],  // Array of gates applied
      summary: {
        numQubits,
        gatesApplied,
        fidelity: this.formatPercentage(fidelity),
        totalShots: measurements.shots
      },
      stateVisualization: visualization.slice(0, 10),
      charts: {
        probabilityChart: this.createProbabilityChart(visualization),
        measurementHistogram: this.createMeasurementHistogram(measurements.measurements),
        blochSphere: this.createBlochSphereData(circuit)
      },
      rawData: {
        measurements,
        fidelity,
        stateVector: circuit.stateVector
      }
    };
  }

  /**
   * Process Clustering results for display
   */
  processClusteringResults(clusteringOutput) {
    const { centroids, assignments, k, iterations } = clusteringOutput;

    // Count points per cluster
    const clusterCounts = new Array(k).fill(0);
    assignments.forEach(cluster => clusterCounts[cluster]++);

    return {
      type: 'clustering',
      summary: {
        numClusters: k,
        iterations,
        totalPoints: assignments.length
      },
      clusters: centroids.map((centroid, idx) => ({
        id: idx,
        centroid,
        count: clusterCounts[idx],
        percentage: this.formatPercentage(clusterCounts[idx] / assignments.length)
      })),
      charts: {
        clusterDistribution: this.createClusterDistribution(clusterCounts, k),
        scatterPlot: this.createClusterScatter(clusteringOutput)
      },
      rawData: {
        centroids,
        assignments
      }
    };
  }

  /**
   * Process Hybrid (ML + Quantum) results
   */
  processHybridResults(mlOutput, quantumOutput) {
    return {
      type: 'hybrid',
      summary: {
        workflow: 'ML + Quantum',
        mlAccuracy: this.formatPercentage(mlOutput.metrics.accuracy),
        quantumFidelity: this.formatPercentage(quantumOutput.fidelity),
        totalOperations: mlOutput.metrics.totalSamples + quantumOutput.gatesApplied
      },
      mlResults: this.processMLResults(mlOutput),
      quantumResults: this.processQuantumResults(quantumOutput),
      charts: {
        comparison: this.createHybridComparison(mlOutput, quantumOutput)
      }
    };
  }

  /**
   * Create accuracy chart data
   */
  createAccuracyChart(metrics) {
    return {
      labels: ['Correct', 'Incorrect'],
      datasets: [{
        data: [
          metrics.correctPredictions,
          metrics.totalSamples - metrics.correctPredictions
        ],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2
      }]
    };
  }

  /**
   * Create confusion matrix chart
   */
  createConfusionMatrixChart(confusionMatrix) {
    const { tp, tn, fp, fn } = confusionMatrix;
    
    return {
      labels: ['True Positive', 'True Negative', 'False Positive', 'False Negative'],
      datasets: [{
        data: [tp, tn, fp, fn],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 2
      }]
    };
  }

  /**
   * Create prediction distribution
   */
  createPredictionDistribution(predictions) {
    const distribution = {};
    predictions.forEach(pred => {
      distribution[pred] = (distribution[pred] || 0) + 1;
    });

    return {
      labels: Object.keys(distribution),
      datasets: [{
        label: 'Predictions',
        data: Object.values(distribution),
        backgroundColor: '#667eea',
        borderColor: '#5568d3',
        borderWidth: 2
      }]
    };
  }

  /**
   * Create probability chart for quantum states
   */
  createProbabilityChart(visualization) {
    const topStates = visualization.slice(0, 8);
    
    return {
      labels: topStates.map(v => `|${v.state}⟩`),
      datasets: [{
        label: 'Probability',
        data: topStates.map(v => v.probability),
        backgroundColor: '#667eea',
        borderColor: '#5568d3',
        borderWidth: 2
      }]
    };
  }

  /**
   * Create measurement histogram
   */
  createMeasurementHistogram(measurements) {
    const sorted = Object.entries(measurements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      labels: sorted.map(([state]) => `|${state}⟩`),
      datasets: [{
        label: 'Measurements',
        data: sorted.map(([, count]) => count),
        backgroundColor: '#14b8a6',
        borderColor: '#0d9488',
        borderWidth: 2
      }]
    };
  }

  /**
   * Create Bloch sphere data
   */
  createBlochSphereData(circuit) {
    // For single qubit, calculate Bloch sphere coordinates
    if (circuit.numQubits !== 1) {
      return null;
    }

    const alpha = circuit.stateVector[0];
    const beta = circuit.stateVector[1];

    // Calculate theta and phi
    const theta = 2 * Math.acos(Math.sqrt(alpha.real * alpha.real + alpha.imag * alpha.imag));
    const phi = Math.atan2(beta.imag, beta.real) - Math.atan2(alpha.imag, alpha.real);

    return {
      x: Math.sin(theta) * Math.cos(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(theta)
    };
  }

  /**
   * Create cluster distribution chart
   */
  createClusterDistribution(clusterCounts, k) {
    return {
      labels: Array.from({ length: k }, (_, i) => `Cluster ${i}`),
      datasets: [{
        label: 'Points per Cluster',
        data: clusterCounts,
        backgroundColor: [
          '#667eea', '#764ba2', '#f093fb', '#4facfe',
          '#43e97b', '#fa709a', '#fee140', '#30cfd0'
        ].slice(0, k),
        borderWidth: 2
      }]
    };
  }

  /**
   * Create cluster scatter plot data
   */
  createClusterScatter(clusteringOutput) {
    // Only works for 2D data
    const { centroids, assignments } = clusteringOutput;
    
    return {
      centroids: centroids.map((c, idx) => ({
        x: c[0] || 0,
        y: c[1] || 0,
        cluster: idx
      })),
      assignments
    };
  }

  /**
   * Create hybrid comparison chart
   */
  createHybridComparison(mlOutput, quantumOutput) {
    return {
      labels: ['ML Accuracy', 'Quantum Fidelity'],
      datasets: [{
        label: 'Performance',
        data: [
          mlOutput.metrics.accuracy * 100,
          quantumOutput.fidelity * 100
        ],
        backgroundColor: ['#667eea', '#14b8a6'],
        borderWidth: 2
      }]
    };
  }

  /**
   * Format percentage
   */
  formatPercentage(value) {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  }

  /**
   * Format execution time
   */
  formatExecutionTime(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }

  /**
   * Create summary for results panel
   */
  createSummary(results) {
    const summary = {
      executionTime: this.formatExecutionTime(results.executionTime || 0),
      nodesExecuted: results.nodesExecuted || 0,
      success: results.success || false
    };

    if (results.type === 'ml') {
      summary.primaryMetric = results.summary.accuracy;
      summary.metricName = 'Accuracy';
    } else if (results.type === 'quantum') {
      summary.primaryMetric = results.summary.fidelity;
      summary.metricName = 'Fidelity';
    } else if (results.type === 'clustering') {
      summary.primaryMetric = `${results.summary.numClusters} clusters`;
      summary.metricName = 'Clusters';
    } else if (results.type === 'hybrid') {
      summary.primaryMetric = results.summary.mlAccuracy;
      summary.metricName = 'ML Accuracy';
      summary.secondaryMetric = results.summary.quantumFidelity;
      summary.secondaryName = 'Quantum Fidelity';
    }

    return summary;
  }

  // Add this method to your ResultsProcessor class
// This ensures compatibility with all output formats

/**
 * Process any workflow result - auto-detects type
 */
processWorkflowResult(output) {
  // Detect result type and process accordingly
  if (output.type === 'ml' || output.modelType) {
    return this.processMLResults(output);
  } 
  else if (output.type === 'quantum' || output.circuit) {
    return this.processQuantumResults(output);
  } 
  else if (output.type === 'clustering' || output.centroids) {
    return this.processClusteringResults(output);
  }
  else if (output.type === 'error') {
    return {
      type: 'error',
      message: output.error || output.message || 'Unknown error occurred',
      stack: output.stack
    };
  }
  else {
    // Generic result
    return {
      type: 'info',
      message: 'Workflow executed successfully',
      data: output
    };
  }
}
}

export default ResultsProcessor;