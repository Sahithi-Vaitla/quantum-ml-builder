import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType
} from 'reactflow';
import { Trash2 } from 'lucide-react';
import CustomNode from './CustomNode';

let id = 0;
const getId = () => `node_${id++}`;

const nodeIcons = {
  'input': '🗄️',
  'preprocess': '🎛️',
  'classical-ml': '🧠',
  'quantum': '⚛️',
  'output': '📊'
};

function Canvas({ nodes: initialNodes, edges: initialEdges, onNodesChange, onEdgesChange, uploadedCSV, isRunning, onNodeClick }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);


  // Sync with external node/edge changes (for templates)
useEffect(() => {
  setNodes(initialNodes);
}, [initialNodes, setNodes]);

useEffect(() => {
  setEdges(initialEdges);
}, [initialEdges, setEdges]);


  // Function to delete a node
  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  // Enhanced nodes with delete button AND info button
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onDelete: () => deleteNode(node.id),
        onConfigClick: onNodeClick,
      },
    }));
  }, [nodes, deleteNode, onNodeClick]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(
        {
          ...params,
          animated: true,
          type: 'smoothstep',
          interactionWidth: 20,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'var(--quantum-accent)',
          },
          style: {
            stroke: 'var(--quantum-accent)',
            strokeWidth: 2.5,
          },
        },
        edges
      );
      setEdges(newEdges);
      onEdgesChange(newEdges);
    },
    [edges, setEdges, onEdgesChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const icon = event.dataTransfer.getData('icon');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const nodeType = type === 'classical-ml' ? 'ml' : type;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 90,
        y: event.clientY - reactFlowBounds.top - 60,
      };

      const newNode = {
        id: getId(),
        type: 'custom',
        position,
        data: {
          label: label,
          icon: icon,
          nodeType: nodeType,
          config: {},
          onDelete: () => deleteNode(newNode.id),
          onConfigClick: onNodeClick,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      onNodesChange([...nodes, newNode]);
    },
    [nodes, setNodes, onNodesChange, deleteNode, onNodeClick]
  );

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge.id);
  }, []);

  const onEdgeMouseEnter = useCallback((event, edge) => {
    setHoveredEdge(edge.id);
  }, []);

  const onEdgeMouseLeave = useCallback(() => {
    setHoveredEdge(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
  }, []);

  const deleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);

  const onKeyDown = useCallback(
    (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdge) {
        deleteEdge();
      }
    },
    [selectedEdge, deleteEdge]
  );

  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: edge.id === selectedEdge ? 4 : edge.id === hoveredEdge ? 3.5 : 2.5,
        stroke:
          edge.id === selectedEdge
            ? '#ef4444'
            : edge.id === hoveredEdge
            ? '#f97316'
            : 'var(--quantum-accent)',
      },
    }));
  }, [edges, selectedEdge, hoveredEdge]);

  const isValidConnection = useCallback((connection) => {
    return connection.source !== connection.target;
  }, []);

  return (
    <div className="canvas-container" ref={reactFlowWrapper} onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={enhancedNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => {
          onNodesChangeInternal(changes);
          onNodesChange(nodes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChangeInternal(changes);
          onEdgesChange(edges);
        }}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        connectionRadius={25}
        isValidConnection={isValidConnection}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        preventScrolling={true}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        panOnDrag={true}
        nodesDraggable={true}
        elementsSelectable={true}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--quantum-accent)', strokeWidth: 2.5 }
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const colors = {
              input: '#3b82f6',
              preprocess: '#a855f7',
              ml: '#ec4899',
              quantum: '#14b8a6',
              output: '#f97316',
            };
            return colors[node.data?.nodeType] || '#94a3b8';
          }}
          style={{
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
          maskColor="rgba(248, 250, 252, 0.8)"
          position="bottom-right"
        />
      </ReactFlow>

      {isRunning && (
        <div className="running-canvas-overlay">
          <div className="energy-wave wave-1"></div>
          <div className="energy-wave wave-2"></div>
          <div className="energy-wave wave-3"></div>
        </div>
      )}

      {selectedEdge && (
        <div className="delete-edge-tooltip">
          <button onClick={deleteEdge} className="delete-edge-btn" aria-label="Delete connection">
            <Trash2 size={16} />
            <span>Delete Connection</span>
          </button>
          <p className="delete-hint">or press Delete/Backspace</p>
        </div>
      )}

      {nodes.length === 0 && (
        <div className="empty-state">
          <div className="quantum-field">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>
          <div className="empty-state-content">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="var(--quantum-accent)"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.3"
              />
              <circle cx="40" cy="40" r="6" fill="var(--quantum-accent)" opacity="0.5" />
            </svg>
            <h3>Start Building Your Workflow</h3>
            <p>Drag nodes from the left panel onto this canvas to begin</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .canvas-container {
          flex: 1;
          height: 100%;
          position: relative;
          background-color: var(--bg-primary);
          outline: none;
        }

        .running-canvas-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 5;
          overflow: hidden;
        }

        .energy-wave {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
          animation: energy-pulse 3s ease-out infinite;
          opacity: 0;
        }

        .energy-wave.wave-1 {
          animation-delay: 0s;
        }

        .energy-wave.wave-2 {
          animation-delay: 1s;
        }

        .energy-wave.wave-3 {
          animation-delay: 2s;
        }

        @keyframes energy-pulse {
          0% {
            transform: scale(0.8) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0;
          }
        }

        .delete-edge-tooltip {
          position: absolute;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 4px 16px var(--shadow-color);
          z-index: 10;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .delete-edge-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .delete-edge-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .delete-edge-btn:active {
          transform: translateY(0);
        }

        .delete-hint {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin: 6px 0 0 0;
          text-align: center;
        }

        .empty-state {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
          z-index: 1;
        }

        .quantum-field {
          position: absolute;
          width: 200px;
          height: 200px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--quantum-accent);
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
        }

        .particle:nth-child(1) {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle:nth-child(2) {
          top: 80%;
          left: 30%;
          animation-delay: 0.5s;
        }

        .particle:nth-child(3) {
          top: 50%;
          left: 70%;
          animation-delay: 1s;
        }

        .particle:nth-child(4) {
          top: 30%;
          left: 80%;
          animation-delay: 1.5s;
        }

        .particle:nth-child(5) {
          top: 70%;
          left: 60%;
          animation-delay: 2s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate(10px, -10px);
            opacity: 0.8;
          }
        }

        .empty-state-content {
          position: relative;
          z-index: 1;
        }

        .empty-state-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 20px 0 8px;
        }

        .empty-state-content p {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export default Canvas;