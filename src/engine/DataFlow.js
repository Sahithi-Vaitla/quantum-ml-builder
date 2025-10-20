/**
 * DataFlow.js
 * Manages data flow between connected nodes in the workflow
 */

class DataFlow {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.nodeData = new Map(); // Stores output data from each node
  }

  /**
   * Get execution order using topological sort
   */
  getExecutionOrder() {
    const adjacencyList = new Map();
    const inDegree = new Map();

    // Initialize
    this.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build graph
    this.edges.forEach(edge => {
      adjacencyList.get(edge.source).push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    });

    // Topological sort (Kahn's algorithm)
    const queue = [];
    const executionOrder = [];

    // Start with nodes that have no dependencies
    this.nodes.forEach(node => {
      if (inDegree.get(node.id) === 0) {
        queue.push(node.id);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift();
      executionOrder.push(nodeId);

      // Reduce in-degree for connected nodes
      adjacencyList.get(nodeId).forEach(neighborId => {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }

    // Check for cycles
    if (executionOrder.length !== this.nodes.length) {
      throw new Error('Circular dependency detected in workflow!');
    }

    return executionOrder;
  }

  /**
   * Get input data for a node from its connected predecessors
   */
  getNodeInputs(nodeId) {
    const inputs = [];
    
    // Find all edges that connect TO this node
    const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
    
    // Get data from source nodes
    incomingEdges.forEach(edge => {
      const sourceData = this.nodeData.get(edge.source);
      if (sourceData) {
        inputs.push(sourceData);
      }
    });

    // If no inputs, return null (this is likely an input node)
    if (inputs.length === 0) {
      return null;
    }

    // If single input, return it directly
    if (inputs.length === 1) {
      return inputs[0];
    }

    // Multiple inputs - merge them
    return this.mergeInputs(inputs);
  }

  /**
   * Merge multiple input datasets
   */
  mergeInputs(inputs) {
    // For now, just concatenate data arrays
    // You can make this smarter based on node type
    const merged = {
      features: [],
      labels: [],
      metadata: {
        sources: inputs.length,
        mergedAt: Date.now()
      }
    };

    inputs.forEach(input => {
      if (input.features) {
        merged.features = merged.features.concat(input.features);
      }
      if (input.labels) {
        merged.labels = merged.labels.concat(input.labels);
      }
    });

    return merged;
  }

  /**
   * Store output data from a node
   */
  setNodeOutput(nodeId, data) {
    this.nodeData.set(nodeId, data);
  }

  /**
   * Get stored output from a node
   */
  getNodeOutput(nodeId) {
    return this.nodeData.get(nodeId);
  }

  /**
   * Clear all stored data
   */
  clear() {
    this.nodeData.clear();
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow() {
    const errors = [];

    // Check for at least one input node
    const inputNodes = this.nodes.filter(node => 
      node.data.nodeType === 'input'
    );
    if (inputNodes.length === 0) {
      errors.push('Workflow must have at least one Input node');
    }

    // Check for at least one output node
    const outputNodes = this.nodes.filter(node => 
      node.data.nodeType === 'output'
    );
    if (outputNodes.length === 0) {
      errors.push('Workflow must have at least one Output node');
    }

    // Check for disconnected nodes (except input nodes)
    this.nodes.forEach(node => {
      if (node.data.nodeType === 'input') return;
      
      const hasIncoming = this.edges.some(edge => edge.target === node.id);
      if (!hasIncoming) {
        errors.push(`Node "${node.data.label}" is not connected to any input`);
      }
    });

    // Check output nodes have inputs
    outputNodes.forEach(node => {
      const hasIncoming = this.edges.some(edge => edge.target === node.id);
      if (!hasIncoming) {
        errors.push('Output node must be connected to processing nodes');
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get workflow summary
   */
  getSummary() {
    const nodeTypes = {};
    this.nodes.forEach(node => {
      const type = node.data.nodeType;
      nodeTypes[type] = (nodeTypes[type] || 0) + 1;
    });

    return {
      totalNodes: this.nodes.length,
      totalEdges: this.edges.length,
      nodeTypes,
      isValid: this.validateWorkflow().valid
    };
  }
}

export default DataFlow;