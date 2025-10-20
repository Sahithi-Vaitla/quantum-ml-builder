// Quantum Circuit Simulator - State vector simulation

import { Complex, matrixMultiply, getGate, applyGateToQubit, applyControlledGate } from './gates';

export class QuantumSimulator {
  constructor(numQubits = 1) {
    this.numQubits = numQubits;
    this.stateVector = this.initializeState();
    this.circuit = [];
    this.measurements = [];
  }

  // Initialize state to |0...0⟩
  initializeState() {
    const size = Math.pow(2, this.numQubits);
    const state = [];
    for (let i = 0; i < size; i++) {
      state.push(i === 0 ? new Complex(1, 0) : new Complex(0, 0));
    }
    return state;
  }

  // Reset simulator
  reset() {
    this.stateVector = this.initializeState();
    this.circuit = [];
    this.measurements = [];
  }

  // Set initial state
  setState(state) {
    if (state.length !== Math.pow(2, this.numQubits)) {
      throw new Error('State vector size mismatch');
    }
    this.stateVector = state.map(c => 
      c instanceof Complex ? c : new Complex(c, 0)
    );
    this.normalizeState();
  }

  // Normalize state vector
  normalizeState() {
    let norm = 0;
    for (let i = 0; i < this.stateVector.length; i++) {
      norm += this.stateVector[i].magnitude() ** 2;
    }
    norm = Math.sqrt(norm);
    
    if (norm > 0) {
      this.stateVector = this.stateVector.map(c => 
        new Complex(c.real / norm, c.imag / norm)
      );
    }
  }

  // Apply single-qubit gate
  applyGate(gateName, qubitIndex, params = {}) {
    if (qubitIndex >= this.numQubits) {
      throw new Error(`Qubit index ${qubitIndex} out of range`);
    }

    const gate = getGate(gateName, params);
    const fullGate = applyGateToQubit(gate, qubitIndex, this.numQubits);
    
    // Apply gate to state vector
    this.stateVector = this.applyMatrix(fullGate, this.stateVector);
    
    // Record in circuit
    this.circuit.push({
      type: 'single',
      gate: gateName,
      qubit: qubitIndex,
      params
    });

    return this;
  }

  // Apply two-qubit gate
  applyTwoQubitGate(gateName, controlQubit, targetQubit, params = {}) {
    if (controlQubit >= this.numQubits || targetQubit >= this.numQubits) {
      throw new Error('Qubit index out of range');
    }

    const gate = getGate(gateName, params);
    const fullGate = applyControlledGate(gate, controlQubit, targetQubit, this.numQubits);
    
    // Apply gate to state vector
    this.stateVector = this.applyMatrix(fullGate, this.stateVector);
    
    // Record in circuit
    this.circuit.push({
      type: 'two-qubit',
      gate: gateName,
      control: controlQubit,
      target: targetQubit,
      params
    });

    return this;
  }

  // Apply matrix to state vector
  applyMatrix(matrix, vector) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = new Complex(0, 0);
      for (let j = 0; j < vector.length; j++) {
        sum = sum.add(matrix[i][j].multiply(vector[j]));
      }
      result.push(sum);
    }
    return result;
  }

  // Measure qubit (collapses state)
  measure(qubitIndex = null) {
    if (qubitIndex === null) {
      // Measure all qubits
      return this.measureAll();
    }

    // Measure specific qubit
    const probabilities = this.getProbabilities();
    const rand = Math.random();
    let cumulative = 0;
    let outcome = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (rand < cumulative) {
        outcome = i;
        break;
      }
    }

    // Collapse state
    const qubitMask = 1 << (this.numQubits - 1 - qubitIndex);
    const measuredBit = (outcome & qubitMask) ? 1 : 0;
    
    // Normalize collapsed state
    let norm = 0;
    for (let i = 0; i < this.stateVector.length; i++) {
      const bit = (i & qubitMask) ? 1 : 0;
      if (bit === measuredBit) {
        norm += probabilities[i];
      } else {
        this.stateVector[i] = new Complex(0, 0);
      }
    }

    if (norm > 0) {
      norm = Math.sqrt(norm);
      this.stateVector = this.stateVector.map(c => 
        new Complex(c.real / norm, c.imag / norm)
      );
    }

    this.measurements.push({ qubit: qubitIndex, result: measuredBit });
    return measuredBit;
  }

  // Measure all qubits
  measureAll() {
    const probabilities = this.getProbabilities();
    const rand = Math.random();
    let cumulative = 0;
    let outcome = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (rand < cumulative) {
        outcome = i;
        break;
      }
    }

    // Collapse to measured state
    this.stateVector = this.stateVector.map((_, i) => 
      i === outcome ? new Complex(1, 0) : new Complex(0, 0)
    );

    this.measurements.push({ qubits: 'all', result: outcome });
    return outcome;
  }

  // Get probability distribution
  getProbabilities() {
    return this.stateVector.map(c => c.magnitude() ** 2);
  }

  // Get state vector amplitudes
  getAmplitudes() {
    return this.stateVector.map(c => ({
      real: c.real,
      imag: c.imag,
      magnitude: c.magnitude(),
      phase: c.phase()
    }));
  }

  // Get state in computational basis
  getState() {
    const probabilities = this.getProbabilities();
    const states = [];

    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > 1e-10) {
        const binaryString = i.toString(2).padStart(this.numQubits, '0');
        states.push({
          state: `|${binaryString}⟩`,
          amplitude: this.stateVector[i],
          probability: probabilities[i]
        });
      }
    }

    return states;
  }

  // Get circuit depth
  getCircuitDepth() {
    return this.circuit.length;
  }

  // Get circuit representation
  getCircuit() {
    return this.circuit;
  }

  // Execute circuit from instruction list
  executeCircuit(instructions) {
    this.reset();

    for (const instruction of instructions) {
      const { type, gate, qubit, control, target, params } = instruction;

      if (type === 'single') {
        this.applyGate(gate, qubit, params);
      } else if (type === 'two-qubit') {
        this.applyTwoQubitGate(gate, control, target, params);
      } else if (type === 'measure') {
        this.measure(qubit);
      }
    }

    return this.getState();
  }

  // Run circuit multiple times (shots)
  runCircuit(instructions, shots = 1000) {
    const results = {};

    for (let i = 0; i < shots; i++) {
      this.executeCircuit(instructions);
      const outcome = this.measureAll();
      const key = outcome.toString(2).padStart(this.numQubits, '0');
      results[key] = (results[key] || 0) + 1;
    }

    // Convert counts to probabilities
    const probabilities = {};
    for (const key in results) {
      probabilities[key] = results[key] / shots;
    }

    return { counts: results, probabilities };
  }

  // Get simulator info
  getInfo() {
    return {
      numQubits: this.numQubits,
      stateSize: this.stateVector.length,
      circuitDepth: this.getCircuitDepth(),
      numMeasurements: this.measurements.length
    };
  }

  // Clone simulator
  clone() {
    const sim = new QuantumSimulator(this.numQubits);
    sim.stateVector = this.stateVector.map(c => new Complex(c.real, c.imag));
    sim.circuit = [...this.circuit];
    sim.measurements = [...this.measurements];
    return sim;
  }
}

// Helper function to create Bell state
export function createBellState() {
  const sim = new QuantumSimulator(2);
  sim.applyGate('H', 0);
  sim.applyTwoQubitGate('CNOT', 0, 1);
  return sim;
}

// Helper function to create GHZ state
export function createGHZState(numQubits = 3) {
  const sim = new QuantumSimulator(numQubits);
  sim.applyGate('H', 0);
  for (let i = 1; i < numQubits; i++) {
    sim.applyTwoQubitGate('CNOT', 0, i);
  }
  return sim;
}

// Helper function to create superposition
export function createSuperposition(numQubits = 1) {
  const sim = new QuantumSimulator(numQubits);
  for (let i = 0; i < numQubits; i++) {
    sim.applyGate('H', i);
  }
  return sim;
}