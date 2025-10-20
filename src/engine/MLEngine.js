/**
 * MLEngine.js
 * Machine Learning algorithms and training
 * Supports: Classification, Regression, Clustering
 * 
 * TWO MODES:
 * 1. Simple algorithms (perceptron, logistic, knn) - fast, no dependencies
 * 2. TensorFlow.js neural networks - powerful, requires @tensorflow/tfjs
 */

import * as tf from '@tensorflow/tfjs';

class MLEngine {
  constructor() {
    this.models = new Map();
    this.tfInitialized = false;
  }

  /**
   * Initialize TensorFlow.js (only when needed)
   */
  async initializeTF() {
    if (!this.tfInitialized) {
      try {
        await tf.ready();
        console.log('✅ TensorFlow.js initialized');
        console.log('Backend:', tf.getBackend());
        this.tfInitialized = true;
      } catch (error) {
        console.warn('⚠️ TensorFlow.js not available, using simple algorithms only');
      }
    }
  }

  /**
   * Train a classification model
   */
  async trainClassifier(data, config) {
    const { features, labels } = data;
    const { 
      modelType = 'perceptron', 
      epochs = 50, 
      learningRate = 0.01,
      hiddenUnits = [8]
    } = config;

    console.log(`🧠 Training ${modelType} classifier...`);

    // Check if user wants TensorFlow.js neural networks
    if (modelType === 'neural-network' || modelType === 'deep-network') {
      return await this.trainTensorFlowModel(data, config);
    }

    // Otherwise use simple algorithms (original code)
    let model;
    switch (modelType) {
      case 'perceptron':
        model = this.trainPerceptron(features, labels, epochs, learningRate);
        break;
      case 'logistic':
        model = this.trainLogisticRegression(features, labels, epochs, learningRate);
        break;
      case 'knn':
        model = this.trainKNN(features, labels, config.k || 3);
        break;
      default:
        throw new Error(`Unknown model type: ${modelType}`);
    }

    
    // Calculate training metrics
    const predictions = this.predict(model, features);
    const metrics = this.calculateMetrics(predictions, labels);

    return {
      type: 'ml',
      model,
      modelType,
      predictions,
      metrics,
      trainingHistory: model.history || [], // Add training history!
      trainingData: { features, labels }
    };
  }

  /**
   * Train TensorFlow.js neural network (NEW!)
   */
  async trainTensorFlowModel(data, config) {
    await this.initializeTF();

    const { features, labels } = data;
    const {
      modelType = 'neural-network',
      epochs = 50,
      learningRate = 0.01,
      hiddenUnits = [8]
    } = config;

    console.log(`🧠 Training TensorFlow ${modelType}...`);

    try {
      // Convert to tensors
      const xs = tf.tensor2d(features);
      const ys = tf.tensor1d(labels, 'int32');

      // Determine number of classes
      const numClasses = Math.max(...labels) + 1;
      const yOneHot = tf.oneHot(ys, numClasses);

      // Create model
      const model = this.createTFModel(
        features[0].length,
        numClasses,
        modelType,
        hiddenUnits
      );

      // Compile
      model.compile({
        optimizer: tf.train.adam(learningRate),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      // Train
      const history = await model.fit(xs, yOneHot, {
        epochs,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0 || epoch === epochs - 1) {
              console.log(
                `Epoch ${epoch + 1}/${epochs}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`
              );
            }
          }
        }
      });

      // Predictions
      const predictions = model.predict(xs);
      const predictedClasses = predictions.argMax(-1).dataSync();

      // Metrics
      const accuracy = this.calculateAccuracy(labels, Array.from(predictedClasses));
      const confusionMatrix = this.calculateConfusionMatrixMulticlass(
        labels,
        Array.from(predictedClasses),
        numClasses
      );

      // Cleanup
      xs.dispose();
      ys.dispose();
      yOneHot.dispose();
      predictions.dispose();

      console.log(`✅ Training complete! Accuracy: ${(accuracy * 100).toFixed(2)}%`);

      return {
        type: 'ml',
        modelType,
        metrics: {
          accuracy,
          loss: history.history.loss[history.history.loss.length - 1],
          confusionMatrix,
          trainingHistory: {
            loss: history.history.loss,
            accuracy: history.history.acc
          }
        },
        predictions: Array.from(predictedClasses),
        features,
        labels,
        numClasses,
        epochs
      };

    } catch (error) {
      console.error('❌ TensorFlow training failed:', error);
      throw new Error(`TensorFlow training failed: ${error.message}`);
    }
  }

  /**
   * Create TensorFlow model (NEW!)
   */
  createTFModel(inputSize, outputSize, modelType, hiddenUnits) {
    const model = tf.sequential();

    switch (modelType) {
      case 'neural-network':
        model.add(tf.layers.dense({
          units: hiddenUnits[0],
          inputShape: [inputSize],
          activation: 'relu'
        }));
        
        if (hiddenUnits.length > 1) {
          model.add(tf.layers.dense({
            units: hiddenUnits[1],
            activation: 'relu'
          }));
        }

        model.add(tf.layers.dense({
          units: outputSize,
          activation: 'softmax'
        }));
        break;

      case 'deep-network':
        model.add(tf.layers.dense({
          units: hiddenUnits[0] || 16,
          inputShape: [inputSize],
          activation: 'relu'
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));

        model.add(tf.layers.dense({
          units: hiddenUnits[1] || 8,
          activation: 'relu'
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));

        model.add(tf.layers.dense({
          units: outputSize,
          activation: 'softmax'
        }));
        break;

      default:
        model.add(tf.layers.dense({
          units: outputSize,
          inputShape: [inputSize],
          activation: 'softmax'
        }));
    }

    return model;
  }

  /**
   * Simple Perceptron implementation (ORIGINAL)
   */
  trainPerceptron(features, labels, epochs, learningRate) {
    const numFeatures = features[0].length;
    let weights = new Array(numFeatures).fill(0);
    let bias = 0;
    const history = []; // Track training history

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      let correct = 0;

      for (let i = 0; i < features.length; i++) {
        const x = features[i];
        const y = labels[i];

        let activation = bias;
        for (let j = 0; j < numFeatures; j++) {
          activation += weights[j] * x[j];
        }
        const prediction = activation >= 0 ? 1 : 0;

        if (prediction === y) correct++;

        const error = y - prediction;
        if (error !== 0) {
          totalError += Math.abs(error);
          bias += learningRate * error;
          for (let j = 0; j < numFeatures; j++) {
            weights[j] += learningRate * error * x[j];
          }
        }
      }

      // Track accuracy and loss for this epoch
      const accuracy = correct / features.length;
      const loss = totalError / features.length;
      history.push({ accuracy, loss });

      if (totalError === 0) break;
    }

    return { type: 'perceptron', weights, bias, history };
  }

  /**
   * Logistic Regression implementation (ORIGINAL)
   */
  trainLogisticRegression(features, labels, epochs, learningRate) {
    const numFeatures = features[0].length;
    let weights = new Array(numFeatures).fill(0);
    let bias = 0;
    const history = []; // Track training history

    const sigmoid = (z) => 1 / (1 + Math.exp(-z));

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      let correct = 0;

      for (let i = 0; i < features.length; i++) {
        const x = features[i];
        const y = labels[i];

        let z = bias;
        for (let j = 0; j < numFeatures; j++) {
          z += weights[j] * x[j];
        }
        const prediction = sigmoid(z);

        // Binary cross-entropy loss
        totalLoss += -(y * Math.log(prediction + 1e-15) + (1 - y) * Math.log(1 - prediction + 1e-15));

        // Check accuracy
        const predictedClass = prediction >= 0.5 ? 1 : 0;
        if (predictedClass === y) correct++;

        const error = prediction - y;
        bias -= learningRate * error;
        for (let j = 0; j < numFeatures; j++) {
          weights[j] -= learningRate * error * x[j];
        }
      }

      // Track accuracy and loss for this epoch
      const accuracy = correct / features.length;
      const loss = totalLoss / features.length;
      history.push({ accuracy, loss });
    }

    return { type: 'logistic', weights, bias, history };
  }

  /**
   * K-Nearest Neighbors implementation (ORIGINAL)
   */
  trainKNN(features, labels, k) {
    return {
      type: 'knn',
      features,
      labels,
      k
    };
  }

  /**
   * Make predictions (ORIGINAL)
   */
  predict(model, features) {
    const predictions = [];

    for (let i = 0; i < features.length; i++) {
      const x = features[i];
      let prediction;

      switch (model.type) {
        case 'perceptron':
          let activation = model.bias;
          for (let j = 0; j < x.length; j++) {
            activation += model.weights[j] * x[j];
          }
          prediction = activation >= 0 ? 1 : 0;
          break;

        case 'logistic':
          let z = model.bias;
          for (let j = 0; j < x.length; j++) {
            z += model.weights[j] * x[j];
          }
          const sigmoid = (val) => 1 / (1 + Math.exp(-val));
          prediction = sigmoid(z) >= 0.5 ? 1 : 0;
          break;

        case 'knn':
          prediction = this.knnPredict(model, x);
          break;

        default:
          prediction = 0;
      }

      predictions.push(prediction);
    }

    return predictions;
  }

  /**
   * KNN prediction helper (ORIGINAL)
   */
  knnPredict(model, x) {
    const distances = model.features.map((trainX, idx) => {
      const dist = this.euclideanDistance(x, trainX);
      return { dist, label: model.labels[idx] };
    });

    distances.sort((a, b) => a.dist - b.dist);
    const kNearest = distances.slice(0, model.k);

    const votes = {};
    kNearest.forEach(neighbor => {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    });

    return parseInt(Object.keys(votes).reduce((a, b) => 
      votes[a] > votes[b] ? a : b
    ));
  }

  /**
   * K-Means Clustering (ORIGINAL)
   */
  async trainClustering(data, config) {
    const { features } = data;
    const { k = 3, maxIterations = 100 } = config;

    console.log(`🔮 Running K-Means clustering with k=${k}...`);

    let centroids = this.initializeCentroids(features, k);
    let assignments = new Array(features.length).fill(0);
    let converged = false;
    let iteration = 0;

    while (!converged && iteration < maxIterations) {
      const newAssignments = features.map(point => 
        this.nearestCentroid(point, centroids)
      );

      converged = newAssignments.every((val, idx) => val === assignments[idx]);
      assignments = newAssignments;

      centroids = this.updateCentroids(features, assignments, k);
      iteration++;
    }

    // Calculate cluster sizes
    const clusterSizes = new Array(k).fill(0);
    assignments.forEach(cluster => clusterSizes[cluster]++);

    // Calculate inertia
    let inertia = 0;
    for (let i = 0; i < features.length; i++) {
      const dist = this.euclideanDistance(
        features[i],
        centroids[assignments[i]]
      );
      inertia += dist * dist;
    }

    return {
      type: 'clustering',
      centroids,
      assignments,
      clusterSizes,
      inertia,
      k,
      iterations: iteration,
      converged: converged
    };
  }

  /**
   * Initialize centroids using k-means++ (ORIGINAL)
   */
  initializeCentroids(features, k) {
    const centroids = [];
    
    centroids.push([...features[Math.floor(Math.random() * features.length)]]);

    for (let i = 1; i < k; i++) {
      const distances = features.map(point => {
        const minDist = Math.min(...centroids.map(c => 
          this.euclideanDistance(point, c)
        ));
        return minDist * minDist;
      });

      const sum = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * sum;
      
      for (let j = 0; j < distances.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push([...features[j]]);
          break;
        }
      }
    }

    return centroids;
  }

  /**
   * Find nearest centroid (ORIGINAL)
   */
  nearestCentroid(point, centroids) {
    let minDist = Infinity;
    let nearest = 0;

    centroids.forEach((centroid, idx) => {
      const dist = this.euclideanDistance(point, centroid);
      if (dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    });

    return nearest;
  }

  /**
   * Update centroids (ORIGINAL)
   */
  updateCentroids(features, assignments, k) {
    const newCentroids = [];
    
    for (let i = 0; i < k; i++) {
      const clusterPoints = features.filter((_, idx) => assignments[idx] === i);
      
      if (clusterPoints.length === 0) {
        newCentroids.push(new Array(features[0].length).fill(0));
        continue;
      }

      const centroid = new Array(features[0].length).fill(0);
      clusterPoints.forEach(point => {
        point.forEach((val, j) => {
          centroid[j] += val;
        });
      });
      
      centroid.forEach((val, j) => {
        centroid[j] = val / clusterPoints.length;
      });
      
      newCentroids.push(centroid);
    }

    return newCentroids;
  }

  /**
   * Euclidean distance (ORIGINAL)
   */
  euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * Calculate performance metrics (ORIGINAL)
   */
  calculateMetrics(predictions, actualLabels) {
    if (!actualLabels || actualLabels.length === 0) {
      return { accuracy: null, error: 'No labels provided' };
    }

    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actualLabels[i]) {
        correct++;
      }
    }
    const accuracy = correct / predictions.length;

    const confusionMatrix = {
      tp: 0, tn: 0, fp: 0, fn: 0
    };

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      const actual = actualLabels[i];

      if (pred === 1 && actual === 1) confusionMatrix.tp++;
      else if (pred === 0 && actual === 0) confusionMatrix.tn++;
      else if (pred === 1 && actual === 0) confusionMatrix.fp++;
      else if (pred === 0 && actual === 1) confusionMatrix.fn++;
    }

    const precision = confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fp) || 0;
    const recall = confusionMatrix.tp / (confusionMatrix.tp + confusionMatrix.fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    // Convert to 2D array format for visualization
    const confusionMatrix2D = [
      [confusionMatrix.tn, confusionMatrix.fp],  // Actual 0
      [confusionMatrix.fn, confusionMatrix.tp]   // Actual 1
    ];

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: confusionMatrix2D,  // Now it's a 2D array!
      confusionMatrixRaw: confusionMatrix,  // Keep original for reference
      totalSamples: predictions.length,
      correctPredictions: correct
    };
  }

  /**
   * Calculate accuracy (NEW - for TensorFlow)
   */
  calculateAccuracy(trueLabels, predictedLabels) {
    let correct = 0;
    for (let i = 0; i < trueLabels.length; i++) {
      if (trueLabels[i] === predictedLabels[i]) {
        correct++;
      }
    }
    return correct / trueLabels.length;
  }

  /**
   * Calculate multiclass confusion matrix (NEW - for TensorFlow)
   */
  calculateConfusionMatrixMulticlass(trueLabels, predictedLabels, numClasses) {
    const matrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));

    for (let i = 0; i < trueLabels.length; i++) {
      const trueClass = trueLabels[i];
      const predClass = predictedLabels[i];
      matrix[trueClass][predClass]++;
    }

    return matrix;
  }
}

export default MLEngine;