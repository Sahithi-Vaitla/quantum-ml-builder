// Quantum Metrics - Fidelity, Entanglement, and other quantum measures

import { Complex } from './gates';

// State fidelity between two quantum states
export function stateFidelity(state1, state2) {
  if (state1.length !== state2.length) {
    throw new Error('States must have the same dimension');
  }

  // Calculate inner product ⟨ψ₁|ψ₂⟩
  let innerProduct = new Complex(0, 0);
  for (let i = 0; i < state1.length; i++) {
    const conj1 = state1[i].conjugate();
    innerProduct = innerProduct.add(conj1.multiply(state2[i]));
  }

  // Fidelity = |⟨ψ₁|ψ₂⟩|²
  return innerProduct.magnitude() ** 2;
}

// Trace distance between two states
export function traceDistance(state1, state2) {
  // For pure states: D(ρ₁, ρ₂) = √(1 - F(ρ₁, ρ₂))
  const fidelity = stateFidelity(state1, state2);
  return Math.sqrt(1 - fidelity);
}

// Calculate entanglement entropy (von Neumann entropy)
export function vonNeumannEntropy(stateVector, subsystemSize) {
  const totalSize = Math.log2(stateVector.length);
  if (subsystemSize >= totalSize) {
    return 0; // No entanglement if subsystem is the whole system
  }

  // Compute reduced density matrix (simplified for demonstration)
  // Full implementation would trace out the complement subsystem
  const probabilities = stateVector.map(c => c.magnitude() ** 2);
  
  // Shannon entropy as approximation
  let entropy = 0;
  for (let i = 0; i < probabilities.length; i++) {
    if (probabilities[i] > 1e-10) {
      entropy -= probabilities[i] * Math.log2(probabilities[i]);
    }
  }

  return entropy;
}

// Purity of quantum state
export function purity(stateVector) {
  // For pure state: Tr(ρ²) = 1
  // For mixed state: Tr(ρ²) < 1
  let sum = 0;
  for (let i = 0; i < stateVector.length; i++) {
    const prob = stateVector[i].magnitude() ** 2;
    sum += prob * prob;
  }
  return sum;
}

// Check if state is entangled (for 2-qubit systems)
export function isEntangled(stateVector) {
  if (stateVector.length !== 4) {
    throw new Error('Entanglement check currently supports 2-qubit systems only');
  }

  // For a separable state |ψ⟩ = |a⟩⊗|b⟩, we have ψ₀₀*ψ₁₁ = ψ₀₁*ψ₁₀
  const product1 = stateVector[0].multiply(stateVector[3]);
  const product2 = stateVector[1].multiply(stateVector[2]);
  
  const diff = product1.real - product2.real;
  const diffImag = product1.imag - product2.imag;
  
  // If difference is close to zero, state is separable (not entangled)
  return Math.sqrt(diff * diff + diffImag * diffImag) > 1e-10;
}

// Concurrence (measure of entanglement for 2-qubit systems)
export function concurrence(stateVector) {
  if (stateVector.length !== 4) {
    throw new Error('Concurrence is defined for 2-qubit systems only');
  }

  // C = 2|ψ₀₀*ψ₁₁ - ψ₀₁*ψ₁₀|
  const product1 = stateVector[0].multiply(stateVector[3]);
  const product2 = stateVector[1].multiply(stateVector[2]);
  const diff = product1.real - product2.real;
  const diffImag = product1.imag - product2.imag;
  
  return 2 * Math.sqrt(diff * diff + diffImag * diffImag);
}

// Expectation value of observable
export function expectationValue(stateVector, observable) {
  // ⟨O⟩ = ⟨ψ|O|ψ⟩
  let sum = new Complex(0, 0);
  
  for (let i = 0; i < stateVector.length; i++) {
    for (let j = 0; j < stateVector.length; j++) {
      const matrixElement = observable[i][j];
      const braket = stateVector[i].conjugate()
        .multiply(matrixElement)
        .multiply(stateVector[j]);
      sum = sum.add(braket);
    }
  }

  return sum.real; // Expectation values are real
}

// Bloch sphere coordinates (for single qubit)
export function blochCoordinates(stateVector) {
  if (stateVector.length !== 2) {
    throw new Error('Bloch coordinates are defined for single qubits only');
  }

  const alpha = stateVector[0];
  const beta = stateVector[1];

  // x = 2 * Re(α*β*)
  const x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag);
  
  // y = 2 * Im(α*β*)
  const y = 2 * (alpha.imag * beta.real - alpha.real * beta.imag);
  
  // z = |α|² - |β|²
  const z = alpha.magnitude() ** 2 - beta.magnitude() ** 2;

  return { x, y, z };
}

// Circuit fidelity - compare output of two circuits
export function circuitFidelity(circuit1Results, circuit2Results) {
  // Compare probability distributions
  const states = new Set([
    ...Object.keys(circuit1Results.probabilities),
    ...Object.keys(circuit2Results.probabilities)
  ]);

  let fidelity = 0;
  for (const state of states) {
    const p1 = circuit1Results.probabilities[state] || 0;
    const p2 = circuit2Results.probabilities[state] || 0;
    fidelity += Math.sqrt(p1 * p2);
  }

  return fidelity ** 2;
}

// Quantum gate fidelity
export function gateFidelity(actualState, targetState) {
  return stateFidelity(actualState, targetState);
}

// Process fidelity (average gate fidelity)
export function processFidelity(fidelities) {
  if (fidelities.length === 0) return 0;
  return fidelities.reduce((a, b) => a + b, 0) / fidelities.length;
}

// Calculate all quantum metrics for a state
export function calculateQuantumMetrics(simulator) {
  const stateVector = simulator.stateVector;
  const numQubits = simulator.numQubits;
  
  const metrics = {
    numQubits,
    stateSize: stateVector.length,
    purity: purity(stateVector),
    entropy: vonNeumannEntropy(stateVector, 1)
  };

  // Add Bloch coordinates for single qubit
  if (numQubits === 1) {
    metrics.blochCoordinates = blochCoordinates(stateVector);
  }

  // Add entanglement metrics for 2 qubits
  if (numQubits === 2) {
    metrics.isEntangled = isEntangled(stateVector);
    metrics.concurrence = concurrence(stateVector);
  }

  // Add state representation
  metrics.states = simulator.getState();
  metrics.probabilities = simulator.getProbabilities();

  return metrics;
}

// Format metrics for display
export function formatQuantumMetrics(metrics) {
  const formatted = {
    'Number of Qubits': metrics.numQubits,
    'State Space Size': metrics.stateSize,
    'Purity': metrics.purity.toFixed(4),
    'von Neumann Entropy': metrics.entropy.toFixed(4)
  };

  if (metrics.blochCoordinates) {
    formatted['Bloch X'] = metrics.blochCoordinates.x.toFixed(4);
    formatted['Bloch Y'] = metrics.blochCoordinates.y.toFixed(4);
    formatted['Bloch Z'] = metrics.blochCoordinates.z.toFixed(4);
  }

  if (metrics.isEntangled !== undefined) {
    formatted['Entangled'] = metrics.isEntangled ? 'Yes' : 'No';
    formatted['Concurrence'] = metrics.concurrence.toFixed(4);
  }

  return formatted;
}

// Compare two quantum states
export function compareStates(state1, state2) {
  const fidelity = stateFidelity(state1, state2);
  const distance = traceDistance(state1, state2);

  return {
    fidelity,
    distance,
    similar: fidelity > 0.99,
    percentMatch: (fidelity * 100).toFixed(2) + '%'
  };
}