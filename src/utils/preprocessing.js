// Data preprocessing utilities

// Normalize data to range [0, 1]
export function normalize(data) {
  if (!data || data.length === 0) return { data: [], stats: {} };

  const numFeatures = data[0].length;
  const normalized = [];
  const mins = new Array(numFeatures).fill(Infinity);
  const maxs = new Array(numFeatures).fill(-Infinity);

  // Find min and max for each feature
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < numFeatures; j++) {
      mins[j] = Math.min(mins[j], data[i][j]);
      maxs[j] = Math.max(maxs[j], data[i][j]);
    }
  }

  // Normalize each value
  for (let i = 0; i < data.length; i++) {
    const row = [];
    for (let j = 0; j < numFeatures; j++) {
      const range = maxs[j] - mins[j];
      if (range === 0) {
        row.push(0);
      } else {
        row.push((data[i][j] - mins[j]) / range);
      }
    }
    normalized.push(row);
  }

  return {
    data: normalized,
    stats: { mins, maxs, method: 'normalize' }
  };
}

// Standardize data (mean=0, std=1)
export function standardize(data) {
  if (!data || data.length === 0) return { data: [], stats: {} };

  const numFeatures = data[0].length;
  const numSamples = data.length;
  const standardized = [];
  const means = new Array(numFeatures).fill(0);
  const stds = new Array(numFeatures).fill(0);

  // Calculate means
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    means[j] /= numSamples;
  }

  // Calculate standard deviations
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      const diff = data[i][j] - means[j];
      stds[j] += diff * diff;
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    stds[j] = Math.sqrt(stds[j] / numSamples);
  }

  // Standardize each value
  for (let i = 0; i < numSamples; i++) {
    const row = [];
    for (let j = 0; j < numFeatures; j++) {
      if (stds[j] === 0) {
        row.push(0);
      } else {
        row.push((data[i][j] - means[j]) / stds[j]);
      }
    }
    standardized.push(row);
  }

  return {
    data: standardized,
    stats: { means, stds, method: 'standardize' }
  };
}

// Scale data to specific range
export function scale(data, min = -1, max = 1) {
  const normalized = normalize(data);
  const range = max - min;
  
  const scaled = normalized.data.map(row => 
    row.map(val => val * range + min)
  );

  return {
    data: scaled,
    stats: { ...normalized.stats, targetMin: min, targetMax: max, method: 'scale' }
  };
}

// Add polynomial features (x^2, x*y, etc.)
export function addPolynomialFeatures(data, degree = 2) {
  if (!data || data.length === 0) return { data: [], featureNames: [] };

  const result = [];
  const featureNames = [];
  const numOriginalFeatures = data[0].length;

  // Generate feature names
  for (let i = 0; i < numOriginalFeatures; i++) {
    featureNames.push(`x${i}`);
  }

  for (let i = 0; i < numOriginalFeatures; i++) {
    for (let j = i; j < numOriginalFeatures; j++) {
      if (degree >= 2) {
        featureNames.push(`x${i}*x${j}`);
      }
    }
  }

  // Generate polynomial features
  for (let sample of data) {
    const row = [...sample];
    
    // Add interaction terms
    for (let i = 0; i < numOriginalFeatures; i++) {
      for (let j = i; j < numOriginalFeatures; j++) {
        if (degree >= 2) {
          row.push(sample[i] * sample[j]);
        }
      }
    }
    
    result.push(row);
  }

  return {
    data: result,
    featureNames,
    originalFeatures: numOriginalFeatures
  };
}

// Handle missing values
export function handleMissingValues(data, strategy = 'mean') {
  if (!data || data.length === 0) return { data: [], stats: {} };

  const numFeatures = data[0].length;
  const result = [];
  const replacementValues = new Array(numFeatures);

  // Calculate replacement values based on strategy
  for (let j = 0; j < numFeatures; j++) {
    const validValues = [];
    for (let i = 0; i < data.length; i++) {
      const val = data[i][j];
      if (val !== null && val !== undefined && !isNaN(val)) {
        validValues.push(val);
      }
    }

    if (validValues.length === 0) {
      replacementValues[j] = 0;
    } else {
      switch (strategy) {
        case 'mean':
          replacementValues[j] = validValues.reduce((a, b) => a + b, 0) / validValues.length;
          break;
        case 'median':
          validValues.sort((a, b) => a - b);
          const mid = Math.floor(validValues.length / 2);
          replacementValues[j] = validValues.length % 2 === 0
            ? (validValues[mid - 1] + validValues[mid]) / 2
            : validValues[mid];
          break;
        case 'mode':
          const freq = {};
          validValues.forEach(v => freq[v] = (freq[v] || 0) + 1);
          replacementValues[j] = Object.keys(freq).reduce((a, b) => 
            freq[a] > freq[b] ? a : b
          );
          break;
        case 'zero':
          replacementValues[j] = 0;
          break;
        default:
          replacementValues[j] = validValues[0];
      }
    }
  }

  // Replace missing values
  for (let i = 0; i < data.length; i++) {
    const row = [];
    for (let j = 0; j < numFeatures; j++) {
      const val = data[i][j];
      row.push((val === null || val === undefined || isNaN(val)) 
        ? replacementValues[j] 
        : val
      );
    }
    result.push(row);
  }

  return {
    data: result,
    stats: { replacementValues, strategy }
  };
}

// One-hot encoding for categorical features
export function oneHotEncode(data, categoricalIndices = []) {
  if (!data || data.length === 0) return { data: [], encoding: {} };

  const encoding = {};
  const result = [];

  // Build encoding map
  categoricalIndices.forEach(idx => {
    const uniqueValues = [...new Set(data.map(row => row[idx]))];
    encoding[idx] = uniqueValues.sort();
  });

  // Encode data
  for (let row of data) {
    const encodedRow = [];
    
    for (let j = 0; j < row.length; j++) {
      if (categoricalIndices.includes(j)) {
        // One-hot encode this feature
        const categories = encoding[j];
        const value = row[j];
        categories.forEach(cat => {
          encodedRow.push(value === cat ? 1 : 0);
        });
      } else {
        // Keep numerical feature as is
        encodedRow.push(row[j]);
      }
    }
    
    result.push(encodedRow);
  }

  return {
    data: result,
    encoding,
    originalIndices: categoricalIndices
  };
}

// PCA (Principal Component Analysis) for dimensionality reduction
export function pca(data, numComponents = 2) {
  if (!data || data.length === 0) return { data: [], stats: {} };

  const numSamples = data.length;
  const numFeatures = data[0].length;
  
  // Ensure valid number of components
  numComponents = Math.min(numComponents, numFeatures, numSamples);

  // Center the data (subtract mean)
  const means = new Array(numFeatures).fill(0);
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    means[j] /= numSamples;
  }

  const centered = data.map(row => 
    row.map((val, j) => val - means[j])
  );

  // Compute covariance matrix
  const covariance = Array(numFeatures).fill(0).map(() => Array(numFeatures).fill(0));
  for (let i = 0; i < numFeatures; i++) {
    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let k = 0; k < numSamples; k++) {
        sum += centered[k][i] * centered[k][j];
      }
      covariance[i][j] = sum / (numSamples - 1);
    }
  }

  // Simplified eigenvalue/eigenvector computation (Power iteration method)
  // For production, use a proper linear algebra library
  const eigenvectors = [];
  const eigenvalues = [];
  
  for (let comp = 0; comp < numComponents; comp++) {
    let v = Array(numFeatures).fill(0).map(() => Math.random() - 0.5);
    
    // Power iteration
    for (let iter = 0; iter < 100; iter++) {
      // Multiply covariance by v
      const newV = Array(numFeatures).fill(0);
      for (let i = 0; i < numFeatures; i++) {
        for (let j = 0; j < numFeatures; j++) {
          newV[i] += covariance[i][j] * v[j];
        }
      }
      
      // Normalize
      const norm = Math.sqrt(newV.reduce((sum, val) => sum + val * val, 0));
      v = newV.map(val => val / norm);
    }
    
    eigenvectors.push(v);
    
    // Compute eigenvalue
    const Av = Array(numFeatures).fill(0);
    for (let i = 0; i < numFeatures; i++) {
      for (let j = 0; j < numFeatures; j++) {
        Av[i] += covariance[i][j] * v[j];
      }
    }
    const eigenvalue = Av.reduce((sum, val, i) => sum + val * v[i], 0);
    eigenvalues.push(eigenvalue);
    
    // Deflate covariance matrix
    for (let i = 0; i < numFeatures; i++) {
      for (let j = 0; j < numFeatures; j++) {
        covariance[i][j] -= eigenvalue * v[i] * v[j];
      }
    }
  }

  // Project data onto principal components
  const transformed = centered.map(row => {
    return eigenvectors.map(eigenvector => 
      row.reduce((sum, val, i) => sum + val * eigenvector[i], 0)
    );
  });

  // Calculate explained variance
  const totalVariance = eigenvalues.reduce((a, b) => a + Math.abs(b), 0);
  const explainedVariance = eigenvalues.map(ev => Math.abs(ev) / totalVariance);

  return {
    data: transformed,
    stats: {
      eigenvectors,
      eigenvalues,
      explainedVariance,
      means,
      numComponents
    }
  };
}

// Feature selection - variance threshold
export function selectFeaturesByVariance(data, threshold = 0.01) {
  if (!data || data.length === 0) return { data: [], selectedIndices: [] };

  const numFeatures = data[0].length;
  const numSamples = data.length;
  const variances = [];
  
  // Calculate variance for each feature
  for (let j = 0; j < numFeatures; j++) {
    const values = data.map(row => row[j]);
    const mean = values.reduce((a, b) => a + b, 0) / numSamples;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numSamples;
    variances.push(variance);
  }

  // Select features above threshold
  const selectedIndices = [];
  variances.forEach((v, i) => {
    if (v > threshold) selectedIndices.push(i);
  });

  // Extract selected features
  const result = data.map(row => 
    selectedIndices.map(idx => row[idx])
  );

  return {
    data: result,
    selectedIndices,
    variances,
    threshold
  };
}

// Train-test split
export function trainTestSplit(data, labels, testSize = 0.2, shuffle = true) {
  if (!data || data.length === 0) return { trainData: [], testData: [], trainLabels: [], testLabels: [] };

  const numSamples = data.length;
  const numTest = Math.floor(numSamples * testSize);
  const numTrain = numSamples - numTest;

  // Create indices
  let indices = Array.from({ length: numSamples }, (_, i) => i);
  
  // Shuffle if requested
  if (shuffle) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }

  // Split indices
  const trainIndices = indices.slice(0, numTrain);
  const testIndices = indices.slice(numTrain);

  // Create splits
  const trainData = trainIndices.map(i => data[i]);
  const testData = testIndices.map(i => data[i]);
  const trainLabels = labels ? trainIndices.map(i => labels[i]) : [];
  const testLabels = labels ? testIndices.map(i => labels[i]) : [];

  return {
    trainData,
    testData,
    trainLabels,
    testLabels,
    trainIndices,
    testIndices,
    split: { train: numTrain, test: numTest }
  };
}

// Main preprocessing function - applies selected operations
export function preprocess(inputData, operations = ['normalize']) {
  let processedData = inputData.data;
  let processedLabels = inputData.labels;
  let stats = {};
  let appliedOps = [];

  for (let op of operations) {
    switch (op) {
      case 'normalize':
        const norm = normalize(processedData);
        processedData = norm.data;
        stats.normalize = norm.stats;
        appliedOps.push('normalize');
        break;

      case 'standardize':
        const std = standardize(processedData);
        processedData = std.data;
        stats.standardize = std.stats;
        appliedOps.push('standardize');
        break;

      case 'scale':
        const scaled = scale(processedData);
        processedData = scaled.data;
        stats.scale = scaled.stats;
        appliedOps.push('scale');
        break;

      case 'polynomial':
        const poly = addPolynomialFeatures(processedData);
        processedData = poly.data;
        stats.polynomial = { featureNames: poly.featureNames };
        appliedOps.push('polynomial');
        break;

      case 'handleMissing':
        const missing = handleMissingValues(processedData, 'mean');
        processedData = missing.data;
        stats.handleMissing = missing.stats;
        appliedOps.push('handleMissing');
        break;

      case 'oneHot':
        // Assuming categorical indices are provided in config
        const categoricalIndices = op.indices || [];
        const encoded = oneHotEncode(processedData, categoricalIndices);
        processedData = encoded.data;
        stats.oneHot = { encoding: encoded.encoding };
        appliedOps.push('oneHot');
        break;

      case 'pca':
        const pcaResult = pca(processedData, 2);
        processedData = pcaResult.data;
        stats.pca = pcaResult.stats;
        appliedOps.push('pca');
        break;

      case 'selectVariance':
        const selected = selectFeaturesByVariance(processedData, 0.01);
        processedData = selected.data;
        stats.selectVariance = { 
          selectedIndices: selected.selectedIndices,
          variances: selected.variances 
        };
        appliedOps.push('selectVariance');
        break;

      case 'trainTestSplit':
        const split = trainTestSplit(processedData, processedLabels, 0.2, true);
        stats.trainTestSplit = split.split;
        appliedOps.push('trainTestSplit');
        // Note: This returns different structure - handle separately
        return {
          type: 'split',
          trainData: split.trainData,
          testData: split.testData,
          trainLabels: split.trainLabels,
          testLabels: split.testLabels,
          operations: appliedOps,
          stats
        };

      default:
        console.warn(`Unknown preprocessing operation: ${op}`);
    }
  }

  return {
    type: 'preprocessed',
    data: processedData,
    labels: processedLabels,
    features: inputData.features,
    originalShape: inputData.shape,
    newShape: [processedData.length, processedData[0]?.length || 0],
    operations: appliedOps,
    stats,
    metadata: {
      ...inputData.metadata,
      preprocessed: true
    }
  };
}