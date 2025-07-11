import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MoreHorizontal, Copy, Trash2, Play } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

const CustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { setSelectedNode, deleteNode, currentWorkflow } = useWorkflowStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleClick = () => {
    const node = currentWorkflow?.nodes.find(n => n.id === id);
    if (node) {
      setSelectedNode(node);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
    setShowMenu(false);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement copy functionality
    setShowMenu(false);
  };

  const getNodeIcon = () => {
    switch (data.integration) {
      case 'mailchimp':
        return '🐵';
      case 'slack':
        return '💬';
      case 'function':
        return '⚡';
      case 'request':
        return '🌐';
      case 'response':
        return '✅';
      case 'conditional':
        return '🔀';
      case 'fanout':
        return '📤';
      case 'delay':
        return '⏰';
      default:
        return data.icon || '⚙️';
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'running':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const isConditionalNode = data.type === 'condition' || data.type === 'conditional';

  return (
    <div className="relative group">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-300 border-2 border-white rounded-full"
        style={{ top: -6 }}
      />

      {/* Node Body */}
      <div
        onClick={handleClick}
        className={`
          bg-white border-2 rounded-lg shadow-sm min-w-[200px] cursor-pointer transition-all
          ${selected ? 'border-indigo-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        {/* Node Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-lg">{getNodeIcon()}</div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{data.label}</div>
                {data.subtitle && (
                  <div className="text-xs text-gray-500">{data.subtitle}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              
              {/* Menu Button */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Node Content */}
        {data.description && (
          <div className="p-3">
            <div className="text-xs text-gray-600">{data.description}</div>
          </div>
        )}
      </div>

      {/* Output Handles */}
      {isConditionalNode ? (
        <>
          {/* Yes Handle */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"
            style={{ bottom: -6, left: '25%' }}
          />
          {/* No Handle */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            className="w-3 h-3 bg-red-500 border-2 border-white rounded-full"
            style={{ bottom: -6, right: '25%' }}
          />
          
          {/* Labels */}
          <div className="absolute -bottom-6 left-1/4 transform -translate-x-1/2 text-xs text-green-600 font-medium">
            Yes
          </div>
          <div className="absolute -bottom-6 right-1/4 transform translate-x-1/2 text-xs text-red-600 font-medium">
            No
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-gray-300 border-2 border-white rounded-full"
          style={{ bottom: -6 }}
        />
      )}
    </div>
  );
};

export default CustomNode;