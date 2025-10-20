// Machine Learning Metrics and Evaluation
import * as tf from '@tensorflow/tfjs';

// Calculate accuracy for classification
export function accuracy(predictions, labels) {
  if (!predictions || !labels || predictions.length !== labels.length) {
    return 0;
  }

  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) 
      ? (predictions[i][0] > 0.5 ? 1 : 0)
      : (predictions[i] > 0.5 ? 1 : 0);
    
    if (pred === labels[i]) {
      correct++;
    }
  }

  return correct / labels.length;
}

// Calculate precision
export function precision(predictions, labels, positiveClass = 1) {
  let truePositive = 0;
  let falsePositive = 0;

  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) 
      ? (predictions[i][0] > 0.5 ? 1 : 0)
      : (predictions[i] > 0.5 ? 1 : 0);
    
    if (pred === positiveClass) {
      if (labels[i] === positiveClass) {
        truePositive++;
      } else {
        falsePositive++;
      }
    }
  }

  return truePositive + falsePositive === 0 
    ? 0 
    : truePositive / (truePositive + falsePositive);
}

// Calculate recall (sensitivity)
export function recall(predictions, labels, positiveClass = 1) {
  let truePositive = 0;
  let falseNegative = 0;

  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) 
      ? (predictions[i][0] > 0.5 ? 1 : 0)
      : (predictions[i] > 0.5 ? 1 : 0);
    
    if (labels[i] === positiveClass) {
      if (pred === positiveClass) {
        truePositive++;
      } else {
        falseNegative++;
      }
    }
  }

  return truePositive + falseNegative === 0 
    ? 0 
    : truePositive / (truePositive + falseNegative);
}

// Calculate F1 score
export function f1Score(predictions, labels, positiveClass = 1) {
  const prec = precision(predictions, labels, positiveClass);
  const rec = recall(predictions, labels, positiveClass);

  return prec + rec === 0 
    ? 0 
    : (2 * prec * rec) / (prec + rec);
}

// Confusion matrix
export function confusionMatrix(predictions, labels, numClasses = 2) {
  const matrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));

  for (let i = 0; i < predictions.length; i++) {
    let pred;
    if (Array.isArray(predictions[i])) {
      // Multi-class or binary
      if (predictions[i].length > 1) {
        // Multi-class: find argmax
        pred = predictions[i].indexOf(Math.max(...predictions[i]));
      } else {
        // Binary
        pred = predictions[i][0] > 0.5 ? 1 : 0;
      }
    } else {
      pred = predictions[i] > 0.5 ? 1 : 0;
    }

    const actual = labels[i];
    if (pred < numClasses && actual < numClasses) {
      matrix[actual][pred]++;
    }
  }

  return matrix;
}

// Mean Squared Error (for regression)
export function meanSquaredError(predictions, labels) {
  if (predictions.length !== labels.length) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
    const diff = pred - labels[i];
    sum += diff * diff;
  }

  return sum / predictions.length;
}

// Root Mean Squared Error
export function rootMeanSquaredError(predictions, labels) {
  const mse = meanSquaredError(predictions, labels);
  return mse !== null ? Math.sqrt(mse) : null;
}

// Mean Absolute Error
export function meanAbsoluteError(predictions, labels) {
  if (predictions.length !== labels.length) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
    sum += Math.abs(pred - labels[i]);
  }

  return sum / predictions.length;
}

// R² Score (coefficient of determination)
export function r2Score(predictions, labels) {
  if (predictions.length !== labels.length) {
    return null;
  }

  // Calculate mean of actual values
  const mean = labels.reduce((a, b) => a + b, 0) / labels.length;

  // Calculate total sum of squares
  let ssTot = 0;
  for (let i = 0; i < labels.length; i++) {
    ssTot += Math.pow(labels[i] - mean, 2);
  }

  // Calculate residual sum of squares
  let ssRes = 0;
  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
    ssRes += Math.pow(labels[i] - pred, 2);
  }

  return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
}

// Cross-entropy loss
export function crossEntropyLoss(predictions, labels) {
  let loss = 0;
  const epsilon = 1e-7; // Small value to prevent log(0)

  for (let i = 0; i < predictions.length; i++) {
    const pred = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
    const clippedPred = Math.max(epsilon, Math.min(1 - epsilon, pred));
    const label = labels[i];
    
    loss += -(label * Math.log(clippedPred) + (1 - label) * Math.log(1 - clippedPred));
  }

  return loss / predictions.length;
}

// Calculate all classification metrics
export function classificationMetrics(predictions, labels, numClasses = 2) {
  const acc = accuracy(predictions, labels);
  const prec = precision(predictions, labels);
  const rec = recall(predictions, labels);
  const f1 = f1Score(predictions, labels);
  const cm = confusionMatrix(predictions, labels, numClasses);
  const loss = crossEntropyLoss(predictions, labels);

  return {
    accuracy: acc,
    precision: prec,
    recall: rec,
    f1Score: f1,
    confusionMatrix: cm,
    loss: loss
  };
}

// Calculate all regression metrics
export function regressionMetrics(predictions, labels) {
  const mse = meanSquaredError(predictions, labels);
  const rmse = rootMeanSquaredError(predictions, labels);
  const mae = meanAbsoluteError(predictions, labels);
  const r2 = r2Score(predictions, labels);

  return {
    mse,
    rmse,
    mae,
    r2Score: r2
  };
}

// Evaluate model performance
export function evaluateModel(model, testData, testLabels, taskType = 'classification') {
  const predictions = model.predict(testData);
  
  if (taskType === 'classification') {
    return classificationMetrics(predictions, testLabels);
  } else if (taskType === 'regression') {
    return regressionMetrics(predictions, testLabels);
  }

  return null;
}

// Format metrics for display
export function formatMetrics(metrics, taskType = 'classification') {
  if (taskType === 'classification') {
    return {
      'Accuracy': (metrics.accuracy * 100).toFixed(2) + '%',
      'Precision': (metrics.precision * 100).toFixed(2) + '%',
      'Recall': (metrics.recall * 100).toFixed(2) + '%',
      'F1 Score': (metrics.f1Score * 100).toFixed(2) + '%',
      'Loss': metrics.loss.toFixed(4),
      'Confusion Matrix': metrics.confusionMatrix
    };
  } else if (taskType === 'regression') {
    return {
      'MSE': metrics.mse.toFixed(4),
      'RMSE': metrics.rmse.toFixed(4),
      'MAE': metrics.mae.toFixed(4),
      'R² Score': metrics.r2Score.toFixed(4)
    };
  }

  return {};
}