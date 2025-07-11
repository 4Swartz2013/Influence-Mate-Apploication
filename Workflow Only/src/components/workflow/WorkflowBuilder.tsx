import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronLeft, Play, Save, MoreHorizontal, TestTube, Share } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import CustomNode from './CustomNode';
import AddNodeButton from './AddNodeButton';
import NodeConfigPanel from './NodeConfigPanel';
import NodeLibrary from './NodeLibrary';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowBuilderProps {
  onBack: () => void;
}

const WorkflowBuilderContent: React.FC<WorkflowBuilderProps> = ({ onBack }) => {
  const { 
    currentWorkflow, 
    selectedNode, 
    isConfigPanelOpen,
    updateWorkflow,
    addNode,
    addEdge: addWorkflowEdge,
    setSelectedNode,
    setConfigPanelOpen
  } = useWorkflowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name || 'New Workflow');
  const [isEditingName, setIsEditingName] = useState(false);

  const reactFlowInstance = useReactFlow();

  // Initialize nodes and edges from current workflow
  React.useEffect(() => {
    if (currentWorkflow) {
      const flowNodes = currentWorkflow.nodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: node.data
      }));
      
      const flowEdges = currentWorkflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        label: edge.label,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setWorkflowName(currentWorkflow.name);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'default',
        style: { stroke: '#6366f1', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      if (params.source && params.target) {
        addWorkflowEdge({
          source: params.source,
          target: params.target,
          type: 'default'
        });
      }
    },
    [setEdges, addWorkflowEdge]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const workflowNode = currentWorkflow?.nodes.find(n => n.id === node.id);
    if (workflowNode) {
      setSelectedNode(workflowNode);
    }
  }, [currentWorkflow, setSelectedNode]);

  const handleAddNode = (nodeTemplate: any, position?: { x: number; y: number }) => {
    const newPosition = position || { 
      x: Math.random() * 400 + 100, 
      y: Math.random() * 400 + 100 
    };

    const newNode = {
      type: nodeTemplate.type,
      position: newPosition,
      data: {
        label: nodeTemplate.label,
        subtitle: nodeTemplate.subtitle || '',
        description: nodeTemplate.description,
        icon: nodeTemplate.icon,
        integration: nodeTemplate.integration,
        config: nodeTemplate.config || {},
        status: 'idle' as const
      }
    };

    addNode(newNode);
    setShowNodeLibrary(false);
  };

  const handleSave = () => {
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        name: workflowName,
        status: 'draft'
      });
    }
  };

  const handleTest = () => {
    console.log('Testing workflow...');
  };

  const handleDeploy = () => {
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, {
        status: 'published'
      });
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (currentWorkflow) {
      updateWorkflow(currentWorkflow.id, { name: workflowName });
    }
  };

  if (!currentWorkflow) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No workflow selected</h2>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Go back to integrations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Toolbar - Exact Paragon styling */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Integrations / Mailchimp</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
              onClick={handleNameEdit}
            >
              {workflowName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="text-gray-600 hover:text-gray-900 text-sm">
            Test Connect Portal
          </button>
          <button 
            onClick={handleTest}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
          >
            <TestTube className="w-4 h-4" />
            Test Workflow
          </button>
          <button 
            onClick={handleDeploy}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Deploy
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Background 
              color="#e5e7eb" 
              gap={20} 
              size={1}
              variant="dots"
            />
            <Controls 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              showInteractive={false}
            />
            <MiniMap 
              className="bg-white border border-gray-200 rounded-lg"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            
            {/* Add Node Buttons */}
            {nodes.length === 0 && (
              <Panel position="top-center" className="mt-20">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your workflow</h3>
                  <p className="text-gray-600 text-sm mb-4">Add your first trigger to get started</p>
                  <button
                    onClick={() => setShowNodeLibrary(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Trigger
                  </button>
                </div>
              </Panel>
            )}
          </ReactFlow>

          {/* Add Node Button Overlay */}
          <AddNodeButton onAddNode={() => setShowNodeLibrary(true)} />
        </div>

        {/* Right Panel - Node Configuration */}
        {isConfigPanelOpen && selectedNode && (
          <NodeConfigPanel 
            node={selectedNode}
            onClose={() => setConfigPanelOpen(false)}
          />
        )}
      </div>

      {/* Node Library Modal */}
      {showNodeLibrary && (
        <NodeLibrary
          onSelectNode={handleAddNode}
          onClose={() => setShowNodeLibrary(false)}
          integration={currentWorkflow.integration}
        />
      )}
    </div>
  );
};

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowBuilder;