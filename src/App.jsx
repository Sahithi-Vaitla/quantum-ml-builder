import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import Navbar from './components/Navbar';
import NodePalette from './components/NodePalette';
import Canvas from './components/Canvas';
import EnhancedResultsPanel from './components/EnhancedResultsPanel';
import OnboardingModal from './components/OnboardingModal';
import QuantumCat from './components/QuantumCat';
import CSVUpload from './components/CSVUpload';
// Import computation engines
import DataFlow from './engine/DataFlow';
import MLEngine from './engine/MLEngine';
import QuantumSimulator from './engine/QuantumSimulator';
import ResultsProcessor from './engine/ResultsProcessor';
import InputConfigModal from './components/InputConfigModal';
import PreprocessConfigModal from './components/PreprocessConfigModal';
import MLConfigModal from './components/MLConfigModal';
import QuantumConfigModal from './components/QuantumConfigModal';
import WorkflowValidator from './utils/WorkflowValidator';
import ValidationModal from './components/ValidationModal';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [workflowResults, setWorkflowResults] = useState(null);
  const [executionProgress, setExecutionProgress] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [uploadedCSV, setUploadedCSV] = useState(null);
  const [toast, setToast] = useState(null);
  const [showInputConfig, setShowInputConfig] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPreprocessConfig, setShowPreprocessConfig] = useState(false);
  const [preprocessConfig, setPreprocessConfig] = useState(null);
  const [showMLConfig, setShowMLConfig] = useState(false);
  const [mlConfig, setMLConfig] = useState(null);
  const [showQuantumConfig, setShowQuantumConfig] = useState(false);
  const [quantumConfig, setQuantumConfig] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('quantum-ml-onboarding-seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Show toast notification
  const showToast = (message, details, type = 'success') => {
    setToast({ message, details, type });
    setTimeout(() => setToast(null), 3000);
  };

  const attachCSVToInputNodes = (csvData) => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.data?.nodeType === 'input') {
          return {
            ...node,
            data: {
              ...node.data,
              customData: csvData,
              config: {
                ...node.data.config,
                dataset: 'custom'
              }
            }
          };
        }
        return node;
      })
    );
  };

  // ========================================
  // NEW: PRE-RUN VALIDATION FUNCTION
  // ========================================
  const handleRunWorkflow = () => {
    console.log('🔍 Starting pre-run validation...');
    
    // Create validator and run validation
    const validator = new WorkflowValidator(nodes, edges, uploadedCSV);
    const result = validator.validate();
    
    console.log('📋 Validation result:', result);
    
    // Store result and show modal
    setValidationResult(result);
    setShowValidationModal(true);
    
    // The actual execution will happen when user clicks
    // "Run Workflow" in the ValidationModal
  };

  // ========================================
  // ACTUAL WORKFLOW EXECUTION (called after validation passes)
  // ========================================
  const executeWorkflow = async () => {
    setIsRunning(true);
    setExecutionProgress({ message: 'Initializing...', step: 0, total: nodes.length });
    
    try {
      const startTime = Date.now();
      console.log('🚀 Starting workflow execution...');

      // 1. Create DataFlow manager
      const dataFlow = new DataFlow(nodes, edges);

      // 2. Get execution order
      const executionOrder = dataFlow.getExecutionOrder();
      console.log('📋 Execution order:', executionOrder);

      // 3. Initialize engines
      const mlEngine = new MLEngine();
      const quantumSim = new QuantumSimulator();
      const resultsProcessor = new ResultsProcessor();

      // 4. Execute nodes in order
      let nodesExecuted = 0;
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        console.log(`⚙️ Executing node: ${node.data.label} (${node.data.nodeType})`);
        
        setExecutionProgress({
          message: `Processing ${node.data.label}`,
          step: nodesExecuted + 1,
          total: executionOrder.length
        });

        const inputs = dataFlow.getNodeInputs(nodeId);
        let output;

        switch (node.data.nodeType) {
          case 'input':
            // Load uploaded CSV data
            const csvData = node.data.customData || uploadedCSV;
            
            if (!csvData) {
              throw new Error('No CSV data available');
            }
            
            console.log('📊 CSV Data:', csvData);
            
            if (csvData.data && Array.isArray(csvData.data)) {
              output = {
                features: csvData.data,
                labels: csvData.labels || [],
                name: csvData.metadata?.filename || 'Custom CSV'
              };
            } else if (csvData.features && Array.isArray(csvData.features)) {
              output = {
                features: csvData.features,
                labels: csvData.labels || [],
                name: csvData.name || 'Custom CSV'
              };
            } else {
              throw new Error('Invalid CSV data format. Please check your CSV file.');
            }
            
            console.log(`✅ Loaded ${output.name}:`, output);
            console.log(`   Features: ${output.features.length} rows x ${output.features[0]?.length || 0} columns`);
            console.log(`   Labels: ${output.labels.length} samples`);
            break;

          case 'preprocess':
            // Preprocess data (normalize, scale, etc)
            output = { ...inputs };
            const operations = node.data.config?.operations || ['normalize'];
            
            if (operations.includes('normalize')) {
              const features = inputs.features;
              
              if (!Array.isArray(features) || features.length === 0) {
                console.warn('⚠️ Invalid features format, skipping normalization');
                break;
              }

              const normalized = features.map(row => {
                if (!Array.isArray(row)) {
                  console.warn('⚠️ Row is not an array:', row);
                  return Array.isArray(row) ? row : [row];
                }
                
                const max = Math.max(...row);
                const min = Math.min(...row);
                const range = max - min || 1;
                
                return row.map(val => {
                  const numVal = parseFloat(val);
                  if (isNaN(numVal)) return 0;
                  return (numVal - min) / range;
                });
              });
              
              output.features = normalized;
              console.log('✅ Normalized data');
            }
            break;

          case 'ml':
            // DEBUG: Check what ML receives
            console.log('🔍 ML block received inputs:', inputs);

            // Train ML model
            const modelType = node.data.config?.modelType || 'perceptron';
            const epochs = node.data.config?.epochs || 50;
            const learningRate = 0.01;

            if (!inputs || !inputs.features || !Array.isArray(inputs.features)) {
              console.error('❌ Invalid input data for ML node');
              output = {
                error: 'Invalid input data format',
                type: 'ml',
                modelType
              };
              break;
            }

            const validFeatures = inputs.features.map(row => {
              if (!Array.isArray(row)) {
                return Array.isArray(row) ? row : [parseFloat(row) || 0];
              }
              return row.map(val => parseFloat(val) || 0);
            });

            const validLabels = inputs.labels 
              ? inputs.labels.map(label => parseInt(label) || 0)
              : [];

            const validatedInputs = {
              features: validFeatures,
              labels: validLabels
            };

            if (node.data.config?.task === 'clustering') {
              output = await mlEngine.trainClustering(validatedInputs, {
                k: node.data.config?.k || 3
              });
              console.log('✅ Clustering complete:', output);
            } else {
              output = await mlEngine.trainClassifier(validatedInputs, {
                modelType,
                epochs,
                learningRate
              });
              console.log('✅ ML training complete:', output.metrics);
            }

            // Preserve quantum transformation flags
            output.quantumTransformed = inputs.quantumTransformed || false;
            output.encodingMethod = inputs.encodingMethod || null;
            
            console.log('🔍 ML output quantumTransformed:', output.quantumTransformed);
            
            break;

          case 'quantum':
            // Run quantum circuit
            const numQubits = node.data.config?.numQubits || 2;
            const gates = node.data.config?.circuit || [
              { gate: 'H', qubits: [0] },
              { gate: 'CNOT', qubits: [0, 1] }
            ];
            const shots = node.data.config?.shots || 1000;
            const encodingMethod = node.data.config?.encodingMethod || 'angle';

            // Process ALL samples through quantum circuit
            const allQuantumFeatures = [];
            
            if (inputs && inputs.features && inputs.features.length > 0) {
              console.log(`📊 Processing ${inputs.features.length} samples through quantum circuit...`);
              
              // Process each sample
              for (let i = 0; i < inputs.features.length; i++) {
                const sampleData = inputs.features[i];
                
                const result = await quantumSim.runQuantumWorkflow({
                  numQubits,
                  gates,
                  shots,
                  inputData: sampleData,
                  encodingMethod
                });
                
                allQuantumFeatures.push(result.quantumFeatures);
              }
              
              console.log(`✅ Quantum processing complete: ${allQuantumFeatures.length} samples × ${allQuantumFeatures[0].length} features`);
            } else {
              // No input data, run default circuit once
              const result = await quantumSim.runQuantumWorkflow({
                numQubits,
                gates,
                shots,
                inputData: null,
                encodingMethod
              });
              
              allQuantumFeatures.push(result.quantumFeatures);
            }

            // Create output with quantum features
            output = {
              circuit: gates,
              measurements: allQuantumFeatures, // For visualization
              features: allQuantumFeatures,     // For ML
              labels: inputs?.labels || [],
              numQubits,
              gatesApplied: gates.length,
              encodingMethod,
              quantumTransformed: true
            };

            console.log('🔍 QUANTUM OUTPUT:', output);
            console.log('🔍 quantumTransformed flag:', output.quantumTransformed);
            
            break;

          case 'output':
            // Process results for display
            if (!inputs) {
              output = { error: 'No input data for output node' };
              break;
            }

            if (inputs.modelType) {
              output = resultsProcessor.processMLResults(inputs);
            } else if (inputs.circuit) {
              output = resultsProcessor.processQuantumResults(inputs);
            } else if (inputs.centroids) {
              output = resultsProcessor.processClusteringResults(inputs);
            } else {
              output = { 
                type: 'info',
                message: 'Workflow executed successfully',
                data: inputs 
              };
            }

            output.executionTime = Date.now() - startTime;
            output.nodesExecuted = nodesExecuted;
            output.success = true;

            console.log('✅ Results processed:', output);
            break;

          default:
            output = inputs;
        }

        dataFlow.setNodeOutput(nodeId, output);
        nodesExecuted++;

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // 5. Get final results from output node
      const outputNode = nodes.find(n => n.data.nodeType === 'output');
      if (outputNode) {
        const finalResults = dataFlow.getNodeOutput(outputNode.id);
        setWorkflowResults(finalResults);
        setShowResults(true);
        setShowSuccess(true);
        console.log('🎉 Workflow complete!', finalResults);
        
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.log('⚠️ No output node found');
        setWorkflowResults({
          type: 'info',
          message: 'Workflow executed successfully, but no output node found to display results.',
          nodesExecuted,
          executionTime: Date.now() - startTime
        });
        setShowResults(true);
      }

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      setWorkflowResults({
        type: 'error',
        error: error.message,
        stack: error.stack
      });
      setShowResults(true);
    } finally {
      setIsRunning(false);
      setExecutionProgress(null);
    }
  };

  const handleSaveWorkflow = () => {
    const workflow = { nodes, edges };
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum-ml-workflow-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadWorkflow = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target.result);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          console.error('Error loading workflow:', error);
          setWorkflowResults({
            type: 'error',
            error: 'Invalid workflow file format'
          });
          setShowResults(true);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadTemplate = (templateId) => {
    const templates = {
      'simple-ml': {
        nodes: [
          {
            id: 'input-1',
            type: 'custom',
            position: { x: 50, y: 200 },
            data: { 
              label: 'Input', 
              icon: '🗄️',
              nodeType: 'input',
              config: {}
            }
          },
          {
            id: 'preprocess-1',
            type: 'custom',
            position: { x: 300, y: 200 },
            data: { 
              label: 'Preprocess', 
              icon: '🎛️',
              nodeType: 'preprocess',
              config: { operations: ['normalize'] }
            }
          },
          {
            id: 'ml-1',
            type: 'custom',
            position: { x: 550, y: 200 },
            data: { 
              label: 'Classical ML', 
              icon: '🧠',
              nodeType: 'ml',
              config: {
                modelType: 'perceptron',
                epochs: 50
              }
            }
          },
          {
            id: 'output-1',
            type: 'custom',
            position: { x: 800, y: 200 },
            data: { 
              label: 'Output', 
              icon: '📊',
              nodeType: 'output',
              config: {}
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'input-1', target: 'preprocess-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e2-3', source: 'preprocess-1', target: 'ml-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e3-4', source: 'ml-1', target: 'output-1', sourceHandle: 'right', targetHandle: 'left' }
        ]
      },
      'quantum-bell': {
        nodes: [
          {
            id: 'input-1',
            type: 'custom',
            position: { x: 100, y: 200 },
            data: { 
              label: 'Input', 
              icon: '🗄️',
              nodeType: 'input',
              config: {}
            }
          },
          {
            id: 'quantum-1',
            type: 'custom',
            position: { x: 400, y: 200 },
            data: { 
              label: 'Quantum Circuit', 
              icon: '⚛️',
              nodeType: 'quantum',
              config: {
                numQubits: 2,
                circuit: [
                  { gate: 'H', qubits: [0] },
                  { gate: 'CNOT', qubits: [0, 1] }
                ],
                shots: 1000
              }
            }
          },
          {
            id: 'output-1',
            type: 'custom',
            position: { x: 700, y: 200 },
            data: { 
              label: 'Output', 
              icon: '📊',
              nodeType: 'output',
              config: {}
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'input-1', target: 'quantum-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e2-3', source: 'quantum-1', target: 'output-1', sourceHandle: 'right', targetHandle: 'left' }
        ]
      },
      'clustering': {
        nodes: [
          {
            id: 'input-1',
            type: 'custom',
            position: { x: 350, y: 50 },
            data: { 
              label: 'Input', 
              icon: '🗄️',
              nodeType: 'input',
              config: {}
            }
          },
          {
            id: 'preprocess-1',
            type: 'custom',
            position: { x: 350, y: 180 },
            data: { 
              label: 'Preprocess', 
              icon: '🎛️',
              nodeType: 'preprocess',
              config: { operations: ['normalize'] }
            }
          },
          {
            id: 'ml-1',
            type: 'custom',
            position: { x: 350, y: 310 },
            data: { 
              label: 'K-Means Clustering', 
              icon: '🔮',
              nodeType: 'ml',
              config: {
                task: 'clustering',
                k: 3
              }
            }
          },
          {
            id: 'output-1',
            type: 'custom',
            position: { x: 350, y: 440 },
            data: { 
              label: 'Output', 
              icon: '📊',
              nodeType: 'output',
              config: {}
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'input-1', target: 'preprocess-1', sourceHandle: 'bottom', targetHandle: 'top' },
          { id: 'e2-3', source: 'preprocess-1', target: 'ml-1', sourceHandle: 'bottom', targetHandle: 'top' },
          { id: 'e3-4', source: 'ml-1', target: 'output-1', sourceHandle: 'bottom', targetHandle: 'top' }
        ]
      },
      'full-pipeline': {
        nodes: [
          {
            id: 'input-1',
            type: 'custom',
            position: { x: 50, y: 220 },
            data: { 
              label: 'Input', 
              icon: '🗄️',
              nodeType: 'input',
              config: {}
            }
          },
          {
            id: 'preprocess-1',
            type: 'custom',
            position: { x: 300, y: 220 },
            data: { 
              label: 'Preprocess', 
              icon: '🎛️',
              nodeType: 'preprocess',
              config: { operations: ['normalize'] }
            }
          },
          {
            id: 'ml-1',
            type: 'custom',
            position: { x: 550, y: 130 },
            data: { 
              label: 'Classical ML', 
              icon: '🧠',
              nodeType: 'ml',
              config: {
                modelType: 'logistic',
                epochs: 100
              }
            }
          },
          {
            id: 'quantum-1',
            type: 'custom',
            position: { x: 550, y: 310 },
            data: { 
              label: 'Quantum Circuit', 
              icon: '⚛️',
              nodeType: 'quantum',
              config: {
                numQubits: 2,
                circuit: [
                  { gate: 'H', qubits: [0] },
                  { gate: 'CNOT', qubits: [0, 1] }
                ],
                shots: 1000
              }
            }
          },
          {
            id: 'output-1',
            type: 'custom',
            position: { x: 850, y: 220 },
            data: { 
              label: 'Output', 
              icon: '📊',
              nodeType: 'output',
              config: {}
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'input-1', target: 'preprocess-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e2-3', source: 'preprocess-1', target: 'ml-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e2-4', source: 'preprocess-1', target: 'quantum-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e3-5', source: 'ml-1', target: 'output-1', sourceHandle: 'right', targetHandle: 'left' },
          { id: 'e4-5', source: 'quantum-1', target: 'output-1', sourceHandle: 'right', targetHandle: 'left' }
        ]
      }
    };

    const template = templates[templateId];
    if (template) {
      setNodes(template.nodes);
      setEdges(template.edges);
    }
  };

  const handleCSVUpload = () => {
    setShowCSVUpload(true);
  };

  const handleCSVLoaded = (data) => {
    setUploadedCSV(data);
    attachCSVToInputNodes(data);
    setShowCSVUpload(false);
    
    // Show toast banner on screen (not in results panel)
    showToast(
      '✅ CSV Uploaded Successfully',
      `${data.shape[0]} samples × ${data.shape[1]} features • ${data.metadata?.filename || 'data.csv'}`,
      'success'
    );
    
    console.log(`✅ CSV loaded: ${data.shape[0]} samples, ${data.shape[1]} features`);
  };

  return (
    <ReactFlowProvider>
      <div className="app-container">
        <Navbar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onRun={handleRunWorkflow}
          onSave={handleSaveWorkflow}
          onLoad={handleLoadWorkflow}
          onShowOnboarding={() => setShowOnboarding(true)}
          onUploadCSV={handleCSVUpload}
          hasUploadedData={uploadedCSV !== null}
        />

        <div className="main-layout">
          <NodePalette onLoadTemplate={handleLoadTemplate} />

          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            isRunning={isRunning}
            uploadedCSV={uploadedCSV}
            onNodeClick={(node) => {
              if (node.data.nodeType === 'input') {
                setShowInputConfig(true);
              } else if (node.data.nodeType === 'preprocess') {
                setShowPreprocessConfig(true);
                setSelectedNode(node);
              } else if (node.data.nodeType === 'ml') {
                setShowMLConfig(true);
                setSelectedNode(node);
              } else if (node.data.nodeType === 'quantum') {
                setShowQuantumConfig(true);
                setSelectedNode(node);
              }
            }}
          />

          <EnhancedResultsPanel
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            showSuccess={showSuccess}
            workflowResults={workflowResults}
          />
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`toast-notification toast-${toast.type}`}>
            <div className="toast-content">
              <div className="toast-icon">
                {toast.type === 'success' ? '✓' : '⚠'}
              </div>
              <div className="toast-text">
                <div className="toast-message">{toast.message}</div>
                {toast.details && (
                  <div className="toast-details">{toast.details}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Running Overlay Animation */}
        {isRunning && (
          <div className="running-overlay">
            <div className="quantum-ripple"></div>
            <div className="quantum-ripple ripple-delay-1"></div>
            <div className="quantum-ripple ripple-delay-2"></div>
            <div className="running-text">
              {executionProgress 
                ? `${executionProgress.message} (${executionProgress.step}/${executionProgress.total})`
                : 'Executing quantum-ML workflow...'}
            </div>
          </div>
        )}

        {/* Success Celebration Animation */}
        {showSuccess && !isRunning && (
          <div className="success-overlay">
            <div className="success-burst">
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
              <div className="burst-particle"></div>
            </div>
            <div className="success-message">
              <div className="success-icon">✨</div>
              <h2>Workflow Complete!</h2>
              <p>Check results panel →</p>
            </div>
          </div>
        )}

        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            localStorage.setItem('quantum-ml-onboarding-seen', 'true');
          }}
        />

        {showCSVUpload && (
          <CSVUpload
            onDataLoaded={handleCSVLoaded}
            onClose={() => setShowCSVUpload(false)}
          />
        )}

        <QuantumCat />

        {showInputConfig && (
          <InputConfigModal
            isOpen={showInputConfig}
            onClose={() => setShowInputConfig(false)}
            csvData={uploadedCSV}
          />
        )}

        {showPreprocessConfig && (
          <PreprocessConfigModal
            isOpen={showPreprocessConfig}
            onClose={() => setShowPreprocessConfig(false)}
            csvData={uploadedCSV}
            onApply={(config) => {
              setPreprocessConfig(config);
              
              // Update the node's config with the new settings
              if (selectedNode) {
                setNodes(prevNodes =>
                  prevNodes.map(node =>
                    node.id === selectedNode.id
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            config: {
                              ...node.data.config,
                              ...config
                            }
                          }
                        }
                      : node
                  )
                );
              }
              
              // Show success toast
              showToast(
                '✅ Preprocessing Configured',
                `Operation: ${config.operation.toUpperCase()} • Train/Test: ${config.trainSplit}/${100-config.trainSplit}`,
                'success'
              );
            }}
          />
        )}

        {showMLConfig && (
          <MLConfigModal
            isOpen={showMLConfig}
            onClose={() => setShowMLConfig(false)}
            csvData={uploadedCSV}
            onApply={(config) => {
              setMLConfig(config);
              
              // Update the node's config with the new settings
              if (selectedNode) {
                setNodes(prevNodes =>
                  prevNodes.map(node =>
                    node.id === selectedNode.id
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            config: {
                              ...node.data.config,
                              ...config
                            }
                          }
                        }
                      : node
                  )
                );
              }
              
              // Show success toast
              const taskName = config.task === 'clustering' 
                ? `K-Means (k=${config.k})` 
                : `${config.modelType.toUpperCase()} • ${config.epochs} epochs`;
              
              showToast(
                '✅ ML Model Configured',
                `Task: ${config.task.toUpperCase()} • ${taskName}`,
                'success'
              );
            }}
          />
        )}

        {showQuantumConfig && (
          <QuantumConfigModal
            isOpen={showQuantumConfig}
            onClose={() => setShowQuantumConfig(false)}
            onApply={(config) => {
              setQuantumConfig(config);
              
              // Update the node's config with the new settings
              if (selectedNode) {
                setNodes(prevNodes =>
                  prevNodes.map(node =>
                    node.id === selectedNode.id
                      ? {
                          ...node,
                          data: {
                            ...node.data,
                            config: {
                              ...node.data.config,
                              ...config
                            }
                          }
                        }
                      : node
                  )
                );
              }
              
              // Show success toast
              showToast(
                '✅ Quantum Circuit Configured',
                `${config.numQubits} qubits • ${config.circuit.length} gates • ${config.shots} shots`,
                'success'
              );
            }}
          />
        )}

        {/* ========================================
            NEW: VALIDATION MODAL 
            ======================================== */}
        <ValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          validationResult={validationResult}
          onProceed={executeWorkflow}
        />

      </div>

      <style jsx>{`
        .app-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
          overflow: hidden;
        }

        .main-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 280px 1fr auto;
          gap: 0;
          overflow: hidden;
          position: relative;
        }

        /* Toast Notification */
        .toast-notification {
          position: fixed;
          top: 80px;
          right: 24px;
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 2000;
          animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          min-width: 320px;
          max-width: 420px;
        }

        [data-theme="dark"] .toast-notification {
          background: var(--bg-surface);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          border-left: 4px solid #10b981;
        }

        .toast-error {
          border-left: 4px solid #ef4444;
        }

        .toast-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .toast-success .toast-icon {
          background: #10b981;
          color: white;
        }

        .toast-error .toast-icon {
          background: #ef4444;
          color: white;
        }

        .toast-text {
          flex: 1;
        }

        .toast-message {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .toast-details {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Running Overlay */
        .running-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .quantum-ripple {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 3px solid var(--quantum-accent);
          animation: ripple 2s ease-out infinite;
        }

        .quantum-ripple.ripple-delay-1 {
          animation-delay: 0.5s;
        }

        .quantum-ripple.ripple-delay-2 {
          animation-delay: 1s;
        }

        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }

        .running-text {
          margin-top: 40px;
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--quantum-accent);
          animation: pulse-text 1.5s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Success Overlay */
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          pointer-events: none;
          animation: successFadeIn 0.5s ease;
        }

        @keyframes successFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-burst {
          position: absolute;
          width: 300px;
          height: 300px;
        }

        .burst-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          animation: burstOut 1s ease-out forwards;
        }

        .burst-particle:nth-child(1) {
          animation-delay: 0s;
          --angle: 0deg;
        }

        .burst-particle:nth-child(2) {
          animation-delay: 0.1s;
          --angle: 60deg;
        }

        .burst-particle:nth-child(3) {
          animation-delay: 0.2s;
          --angle: 120deg;
        }

        .burst-particle:nth-child(4) {
          animation-delay: 0.3s;
          --angle: 180deg;
        }

        .burst-particle:nth-child(5) {
          animation-delay: 0.4s;
          --angle: 240deg;
        }

        .burst-particle:nth-child(6) {
          animation-delay: 0.5s;
          --angle: 300deg;
        }

        @keyframes burstOut {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-150px) scale(0);
            opacity: 0;
          }
        }

        .success-message {
          text-align: center;
          color: white;
          z-index: 1;
          animation: successMessagePop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes successMessagePop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-icon {
          font-size: 4rem;
          animation: iconRotate 0.8s ease;
          margin-bottom: 16px;
        }

        @keyframes iconRotate {
          0% {
            transform: rotate(0deg) scale(0);
          }
          50% {
            transform: rotate(180deg) scale(1.3);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .success-message h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .success-message p {
          font-size: 1rem;
          margin: 0;
          opacity: 0.9;
        }

        @media (max-width: 1024px) {
          .main-layout {
            grid-template-columns: 240px 1fr;
          }
        }

        @media (max-width: 768px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
          
          .toast-notification {
            right: 12px;
            left: 12px;
            min-width: auto;
          }
        }
      `}</style>
    </ReactFlowProvider>
  );
}

export default App;