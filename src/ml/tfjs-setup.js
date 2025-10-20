// TensorFlow.js setup and configuration
import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js
export async function initializeTF() {
  try {
    await tf.ready();
    console.log('✅ TensorFlow.js initialized');
    console.log('Backend:', tf.getBackend());
    return true;
  } catch (error) {
    console.error('❌ TensorFlow.js initialization failed:', error);
    return false;
  }
}

// Set backend (webgl, cpu, wasm)
export async function setBackend(backend = 'webgl') {
  try {
    await tf.setBackend(backend);
    await tf.ready();
    console.log(`Backend set to: ${backend}`);
    return true;
  } catch (error) {
    console.error(`Failed to set backend to ${backend}:`, error);
    return false;
  }
}

// Get TensorFlow.js info
export function getTFInfo() {
  return {
    version: tf.version.tfjs,
    backend: tf.getBackend(),
    memory: tf.memory(),
    environment: tf.env().features
  };
}

// Convert array data to tensor
export function arrayToTensor(data, shape = null) {
  if (!shape) {
    // Infer shape from data
    if (Array.isArray(data[0])) {
      shape = [data.length, data[0].length];
    } else {
      shape = [data.length, 1];
    }
  }
  return tf.tensor(data, shape);
}

// Convert tensor to array
export function tensorToArray(tensor) {
  return tensor.arraySync();
}

// One-hot encode labels
export function oneHotLabels(labels, numClasses = null) {
  if (!numClasses) {
    numClasses = Math.max(...labels) + 1;
  }
  return tf.oneHot(tf.tensor1d(labels, 'int32'), numClasses);
}

// Normalize tensor (min-max scaling)
export function normalizeTensor(tensor) {
  const min = tensor.min();
  const max = tensor.max();
  return tensor.sub(min).div(max.sub(min));
}

// Split data into batches
export function* batchGenerator(data, labels, batchSize = 32) {
  const numSamples = data.shape[0];
  const numBatches = Math.ceil(numSamples / batchSize);
  
  for (let i = 0; i < numBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, numSamples);
    
    yield {
      data: data.slice([start, 0], [end - start, -1]),
      labels: labels.slice([start, 0], [end - start, -1])
    };
  }
}

// Memory management - dispose tensors
export function disposeTensors(...tensors) {
  tensors.forEach(tensor => {
    if (tensor && typeof tensor.dispose === 'function') {
      tensor.dispose();
    }
  });
}

// Clean up all tensors
export function cleanupMemory() {
  const numTensors = tf.memory().numTensors;
  console.log(`Tensors in memory before cleanup: ${numTensors}`);
  tf.disposeVariables();
  console.log(`Tensors in memory after cleanup: ${tf.memory().numTensors}`);
}

export default tf;