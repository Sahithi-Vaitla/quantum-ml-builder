// Machine Learning Models
import * as tf from '@tensorflow/tfjs';

// Base Model class
class BaseModel {
  constructor() {
    this.model = null;
    this.trained = false;
    this.history = null;
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
  }
}

// Perceptron (Single Layer Neural Network)
export class Perceptron extends BaseModel {
  constructor(inputShape, numClasses = 2, activation = 'sigmoid') {
    super();
    this.inputShape = inputShape;
    this.numClasses = numClasses;
    this.activation = activation;
    this.buildModel();
  }

  buildModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [this.inputShape],
          units: this.numClasses === 2 ? 1 : this.numClasses,
          activation: this.activation
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.sgd(0.1),
      loss: this.numClasses === 2 ? 'binaryCrossentropy' : 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async train(data, labels, epochs = 50, batchSize = 32, validationSplit = 0.2) {
    const xs = tf.tensor2d(data);
    const ys = this.numClasses === 2 
      ? tf.tensor2d(labels, [labels.length, 1])
      : tf.oneHot(tf.tensor1d(labels, 'int32'), this.numClasses);

    this.history = await this.model.fit(xs, ys, {
      epochs,
      batchSize,
      validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });

    this.trained = true;
    
    // Cleanup
    xs.dispose();
    ys.dispose();

    return this.history;
  }

  predict(data) {
    if (!this.trained) {
      throw new Error('Model not trained yet');
    }

    const xs = tf.tensor2d(data);
    const predictions = this.model.predict(xs);
    const result = predictions.arraySync();
    
    xs.dispose();
    predictions.dispose();

    return result;
  }
}

// Multi-Layer Perceptron (Deep Neural Network)
export class MLP extends BaseModel {
  constructor(inputShape, hiddenLayers = [64, 32], numClasses = 2) {
    super();
    this.inputShape = inputShape;
    this.hiddenLayers = hiddenLayers;
    this.numClasses = numClasses;
    this.buildModel();
  }

  buildModel() {
    const layers = [];

    // Input + first hidden layer
    layers.push(tf.layers.dense({
      inputShape: [this.inputShape],
      units: this.hiddenLayers[0],
      activation: 'relu'
    }));

    // Additional hidden layers
    for (let i = 1; i < this.hiddenLayers.length; i++) {
      layers.push(tf.layers.dense({
        units: this.hiddenLayers[i],
        activation: 'relu'
      }));
    }

    // Output layer
    layers.push(tf.layers.dense({
      units: this.numClasses === 2 ? 1 : this.numClasses,
      activation: this.numClasses === 2 ? 'sigmoid' : 'softmax'
    }));

    this.model = tf.sequential({ layers });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: this.numClasses === 2 ? 'binaryCrossentropy' : 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async train(data, labels, epochs = 100, batchSize = 32, validationSplit = 0.2) {
    const xs = tf.tensor2d(data);
    const ys = this.numClasses === 2 
      ? tf.tensor2d(labels, [labels.length, 1])
      : tf.oneHot(tf.tensor1d(labels, 'int32'), this.numClasses);

    this.history = await this.model.fit(xs, ys, {
      epochs,
      batchSize,
      validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });

    this.trained = true;
    
    xs.dispose();
    ys.dispose();

    return this.history;
  }

  predict(data) {
    if (!this.trained) {
      throw new Error('Model not trained yet');
    }

    const xs = tf.tensor2d(data);
    const predictions = this.model.predict(xs);
    const result = predictions.arraySync();
    
    xs.dispose();
    predictions.dispose();

    return result;
  }
}

// Linear Regression
export class LinearRegression extends BaseModel {
  constructor(inputShape) {
    super();
    this.inputShape = inputShape;
    this.buildModel();
  }

  buildModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [this.inputShape],
          units: 1,
          activation: 'linear'
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.sgd(0.01),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });
  }

  async train(data, labels, epochs = 100, batchSize = 32) {
    const xs = tf.tensor2d(data);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    this.history = await this.model.fit(xs, ys, {
      epochs,
      batchSize,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
          }
        }
      }
    });

    this.trained = true;
    
    xs.dispose();
    ys.dispose();

    return this.history;
  }

  predict(data) {
    if (!this.trained) {
      throw new Error('Model not trained yet');
    }

    const xs = tf.tensor2d(data);
    const predictions = this.model.predict(xs);
    const result = predictions.arraySync();
    
    xs.dispose();
    predictions.dispose();

    return result;
  }
}

// Logistic Regression (Binary Classification)
export class LogisticRegression extends BaseModel {
  constructor(inputShape) {
    super();
    this.inputShape = inputShape;
    this.buildModel();
  }

  buildModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [this.inputShape],
          units: 1,
          activation: 'sigmoid'
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  async train(data, labels, epochs = 100, batchSize = 32, validationSplit = 0.2) {
    const xs = tf.tensor2d(data);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    this.history = await this.model.fit(xs, ys, {
      epochs,
      batchSize,
      validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });

    this.trained = true;
    
    xs.dispose();
    ys.dispose();

    return this.history;
  }

  predict(data) {
    if (!this.trained) {
      throw new Error('Model not trained yet');
    }

    const xs = tf.tensor2d(data);
    const predictions = this.model.predict(xs);
    const result = predictions.arraySync();
    
    xs.dispose();
    predictions.dispose();

    return result;
  }
}

// Model factory
export function createModel(type, config) {
  switch (type) {
    case 'perceptron':
      return new Perceptron(
        config.inputShape, 
        config.numClasses || 2,
        config.activation || 'sigmoid'
      );
    
    case 'mlp':
      return new MLP(
        config.inputShape,
        config.hiddenLayers || [64, 32],
        config.numClasses || 2
      );
    
    case 'linearRegression':
      return new LinearRegression(config.inputShape);
    
    case 'logisticRegression':
      return new LogisticRegression(config.inputShape);
    
    default:
      throw new Error(`Unknown model type: ${type}`);
  }
}