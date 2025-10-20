// Hybrid ML-Quantum Integration
// Handles data conversion between classical ML and quantum systems

import { Complex } from '../quantum/gates';

// Convert ML predictions to quantum states
export function mlToQuantumState(predictions, numQubits = 2) {
  const stateSize = Math.pow(2, numQubits);
  
  // Normalize predictions to create valid quantum state
  let normalized = [];
  let sum = 0;
  
  for (let i = 0; i < Math.min(predictions.length, stateSize); i++) {
    const val = Array.isArray(predictions[i]) ? predictions[i][0] : predictions[i];
    const amplitude = Math.abs(val);
    normalized.push(amplitude);
    sum += amplitude * amplitude;
  }
  
  // Pad with zeros if needed
  while (normalized.length < stateSize) {
    normalized.push(0);
  }
  
  // Normalize to unit length
  const norm = Math.sqrt(sum);
  if (norm > 0) {
    normalized = normalized.map(val => val / norm);
  }
  
  // Convert to complex amplitudes
  return normalized.map(val => new Complex(val, 0));
}

// Convert quantum probabilities to ML features
export function quantumToMLFeatures(probabilities) {
  // Use quantum measurement probabilities as features
  return probabilities.map(p => [p]);
}

// Encode classical data into quantum state (amplitude encoding)
export function amplitudeEncoding(data) {
  const numQubits = Math.ceil(Math.log2(data.length));
  const stateSize = Math.pow(2, numQubits);
  
  // Normalize data
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  const norm = Math.sqrt(sum);
  
  // Create quantum state
  const state = [];
  for (let i = 0; i < stateSize; i++) {
    if (i < data.length && norm > 0) {
      state.push(new Complex(data[i] / norm, 0));
    } else {
      state.push(new Complex(0, 0));
    }
  }
  
  return state;
}

// Encode classical data into quantum state (basis encoding)
export function basisEncoding(value, numQubits) {
  const stateSize = Math.pow(2, numQubits);
  const index = Math.floor(value) % stateSize;
  
  const state = [];
  for (let i = 0; i < stateSize; i++) {
    state.push(i === index ? new Complex(1, 0) : new Complex(0, 0));
  }
  
  return state;
}

// Extract features from quantum state
export function extractQuantumFeatures(simulator) {
  const probabilities = simulator.getProbabilities();
  const state = simulator.getState();
  
  return {
    probabilities,
    expectationValues: calculateExpectationValues(simulator),
    entropy: calculateEntropy(probabilities),
    dominantState: getDominantState(state)
  };
}

// Calculate expectation values for Pauli operators
function calculateExpectationValues(simulator) {
  const probabilities = simulator.getProbabilities();
  
  // Simplified: calculate Z expectation for each qubit
  const expectations = [];
  for (let q = 0; q < simulator.numQubits; q++) {
    let exp = 0;
    const mask = 1 << (simulator.numQubits - 1 - q);
    
    for (let i = 0; i < probabilities.length; i++) {
      const bit = (i & mask) ? -1 : 1;
      exp += bit * probabilities[i];
    }
    
    expectations.push(exp);
  }
  
  return expectations;
}

// Calculate Shannon entropy
function calculateEntropy(probabilities) {
  let entropy = 0;
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] > 1e-10) {
      entropy -= probabilities[i] * Math.log2(probabilities[i]);
    }
  }
  return entropy;
}

// Get most probable state
function getDominantState(states) {
  let maxProb = 0;
  let dominantState = null;
  
  for (const state of states) {
    if (state.probability > maxProb) {
      maxProb = state.probability;
      dominantState = state.state;
    }
  }
  
  return { state: dominantState, probability: maxProb };
}

// Create quantum circuit from ML model weights
export function mlWeightsToQuantumCircuit(weights, numQubits = 2) {
  const circuit = [];
  
  // Start with Hadamard on all qubits (superposition)
  for (let i = 0; i < numQubits; i++) {
    circuit.push({
      type: 'single',
      gate: 'H',
      qubit: i,
      params: {}
    });
  }
  
  // Use weights to determine rotation angles
  let weightIndex = 0;
  for (let i = 0; i < numQubits; i++) {
    if (weightIndex < weights.length) {
      const angle = weights[weightIndex] * Math.PI;
      circuit.push({
        type: 'single',
        gate: 'RY',
        qubit: i,
        params: { theta: angle }
      });
      weightIndex++;
    }
  }
  
  // Add entangling layers
  for (let i = 0; i < numQubits - 1; i++) {
    circuit.push({
      type: 'two-qubit',
      gate: 'CNOT',
      control: i,
      target: i + 1,
      params: {}
    });
  }
  
  return circuit;
}

// Hybrid quantum-classical optimization step
export function hybridOptimizationStep(mlModel, quantumSimulator, data, labels) {
  // 1. Get ML predictions
  const mlPredictions = mlModel.predict(data);
  
  // 2. Convert to quantum state
  const quantumState = mlToQuantumState(mlPredictions, quantumSimulator.numQubits);
  quantumSimulator.setState(quantumState);
  
  // 3. Apply quantum processing
  quantumSimulator.applyGate('H', 0);
  if (quantumSimulator.numQubits > 1) {
    quantumSimulator.applyTwoQubitGate('CNOT', 0, 1);
  }
  
  // 4. Extract quantum features
  const quantumFeatures = extractQuantumFeatures(quantumSimulator);
  
  // 5. Use quantum features as feedback to ML
  return {
    mlPredictions,
    quantumState: quantumSimulator.getState(),
    quantumFeatures,
    hybridOutput: combineMLAndQuantum(mlPredictions, quantumFeatures)
  };
}

// Combine ML and quantum results
function combineMLAndQuantum(mlPredictions, quantumFeatures) {
  const combined = [];
  
  for (let i = 0; i < mlPredictions.length; i++) {
    const mlValue = Array.isArray(mlPredictions[i]) ? mlPredictions[i][0] : mlPredictions[i];
    
    // Use quantum probabilities to modulate ML predictions
    const qIndex = i % quantumFeatures.probabilities.length;
    const qWeight = quantumFeatures.probabilities[qIndex];
    
    combined.push(mlValue * (1 + qWeight * 0.1)); // Slight quantum enhancement
  }
  
  return combined;
}

// Variational Quantum Circuit (VQC) for hybrid learning
export class VariationalQuantumCircuit {
  constructor(numQubits, numLayers = 2) {
    this.numQubits = numQubits;
    this.numLayers = numLayers;
    this.parameters = this.initializeParameters();
  }
  
  initializeParameters() {
    const params = [];
    for (let layer = 0; layer < this.numLayers; layer++) {
      for (let qubit = 0; qubit < this.numQubits; qubit++) {
        params.push(Math.random() * 2 * Math.PI); // Random angles
      }
    }
    return params;
  }
  
  buildCircuit() {
    const circuit = [];
    let paramIndex = 0;
    
    for (let layer = 0; layer < this.numLayers; layer++) {
      // Rotation layer
      for (let qubit = 0; qubit < this.numQubits; qubit++) {
        circuit.push({
          type: 'single',
          gate: 'RY',
          qubit,
          params: { theta: this.parameters[paramIndex++] }
        });
      }
      
      // Entangling layer
      for (let qubit = 0; qubit < this.numQubits - 1; qubit++) {
        circuit.push({
          type: 'two-qubit',
          gate: 'CNOT',
          control: qubit,
          target: qubit + 1,
          params: {}
        });
      }
    }
    
    return circuit;
  }
  
  updateParameters(gradients, learningRate = 0.01) {
    for (let i = 0; i < this.parameters.length; i++) {
      this.parameters[i] -= learningRate * gradients[i];
    }
  }
}

// Quantum Feature Map
export function quantumFeatureMap(data, numQubits) {
  const circuit = [];
  
  // Encode data using rotation gates
  for (let i = 0; i < Math.min(data.length, numQubits); i++) {
    circuit.push({
      type: 'single',
      gate: 'RY',
      qubit: i,
      params: { theta: data[i] * Math.PI }
    });
  }
  
  // Add entanglement
  for (let i = 0; i < numQubits - 1; i++) {
    circuit.push({
      type: 'two-qubit',
      gate: 'CNOT',
      control: i,
      target: i + 1,
      params: {}
    });
  }
  
  return circuit;
}

// Quantum Kernel for SVM-like classification
export function quantumKernel(data1, data2, simulator) {
  // Encode first data point
  const circuit1 = quantumFeatureMap(data1, simulator.numQubits);
  simulator.reset();
  simulator.executeCircuit(circuit1);
  const state1 = simulator.stateVector.map(c => new Complex(c.real, c.imag));
  
  // Encode second data point
  const circuit2 = quantumFeatureMap(data2, simulator.numQubits);
  simulator.reset();
  simulator.executeCircuit(circuit2);
  const state2 = simulator.stateVector;
  
  // Calculate inner product (kernel value)
  let kernel = new Complex(0, 0);
  for (let i = 0; i < state1.length; i++) {
    kernel = kernel.add(state1[i].conjugate().multiply(state2[i]));
  }
  
  return kernel.magnitude() ** 2;
}