// Quantum Gates - Matrix representations and operations

// Complex number operations
export class Complex {
  constructor(real = 0, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  multiply(other) {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  conjugate() {
    return new Complex(this.real, -this.imag);
  }

  magnitude() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  phase() {
    return Math.atan2(this.imag, this.real);
  }

  toString() {
    if (this.imag >= 0) {
      return `${this.real.toFixed(3)} + ${this.imag.toFixed(3)}i`;
    }
    return `${this.real.toFixed(3)} - ${Math.abs(this.imag).toFixed(3)}i`;
  }
}

// Matrix operations
export function matrixMultiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result = [];

  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      let sum = new Complex(0, 0);
      for (let k = 0; k < colsA; k++) {
        sum = sum.add(A[i][k].multiply(B[k][j]));
      }
      result[i][j] = sum;
    }
  }

  return result;
}

// Tensor product (Kronecker product)
export function tensorProduct(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  const result = [];
  for (let i = 0; i < rowsA * rowsB; i++) {
    result[i] = [];
    for (let j = 0; j < colsA * colsB; j++) {
      const iA = Math.floor(i / rowsB);
      const iB = i % rowsB;
      const jA = Math.floor(j / colsB);
      const jB = j % colsB;
      result[i][j] = A[iA][jA].multiply(B[iB][jB]);
    }
  }

  return result;
}

// Identity matrix
export function identity(size) {
  const result = [];
  for (let i = 0; i < size; i++) {
    result[i] = [];
    for (let j = 0; j < size; j++) {
      result[i][j] = new Complex(i === j ? 1 : 0, 0);
    }
  }
  return result;
}

// Single-qubit gates
export const gates = {
  // Pauli-X (NOT gate)
  X: [
    [new Complex(0, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(0, 0)]
  ],

  // Pauli-Y
  Y: [
    [new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0, 0)]
  ],

  // Pauli-Z
  Z: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0)]
  ],

  // Hadamard gate
  H: [
    [new Complex(1 / Math.sqrt(2), 0), new Complex(1 / Math.sqrt(2), 0)],
    [new Complex(1 / Math.sqrt(2), 0), new Complex(-1 / Math.sqrt(2), 0)]
  ],

  // S gate (Phase gate)
  S: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 1)]
  ],

  // T gate (π/8 gate)
  T: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))]
  ],

  // Identity
  I: [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(1, 0)]
  ]
};

// Rotation gates
export function RX(theta) {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [new Complex(cos, 0), new Complex(0, -sin)],
    [new Complex(0, -sin), new Complex(cos, 0)]
  ];
}

export function RY(theta) {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [
    [new Complex(cos, 0), new Complex(-sin, 0)],
    [new Complex(sin, 0), new Complex(cos, 0)]
  ];
}

export function RZ(theta) {
  return [
    [new Complex(Math.cos(-theta / 2), Math.sin(-theta / 2)), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.cos(theta / 2), Math.sin(theta / 2))]
  ];
}

// Phase gate with arbitrary angle
export function Phase(theta) {
  return [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(Math.cos(theta), Math.sin(theta))]
  ];
}

// Two-qubit gates
export const CNOT = [
  [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)],
  [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)]
];

export const CZ = [
  [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0), new Complex(-1, 0)]
];

export const SWAP = [
  [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
  [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)]
];

// Get gate matrix by name
export function getGate(gateName, params = {}) {
  switch (gateName.toUpperCase()) {
    case 'X':
    case 'NOT':
      return gates.X;
    case 'Y':
      return gates.Y;
    case 'Z':
      return gates.Z;
    case 'H':
    case 'HADAMARD':
      return gates.H;
    case 'S':
    case 'PHASE':
      return gates.S;
    case 'T':
      return gates.T;
    case 'I':
    case 'IDENTITY':
      return gates.I;
    case 'RX':
      return RX(params.theta || 0);
    case 'RY':
      return RY(params.theta || 0);
    case 'RZ':
      return RZ(params.theta || 0);
    case 'P':
      return Phase(params.theta || 0);
    case 'CNOT':
    case 'CX':
      return CNOT;
    case 'CZ':
      return CZ;
    case 'SWAP':
      return SWAP;
    default:
      throw new Error(`Unknown gate: ${gateName}`);
  }
}

// Apply gate to specific qubit(s) in n-qubit system
export function applyGateToQubit(gate, qubitIndex, numQubits) {
  if (numQubits === 1) return gate;

  let result = qubitIndex === 0 ? gate : identity(2);
  
  for (let i = 1; i < numQubits; i++) {
    if (i === qubitIndex) {
      result = tensorProduct(result, gate);
    } else {
      result = tensorProduct(result, identity(2));
    }
  }

  return result;
}

// Apply controlled gate
export function applyControlledGate(gate, controlQubit, targetQubit, numQubits) {
  // For 2-qubit gates like CNOT
  if (numQubits === 2) {
    if (controlQubit === 0 && targetQubit === 1) {
      return gate;
    }
    // Swap if needed
    return matrixMultiply(matrixMultiply(SWAP, gate), SWAP);
  }
  
  // For multi-qubit systems, use more complex logic
  // This is simplified - full implementation would handle arbitrary qubit positions
  return gate;
}