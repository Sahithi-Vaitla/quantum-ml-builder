// Workflow execution engine - handles data flow between nodes
import { getDataset, listDatasets } from '../data/sampleDatasets';
import { preprocess } from './preprocessing';

export class WorkflowEngine {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.executionOrder = [];
    this.results = new Map();
    this.tfInitialized = false;
  }

  async initialize() {
    if (!this.tfInitialized) {
      try {
        const { initializeTF } = await import('../ml/tfjs-setup');
        this.tfInitialized = await initializeTF();
      } catch (error) {
        console.warn('ML modules not available yet');
        this.tfInitialized = false;
      }
    }
  }

  // Set nodes from React Flow
  setNodes(nodes) {
    this.nodes = nodes;
  }

  // Set edges from React Flow
  setEdges(edges) {
    this.edges = edges;
  }

  // Build execution order (topological sort)
  buildExecutionOrder() {
    const visited = new Set();
    const order = [];

    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit all nodes that this node depends on (incoming edges)
      const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
      incomingEdges.forEach(edge => visit(edge.source));

      order.push(nodeId);
    };

    // Start from all nodes
    this.nodes.forEach(node => visit(node.id));

    this.executionOrder = order;
    return order;
  }

  // Execute the entire workflow
  async execute() {
    this.clearResults();
    this.buildExecutionOrder();

    console.log('Execution order:', this.executionOrder);

    for (const nodeId of this.executionOrder) {
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // Get node type from data.nodeType or fallback to node.type
      const nodeType = node.data?.nodeType || node.type;

      console.log(`Executing node: ${node.id} (${nodeType})`);

      try {
        let result;
        
        switch (nodeType) {
          case 'input':
            result = await this.executeInputNode(node);
            break;
          case 'preprocess':
            result = await this.executePreprocessNode(node);
            break;
          case 'ml':
            result = await this.executeMLNode(node);
            break;
          case 'quantum':
            result = await this.executeQuantumNode(node);
            break;
          case 'output':
            result = await this.executeOutputNode(node);
            break;
          default:
            console.warn(`Unknown node type: ${nodeType}`);
            result = { type: 'unknown', data: null };
        }

        this.results.set(node.id, result);
        console.log(`Node ${node.id} completed`);
      } catch (error) {
        console.error(`Error executing node ${node.id}:`, error);
        throw error;
      }
    }

    return this.results;
  }

  // Node execution methods
  async executeInputNode(node) {
  // Check if node has custom CSV data
  if (node.data.customData) {
    console.log('📊 Using custom CSV data:', node.data.customData.metadata);
    return node.data.customData;
  }

  // Otherwise use built-in dataset
  const datasetName = node.data.config?.dataset || 'xor';
  
  try {
    const dataset = getDataset(datasetName);
    console.log(`📦 Using built-in dataset: ${datasetName}`);
    return dataset;
  } catch (error) {
    // Fallback to XOR if dataset not found
    return getDataset('xor');
  }
}

  async executePreprocessNode(node) {
    // Get input data from previous node
    const inputNodeId = this.getInputNodeId(node.id);
    if (!inputNodeId) {
      throw new Error('Preprocess node requires input data');
    }

    const inputData = this.results.get(inputNodeId);
    if (!inputData) {
      throw new Error('Input data not found');
    }

    // Get preprocessing operations from node config
    const operations = node.data.config?.operations || ['normalize'];
    
    // Apply preprocessing
    const processed = preprocess(inputData, operations);
    
    return processed;
  }

  async executeMLNode(node) {
    try {
      await this.initialize();

      // Dynamic import of ML modules
      const { createModel } = await import('../ml/models');
      const { evaluateModel, formatMetrics } = await import('../ml/metrics');

      // Get input data from previous node
      const inputNodeId = this.getInputNodeId(node.id);
      if (!inputNodeId) {
        throw new Error('ML node requires input data');
      }

      const inputData = this.results.get(inputNodeId);
      if (!inputData || !inputData.data) {
        throw new Error('Invalid input data for ML node');
      }

      // Check if input is from quantum node - hybrid workflow
      let isHybrid = false;
      let data = inputData.data;
      let labels = inputData.labels || [];

      if (inputData.type === 'quantum-result' && inputData.quantumFeatures) {
        console.log('🔗 Hybrid workflow detected: Quantum → ML');
        isHybrid = true;
        
        // Convert quantum probabilities to ML features
        const { quantumToMLFeatures } = await import('../hybrid/hybrid');
        data = quantumToMLFeatures(inputData.probabilities);
        
        // Generate synthetic labels based on quantum measurement outcomes
        labels = inputData.probabilities.map(p => p > 0.5 ? 1 : 0);
      }

      // Get ML configuration
      const config = node.data.config || {};
      const modelType = config.modelType || 'perceptron';
      const epochs = config.epochs || 50;
      const batchSize = config.batchSize || 32;
      const validationSplit = config.validationSplit || 0.2;

      if (labels.length === 0) {
        throw new Error('ML training requires labels');
      }

     const inputShape = data[0].length;
const numClasses = Math.max(...labels) + 1;

// Create and train model
console.log(`Training ${modelType} model...`);
const model = createModel(modelType, {
  inputShape,
  numClasses,
  hiddenLayers: config.hiddenLayers || [64, 32]
});

const history = await model.train(data, labels, epochs, batchSize, validationSplit);

// Make predictions on training data
const predictions = model.predict(data);

// Calculate metrics
const taskType = modelType === 'linearRegression' ? 'regression' : 'classification';
const metrics = evaluateModel(model, data, labels, taskType);
const formattedMetrics = formatMetrics(metrics, taskType);

// Generate confusion matrix (ADD THIS SECTION HERE)
const confusionMatrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0));
predictions.forEach((pred, idx) => {
  const predictedClass = pred;
  const actualClass = labels[idx];
  if (actualClass < numClasses && predictedClass < numClasses) {
    confusionMatrix[actualClass][predictedClass]++;
  }
});

      console.log('Training complete!');
      console.log('Metrics:', formattedMetrics);
      console.log('Confusion Matrix:', confusionMatrix);

      return {
  type: 'ml',
  modelType: modelType,
  model,
  predictions,
  metrics: {
    accuracy: metrics.accuracy || 0,
    precision: metrics.precision || 0,
    recall: metrics.recall || 0,
    f1Score: metrics.f1Score || 0
  },
  confusionMatrix: confusionMatrix,
  trainingHistory: history.history.loss.map((loss, idx) => ({
    epoch: idx + 1,
    loss: loss,
    accuracy: history.history.acc ? history.history.acc[idx] : 0,
    valLoss: history.history.val_loss ? history.history.val_loss[idx] : undefined,
    valAccuracy: history.history.val_acc ? history.history.val_acc[idx] : undefined
  })),
  formattedMetrics,
  config: {
    modelType,
    epochs,
    inputShape,
    numClasses
  },
  hybrid: {
    isHybrid,
    quantumInput: isHybrid ? inputData : null
  },
  metadata: {
    trained: true,
    timestamp: new Date().toISOString()
  }
};
    } catch (error) {
      console.error('ML execution failed:', error);
      return {
        type: 'ml-result',
        predictions: [],
        metrics: { accuracy: 0 },
        metadata: { trained: false, error: error.message }
      };
    }
  }

  async executeQuantumNode(node) {
    try {
      // Dynamic import of quantum modules
      const { QuantumSimulator } = await import('../quantum/simulator');
      const { calculateQuantumMetrics, formatQuantumMetrics } = await import('../quantum/metrics');

      // Get input data from previous node (if any)
      const inputNodeId = this.getInputNodeId(node.id);
      const inputData = inputNodeId ? this.results.get(inputNodeId) : null;

      // Get quantum circuit configuration
      const config = node.data.config || {};
      const numQubits = config.numQubits || 2;
      const circuit = config.circuit || [];
      const shots = config.shots || 1000;

      // Create simulator
      console.log(`Running quantum circuit with ${numQubits} qubits...`);
      const simulator = new QuantumSimulator(numQubits);

      // Check if input is from ML node - hybrid workflow
      let isHybrid = false;
      if (inputData && inputData.type === 'ml-result') {
        console.log('🔗 Hybrid workflow detected: ML → Quantum');
        isHybrid = true;
        
        // Convert ML predictions to quantum state
        const { mlToQuantumState, extractQuantumFeatures } = await import('../hybrid/hybrid');
        const quantumState = mlToQuantumState(inputData.predictions, numQubits);
        simulator.setState(quantumState);
      }

      // Execute circuit
      if (circuit.length > 0) {
        simulator.executeCircuit(circuit);
      } else {
        // Default circuit: Bell state
        simulator.applyGate('H', 0);
        if (numQubits > 1) {
          simulator.applyTwoQubitGate('CNOT', 0, 1);
        }
      }

      // Get results
      const state = simulator.getState();
      const probabilities = simulator.getProbabilities();
      const metrics = calculateQuantumMetrics(simulator);
      const formattedMetrics = formatQuantumMetrics(metrics);

      // Extract features for potential ML use
      const { extractQuantumFeatures } = await import('../hybrid/hybrid');
      const quantumFeatures = extractQuantumFeatures(simulator);

      // Run multiple shots for statistics
      const runResults = circuit.length > 0 
        ? simulator.runCircuit(circuit, shots)
        : null;

      console.log('Quantum simulation complete!');
      console.log('Metrics:', formattedMetrics);

      return {
        type: 'quantum-result',
        simulator,
        state,
        probabilities,
        metrics,
        formattedMetrics,
        quantumFeatures,
        runResults,
        circuit: simulator.getCircuit(),
        config: {
          numQubits,
          shots,
          circuitDepth: simulator.getCircuitDepth()
        },
        hybrid: {
          isHybrid,
          mlInput: isHybrid ? inputData : null
        },
        metadata: {
          simulated: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Quantum execution failed:', error);
      // Return placeholder if quantum not available
      return {
        type: 'quantum-result',
        statevector: [],
        probabilities: [],
        metadata: { simulated: false, error: error.message }
      };
    }
  }

  async executeOutputNode(node) {
    try {
      const { formatOutputResults } = await import('../utils/visualization');
      
      // Collect all input data from connected nodes
      const inputNodeIds = this.getInputNodeIds(node.id);
      const inputs = inputNodeIds.map(id => ({
        nodeId: id,
        data: this.results.get(id)
      }));

      // Generate formatted results
      const formattedResults = formatOutputResults({
        type: 'output',
        inputs,
        metadata: { 
          timestamp: new Date().toISOString(),
          numInputs: inputs.length
        }
      });

      // Check for hybrid workflows
      const hasML = inputs.some(i => i.data?.type === 'ml-result');
      const hasQuantum = inputs.some(i => i.data?.type === 'quantum-result');
      const isHybrid = hasML && hasQuantum;

      console.log('Output node: Results collected!');
      if (isHybrid) {
        console.log('🔗 Hybrid workflow detected in output!');
      }

      return {
        type: 'output',
        inputs,
        formattedResults,
        summary: formattedResults.summary,
        isHybrid,
        metadata: { 
          timestamp: new Date().toISOString(),
          numInputs: inputs.length,
          hasML,
          hasQuantum
        }
      };
    } catch (error) {
      console.error('Output node execution failed:', error);
      // Fallback to simple output
      const inputNodeIds = this.getInputNodeIds(node.id);
      const inputs = inputNodeIds.map(id => ({
        nodeId: id,
        data: this.results.get(id)
      }));

      return {
        type: 'output',
        inputs,
        metadata: { 
          timestamp: new Date().toISOString(),
          numInputs: inputs.length,
          error: error.message
        }
      };
    }
  }

  // Helper: Get input node ID for a given node
  getInputNodeId(nodeId) {
    const incomingEdge = this.edges.find(edge => edge.target === nodeId);
    return incomingEdge ? incomingEdge.source : null;
  }

  // Helper: Get all input node IDs for a given node
  getInputNodeIds(nodeId) {
    return this.edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);
  }

  // Get execution results
  getResults() {
    return Object.fromEntries(this.results);
  }

  // Clear all results
  clearResults() {
    this.results.clear();
  }
}