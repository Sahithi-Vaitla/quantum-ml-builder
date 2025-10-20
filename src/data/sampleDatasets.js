// Built-in sample datasets for testing workflows

export const DATASETS = {
  // Simple XOR problem - classic ML test
  xor: {
    name: 'XOR Problem',
    description: 'Binary XOR classification (4 samples)',
    data: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1]
    ],
    labels: [0, 1, 1, 0],
    features: ['x1', 'x2'],
    targetNames: ['0', '1']
  },

  // Simplified Iris dataset (first 30 samples)
  iris: {
    name: 'Iris Flowers (Simplified)',
    description: 'Classic classification dataset (30 samples, 2 classes)',
    data: [
      [5.1, 3.5], [4.9, 3.0], [4.7, 3.2], [4.6, 3.1], [5.0, 3.6],
      [5.4, 3.9], [4.6, 3.4], [5.0, 3.4], [4.4, 2.9], [4.9, 3.1],
      [7.0, 3.2], [6.4, 3.2], [6.9, 3.1], [5.5, 2.3], [6.5, 2.8],
      [5.7, 2.8], [6.3, 3.3], [4.9, 2.4], [6.6, 2.9], [5.2, 2.7],
      [5.0, 2.0], [5.9, 3.0], [6.0, 2.2], [6.1, 2.9], [5.6, 2.9],
      [6.7, 3.1], [5.6, 3.0], [5.8, 2.7], [6.2, 2.2], [5.6, 2.5]
    ],
    labels: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1
    ],
    features: ['sepal_length', 'sepal_width'],
    targetNames: ['setosa', 'versicolor']
  },

  // Simple linear data for regression
  linear: {
    name: 'Linear Regression',
    description: 'Simple y = 2x + 1 relationship (20 samples)',
    data: [
      [0], [1], [2], [3], [4], [5], [6], [7], [8], [9],
      [10], [11], [12], [13], [14], [15], [16], [17], [18], [19]
    ],
    labels: [
      1, 3, 5, 7, 9, 11, 13, 15, 17, 19,
      21, 23, 25, 27, 29, 31, 33, 35, 37, 39
    ],
    features: ['x'],
    targetNames: ['y']
  },

  // Random quantum state preparation data
  quantum_prep: {
    name: 'Quantum State Prep',
    description: 'Binary data for quantum state preparation (8 samples)',
    data: [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      [0, 1, 1],
      [1, 0, 0],
      [1, 0, 1],
      [1, 1, 0],
      [1, 1, 1]
    ],
    labels: [0, 1, 1, 0, 1, 0, 0, 1],
    features: ['bit1', 'bit2', 'bit3'],
    targetNames: ['state_0', 'state_1']
  }
};

// Get dataset by name
export function getDataset(name) {
  const dataset = DATASETS[name];
  if (!dataset) {
    throw new Error(`Dataset "${name}" not found`);
  }

  return {
    type: 'dataset',
    data: dataset.data,
    labels: dataset.labels,
    features: dataset.features,
    targetNames: dataset.targetNames,
    shape: [dataset.data.length, dataset.data[0].length],
    metadata: {
      name: dataset.name,
      description: dataset.description,
      source: 'builtin'
    }
  };
}

// List all available datasets
export function listDatasets() {
  return Object.keys(DATASETS).map(key => ({
    id: key,
    name: DATASETS[key].name,
    description: DATASETS[key].description,
    samples: DATASETS[key].data.length,
    features: DATASETS[key].data[0].length
  }));
}