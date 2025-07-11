import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Settings, Plus } from 'lucide-react';
import WorkflowBuilder from './workflow/WorkflowBuilder';
import { useWorkflowStore } from '../store/workflowStore';

const WorkflowApp: React.FC = () => {
  const { workflows, createWorkflow, setCurrentWorkflow } = useWorkflowStore();
  const [showBuilder, setShowBuilder] = useState(false);

  const handleCreateWorkflow = () => {
    const workflow = createWorkflow('New Workflow');
    setCurrentWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleOpenWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      setCurrentWorkflow(workflow);
      setShowBuilder(true);
    }
  };

  if (showBuilder) {
    return <WorkflowBuilder onBack={() => setShowBuilder(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Designer</h1>
              <p className="text-gray-600">Build powerful automation workflows</p>
            </div>
          </div>
          <button
            onClick={handleCreateWorkflow}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {workflows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to Workflow Designer
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create powerful automation workflows with our visual builder. Connect different services and automate your business processes.
            </p>
            <button
              onClick={handleCreateWorkflow}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Your First Workflow
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Workflows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenWorkflow(workflow.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workflow.status === 'published' 
                        ? 'bg-green-100 text-green-700'
                        : workflow.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {workflow.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Nodes:</span>
                      <span>{workflow.nodes.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Connections:</span>
                      <span>{workflow.edges.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Updated:</span>
                      <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenWorkflow(workflow.id);
                      }}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle run workflow
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle settings
                      }}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowApp;