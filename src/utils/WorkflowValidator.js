// src/utils/WorkflowValidator.js
export class WorkflowValidator {
  constructor(nodes, edges, csvData) {
    this.nodes = nodes;
    this.edges = edges;
    this.csvData = csvData;
    this.errors = [];
    this.warnings = [];
  }

  // Main validation entry point
  validate() {
    this.errors = [];
    this.warnings = [];

    this.checkBasicStructure();
    this.checkNodeConfigurations();
    this.checkWorkflowConnectivity();
    this.checkLogicalFlow();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      hasWarnings: this.warnings.length > 0
    };
  }

  // Check basic workflow structure
  checkBasicStructure() {
    const inputNodes = this.nodes.filter(n => n.data?.nodeType === 'input');
    const outputNodes = this.nodes.filter(n => n.data?.nodeType === 'output');

    if (inputNodes.length === 0) {
      this.errors.push({
        severity: 'error',
        message: 'No Input node found',
        fix: 'Add an Input node from the sidebar to load your dataset'
      });
    }

    if (outputNodes.length === 0) {
      this.errors.push({
        severity: 'error',
        message: 'No Output node found',
        fix: 'Add an Output node from the sidebar to see results'
      });
    }

    if (this.nodes.length === 0) {
      this.errors.push({
        severity: 'error',
        message: 'Workflow is empty',
        fix: 'Add nodes to create your machine learning pipeline'
      });
    }
  }

  // Check each node's configuration
  checkNodeConfigurations() {
    this.nodes.forEach(node => {
      switch (node.data?.nodeType) {
        case 'input':
          this.validateInputNode(node);
          break;
        case 'preprocess':
          this.validatePreprocessNode(node);
          break;
        case 'ml':
          this.validateMLNode(node);
          break;
        case 'quantum':
          this.validateQuantumNode(node);
          break;
      }
    });
  }

  validateInputNode(node) {
    if (!this.csvData || !this.csvData.data || this.csvData.data.length === 0) {
      this.errors.push({
        severity: 'error',
        nodeId: node.id,
        message: `Input node "${node.data.label}" has no CSV uploaded`,
        fix: 'Click the "Upload CSV" button in the navbar to upload your dataset'
      });
    }
  }

  validatePreprocessNode(node) {
    const config = node.data.config;
    
    if (!config || !config.operation) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Preprocess node "${node.data.label}" has no operation selected`,
        fix: 'Click the node to configure preprocessing (normalize, standardize, etc.)'
      });
    }

    if (config && config.trainSplit && (config.trainSplit < 50 || config.trainSplit > 95)) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Unusual train/test split: ${config.trainSplit}%`,
        fix: 'Consider using a split between 60-80% for better model training'
      });
    }
  }

  validateMLNode(node) {
    const config = node.data.config;
    
    if (!config || !config.modelType) {
      this.errors.push({
        severity: 'error',
        nodeId: node.id,
        message: `ML node "${node.data.label}" has no model type selected`,
        fix: 'Click the node and choose a model (Neural Network, Perceptron, etc.)'
      });
    }

    if (config && config.epochs && config.epochs > 1000) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Very high epoch count: ${config.epochs}`,
        fix: 'Consider starting with fewer epochs (50-200) to avoid overfitting'
      });
    }

    if (config && config.learningRate && config.learningRate > 0.1) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `High learning rate: ${config.learningRate}`,
        fix: 'Try a smaller learning rate (0.001-0.01) for more stable training'
      });
    }
  }

  validateQuantumNode(node) {
    const config = node.data.config;
    
    if (!config || !config.encodingMethod) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Quantum node "${node.data.label}" has no encoding method selected`,
        fix: 'Click the node to choose an encoding method (Angle, Amplitude, etc.)'
      });
    }

    if (config && config.numQubits && config.numQubits > 10) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `High qubit count: ${config.numQubits}`,
        fix: 'Simulating >10 qubits can be slow. Consider reducing for faster results'
      });
    }

    if (config && config.depth && config.depth > 20) {
      this.warnings.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Deep quantum circuit: ${config.depth} layers`,
        fix: 'Very deep circuits may take longer to simulate'
      });
    }
  }

  // Check workflow connectivity
  checkWorkflowConnectivity() {
    // Find all disconnected nodes
    const disconnectedNodes = this.nodes.filter(node => {
      const hasIncoming = this.edges.some(e => e.target === node.id);
      const hasOutgoing = this.edges.some(e => e.source === node.id);
      
      // Input nodes don't need incoming, Output nodes don't need outgoing
      if (node.data?.nodeType === 'input') return !hasOutgoing;
      if (node.data?.nodeType === 'output') return !hasIncoming;
      
      return !hasIncoming || !hasOutgoing;
    });

    disconnectedNodes.forEach(node => {
      this.errors.push({
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.data.label}" is disconnected`,
        fix: 'Connect this node to other nodes to include it in the workflow'
      });
    });

    // Check if there's a valid path from Input to Output
    if (this.nodes.length > 0) {
      const hasValidPath = this.hasPathFromInputToOutput();
      if (!hasValidPath) {
        this.errors.push({
          severity: 'error',
          message: 'No valid path from Input to Output',
          fix: 'Connect your nodes to create a complete workflow: Input → Processing → Output'
        });
      }
    }
  }

  // Check logical flow patterns
  checkLogicalFlow() {
    // Find quantum → classical → quantum patterns (inefficient)
    const quantumNodes = this.nodes.filter(n => n.data?.nodeType === 'quantum');
    quantumNodes.forEach(qNode => {
      const downstream = this.getDownstreamNodes(qNode.id);
      const hasClassicalML = downstream.some(n => n.data?.nodeType === 'ml');
      
      if (hasClassicalML) {
        const mlNode = downstream.find(n => n.data?.nodeType === 'ml');
        const afterML = this.getDownstreamNodes(mlNode.id);
        const hasQuantumAfter = afterML.some(n => n.data?.nodeType === 'quantum');
        
        if (hasQuantumAfter) {
          this.warnings.push({
            severity: 'warning',
            message: 'Quantum → Classical → Quantum pattern detected',
            fix: 'This may not be optimal. Consider restructuring your workflow'
          });
        }
      }
    });

    // Warn if preprocessing comes after quantum transformation
    quantumNodes.forEach(qNode => {
      const downstream = this.getDownstreamNodes(qNode.id);
      const hasPreprocess = downstream.some(n => n.data?.nodeType === 'preprocess');
      
      if (hasPreprocess) {
        this.warnings.push({
          severity: 'warning',
          message: 'Preprocessing after quantum transformation detected',
          fix: 'Consider preprocessing before quantum encoding for better results'
        });
      }
    });
  }

  // Helper: Check if there's a path from any Input to any Output
  hasPathFromInputToOutput() {
    const inputNodes = this.nodes.filter(n => n.data?.nodeType === 'input');
    const outputNodes = this.nodes.filter(n => n.data?.nodeType === 'output');
    
    if (inputNodes.length === 0 || outputNodes.length === 0) return false;

    // BFS to check if any input can reach any output
    for (const inputNode of inputNodes) {
      const visited = new Set();
      const queue = [inputNode.id];
      
      while (queue.length > 0) {
        const currentId = queue.shift();
        
        if (visited.has(currentId)) continue;
        visited.add(currentId);
        
        // Check if we reached an output
        const current = this.nodes.find(n => n.id === currentId);
        if (current && current.data?.nodeType === 'output') return true;
        
        // Add connected nodes to queue
        const outgoingEdges = this.edges.filter(e => e.source === currentId);
        outgoingEdges.forEach(edge => queue.push(edge.target));
      }
    }
    
    return false;
  }

  // Helper: Get all downstream nodes from a given node
  getDownstreamNodes(nodeId) {
    const downstream = [];
    const visited = new Set();
    const queue = [nodeId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      const outgoingEdges = this.edges.filter(e => e.source === currentId);
      outgoingEdges.forEach(edge => {
        const targetNode = this.nodes.find(n => n.id === edge.target);
        if (targetNode) {
          downstream.push(targetNode);
          queue.push(edge.target);
        }
      });
    }
    
    return downstream;
  }
}

export default WorkflowValidator;