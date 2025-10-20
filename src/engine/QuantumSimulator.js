/**
 * QuantumSimulator.js
 * Simulates quantum circuits and quantum operations
 */

class QuantumSimulator {
  constructor() {
    this.circuits = new Map();
  }

  /**
   * Create a quantum circuit
   */
  createCircuit(numQubits) {
    // Initialize state vector |0...0⟩
    const stateSize = Math.pow(2, numQubits);
    const stateVector = new Array(stateSize).fill(0).map((_, i) => ({
      real: i === 0 ? 1 : 0,
      imag: 0
    }));

    return {
      numQubits,
      stateVector,
      gates: [],
      measurements: []
    };
  }

  /**
   * Apply quantum gate to circuit
   */
  applyGate(circuit, gate, targetQubits) {
    console.log(`⚛️ Applying ${gate} gate to qubits ${targetQubits}`);

    const newStateVector = [...circuit.stateVector];

    switch (gate) {
      case 'H': // Hadamard gate
        this.applyHadamard(newStateVector, circuit.numQubits, targetQubits[0]);
        break;
      case 'X': // Pauli-X (NOT) gate
        this.applyPauliX(newStateVector, circuit.numQubits, targetQubits[0]);
        break;
      case 'Y': // Pauli-Y gate
        this.applyPauliY(newStateVector, circuit.numQubits, targetQubits[0]);
        break;
      case 'Z': // Pauli-Z gate
        this.applyPauliZ(newStateVector, circuit.numQubits, targetQubits[0]);
        break;
      case 'CNOT': // Controlled-NOT gate
        this.applyCNOT(newStateVector, circuit.numQubits, targetQubits[0], targetQubits[1]);
        break;
      case 'RX': // Rotation around X
        this.applyRX(newStateVector, circuit.numQubits, targetQubits[0], targetQubits[1] || Math.PI / 4);
        break;
      case 'RY': // Rotation around Y
        this.applyRY(newStateVector, circuit.numQubits, targetQubits[0], targetQubits[1] || Math.PI / 4);
        break;
      case 'RZ': // Rotation around Z
        this.applyRZ(newStateVector, circuit.numQubits, targetQubits[0], targetQubits[1] || Math.PI / 4);
        break;
      default:
        console.warn(`Unknown gate: ${gate}`);
    }

    circuit.stateVector = newStateVector;
    circuit.gates.push({ gate, targetQubits });
  }

  /**
   * Hadamard gate implementation
   */
  applyHadamard(stateVector, numQubits, targetQubit) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);
    const factor = 1 / Math.sqrt(2);

    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        const tempReal = stateVector[i].real;
        const tempImag = stateVector[i].imag;

        stateVector[i].real = factor * (tempReal + stateVector[j].real);
        stateVector[i].imag = factor * (tempImag + stateVector[j].imag);
        stateVector[j].real = factor * (tempReal - stateVector[j].real);
        stateVector[j].imag = factor * (tempImag - stateVector[j].imag);
      }
    }
  }

  /**
   * Pauli-X gate implementation
   */
  applyPauliX(stateVector, numQubits, targetQubit) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);

    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        const temp = stateVector[i];
        stateVector[i] = stateVector[j];
        stateVector[j] = temp;
      }
    }
  }

  /**
   * Pauli-Y gate implementation
   */
  applyPauliY(stateVector, numQubits, targetQubit) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);

    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        const tempReal = stateVector[i].real;
        const tempImag = stateVector[i].imag;

        stateVector[i].real = stateVector[j].imag;
        stateVector[i].imag = -stateVector[j].real;
        stateVector[j].real = -tempImag;
        stateVector[j].imag = tempReal;
      }
    }
  }

  /**
   * Pauli-Z gate implementation
   */
  applyPauliZ(stateVector, numQubits, targetQubit) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);

    for (let i = 0; i < size; i++) {
      if ((i & step) !== 0) {
        stateVector[i].real = -stateVector[i].real;
        stateVector[i].imag = -stateVector[i].imag;
      }
    }
  }

  /**
   * CNOT gate implementation
   */
  applyCNOT(stateVector, numQubits, controlQubit, targetQubit) {
    const size = Math.pow(2, numQubits);
    const controlMask = Math.pow(2, controlQubit);
    const targetMask = Math.pow(2, targetQubit);

    for (let i = 0; i < size; i++) {
      if ((i & controlMask) !== 0 && (i & targetMask) === 0) {
        const j = i | targetMask;
        const temp = stateVector[i];
        stateVector[i] = stateVector[j];
        stateVector[j] = temp;
      }
    }
  }

  /**
   * Rotation around X-axis
   */
  applyRX(stateVector, numQubits, targetQubit, angle) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);

    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        const tempReal = stateVector[i].real;
        const tempImag = stateVector[i].imag;

        stateVector[i].real = cos * tempReal + sin * stateVector[j].imag;
        stateVector[i].imag = cos * tempImag - sin * stateVector[j].real;
        stateVector[j].real = cos * stateVector[j].real - sin * tempImag;
        stateVector[j].imag = cos * stateVector[j].imag + sin * tempReal;
      }
    }
  }

  /**
   * Rotation around Y-axis
   */
  applyRY(stateVector, numQubits, targetQubit, angle) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);

    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const j = i | step;
        const tempReal = stateVector[i].real;
        const tempImag = stateVector[i].imag;

        stateVector[i].real = cos * tempReal - sin * stateVector[j].real;
        stateVector[i].imag = cos * tempImag - sin * stateVector[j].imag;
        stateVector[j].real = sin * tempReal + cos * stateVector[j].real;
        stateVector[j].imag = sin * tempImag + cos * stateVector[j].imag;
      }
    }
  }

  /**
   * Rotation around Z-axis
   */
  applyRZ(stateVector, numQubits, targetQubit, angle) {
    const size = Math.pow(2, numQubits);
    const step = Math.pow(2, targetQubit);
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);

    for (let i = 0; i < size; i++) {
      if ((i & step) === 0) {
        const real = stateVector[i].real;
        const imag = stateVector[i].imag;
        stateVector[i].real = cos * real + sin * imag;
        stateVector[i].imag = cos * imag - sin * real;
      } else {
        const real = stateVector[i].real;
        const imag = stateVector[i].imag;
        stateVector[i].real = cos * real - sin * imag;
        stateVector[i].imag = cos * imag + sin * real;
      }
    }
  }

  /**
   * Measure quantum circuit
   */
  measure(circuit, shots = 1000) {
    console.log(`📊 Measuring circuit with ${shots} shots...`);

    const probabilities = this.getProbabilities(circuit.stateVector);
    const measurements = {};

    // Simulate measurements
    for (let i = 0; i < shots; i++) {
      const outcome = this.sampleOutcome(probabilities);
      const binaryString = outcome.toString(2).padStart(circuit.numQubits, '0');
      measurements[binaryString] = (measurements[binaryString] || 0) + 1;
    }

    // Convert counts to probabilities
    const measuredProbs = {};
    Object.keys(measurements).forEach(key => {
      measuredProbs[key] = measurements[key] / shots;
    });

    return {
      measurements,
      probabilities: measuredProbs,
      shots
    };
  }

  /**
   * Get probabilities from state vector
   */
  getProbabilities(stateVector) {
    return stateVector.map(complex => 
      complex.real * complex.real + complex.imag * complex.imag
    );
  }

  /**
   * Sample an outcome based on probabilities
   */
  sampleOutcome(probabilities) {
    let random = Math.random();
    for (let i = 0; i < probabilities.length; i++) {
      random -= probabilities[i];
      if (random <= 0) return i;
    }
    return probabilities.length - 1;
  }

  /**
   * Calculate quantum fidelity
   */
  calculateFidelity(circuit, targetState) {
    const probabilities = this.getProbabilities(circuit.stateVector);
    
    // If target state is provided, calculate fidelity to it
    if (targetState) {
      const targetProbs = this.getProbabilities(targetState);
      let fidelity = 0;
      for (let i = 0; i < probabilities.length; i++) {
        fidelity += Math.sqrt(probabilities[i] * targetProbs[i]);
      }
      return Math.pow(fidelity, 2);
    }

    // Otherwise return purity (self-fidelity)
    let purity = 0;
    probabilities.forEach(p => {
      purity += p * p;
    });
    return purity;
  }

  /**
   * Get quantum state visualization data
   */
  getStateVisualization(circuit) {
    const probabilities = this.getProbabilities(circuit.stateVector);
    
    const visualization = probabilities.map((prob, idx) => ({
      state: idx.toString(2).padStart(circuit.numQubits, '0'),
      probability: prob,
      amplitude: {
        real: circuit.stateVector[idx].real,
        imag: circuit.stateVector[idx].imag
      }
    }));

    // Sort by probability
    visualization.sort((a, b) => b.probability - a.probability);

    return visualization;
  }


  /**
   * ENCODING METHOD 1: Basis Embedding
   * Maps binary data to computational basis states
   * Example: [1, 0] → |10⟩
   */
  basisEncoding(circuit, data) {
    const binaryData = data.map(val => val > 0.5 ? 1 : 0);
    
    for (let i = 0; i < Math.min(binaryData.length, circuit.numQubits); i++) {
      if (binaryData[i] === 1) {
        this.applyGate(circuit, 'X', [i]);
      }
    }
    
    console.log('✅ Basis encoding applied:', binaryData);
  }

  /**
   * ENCODING METHOD 2: Angle Embedding
   * Encodes data as rotation angles using RY gates
   * Example: [0.5, 0.8] → RY(0.5π), RY(0.8π)
   */
  angleEncoding(circuit, data) {
    for (let i = 0; i < Math.min(data.length, circuit.numQubits); i++) {
      const angle = data[i] * Math.PI;
      this.applyGate(circuit, 'RY', [i, angle]);
    }
    
    console.log('✅ Angle encoding applied:', data);
  }

  /**
   * ENCODING METHOD 3: Amplitude Embedding
   * Encodes data vector into quantum state amplitudes
   * Note: Data must be normalized (sum of squares = 1)
   */
  amplitudeEncoding(circuit, data) {
    const stateSize = Math.pow(2, circuit.numQubits);
    
    // Normalize data
    const sumSquares = data.reduce((sum, val) => sum + val * val, 0);
    const normFactor = Math.sqrt(sumSquares);
    
    // Set amplitudes (only up to stateSize)
    for (let i = 0; i < Math.min(data.length, stateSize); i++) {
      circuit.stateVector[i].real = data[i] / normFactor;
      circuit.stateVector[i].imag = 0;
    }
    
    console.log('✅ Amplitude encoding applied');
  }

  /**
   * Encode classical data into quantum circuit
   */
  encodeData(circuit, data, encodingMethod = 'angle') {
    console.log(`🔢 Encoding data using: ${encodingMethod}`);
    
    switch (encodingMethod) {
      case 'basis':
        this.basisEncoding(circuit, data);
        break;
      case 'angle':
        this.angleEncoding(circuit, data);
        break;
      case 'amplitude':
        this.amplitudeEncoding(circuit, data);
        break;
      default:
        console.warn('Unknown encoding method, using angle encoding');
        this.angleEncoding(circuit, data);
    }
  }

  /**
   * Extract classical features from quantum measurements
   * Converts quantum probabilities into ML-usable features
   */
  extractFeatures(measurementResults) {
    const { measurements, probabilities } = measurementResults;
    
    // Method 1: Use probability distribution as features
    const probabilityFeatures = Object.keys(measurements)
      .sort()
      .map(state => probabilities[state] || 0);
    
    // Method 2: Calculate expectation values
    const expectationValues = [];
    const numQubits = Object.keys(measurements)[0]?.length || 2;
    
    for (let i = 0; i < numQubits; i++) {
      let expectation = 0;
      Object.entries(measurements).forEach(([state, count]) => {
        const bit = parseInt(state[i]);
        expectation += (bit === 1 ? 1 : -1) * (count / Object.values(measurements).reduce((a, b) => a + b, 0));
      });
      expectationValues.push((expectation + 1) / 2); // Normalize to [0, 1]
    }
    
    // Method 3: Statistical features
    const totalShots = Object.values(measurements).reduce((a, b) => a + b, 0);
    const entropy = Object.values(probabilities).reduce((sum, p) => {
      return p > 0 ? sum - p * Math.log2(p) : sum;
    }, 0);
    
    // Combine all features
    const features = [
      ...probabilityFeatures.slice(0, 4), // Top 4 probabilities
      ...expectationValues,                // Expectation values per qubit
      entropy                              // Entropy (measure of uncertainty)
    ];
    
    console.log('✅ Extracted quantum features:', features.length, 'features');
    return features;
  }


  /**
   * Run a complete quantum workflow
   */
  async runQuantumWorkflow(config) {
    const { 
      numQubits = 2, 
      gates = [], 
      shots = 1000,
      inputData = null,
      encodingMethod = 'angle'
    } = config;

    console.log(`⚛️ Running quantum circuit with ${numQubits} qubits...`);

    // Create circuit
    const circuit = this.createCircuit(numQubits);

    // STEP 1: Encode classical data if provided
    if (inputData && inputData.length > 0) {
      console.log('📊 Input data detected, encoding to quantum state...');
      this.encodeData(circuit, inputData, encodingMethod);
    }

    // STEP 2: Apply gates
    gates.forEach(({ gate, qubits }) => {
      this.applyGate(circuit, gate, qubits);
    });

    // Measure
    const measurementResults = this.measure(circuit, shots);

    // Calculate metrics
    const fidelity = this.calculateFidelity(circuit);
    const visualization = this.getStateVisualization(circuit);

    // STEP 3: Extract features for ML
    const quantumFeatures = this.extractFeatures(measurementResults);

    return {
      circuit,
      measurements: measurementResults,
      fidelity,
      visualization,
      numQubits,
      gatesApplied: gates.length,
      quantumFeatures,        // NEW: Features for ML
      encodingMethod,         // NEW: Which encoding was used
      hadInputData: inputData !== null  // NEW: Whether data was encoded
    };
  }
}

export default QuantumSimulator;