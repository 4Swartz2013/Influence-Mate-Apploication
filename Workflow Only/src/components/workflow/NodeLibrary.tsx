import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { NodeTemplate } from '../../types/workflow';

interface NodeLibraryProps {
  onSelectNode: (template: NodeTemplate) => void;
  onClose: () => void;
  integration?: string;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onSelectNode, onClose, integration }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const nodeTemplates: NodeTemplate[] = [
    // Integration-specific nodes
    {
      type: 'action',
      label: 'Mailchimp',
      description: 'Connect your Mailchimp account to manage their campaigns and contacts in Mailchimp.',
      icon: '🐵',
      category: 'action',
      integration: 'mailchimp'
    },
    {
      type: 'action',
      label: 'Mailchimp Request',
      description: 'Make a request to the Mailchimp API',
      icon: '🐵',
      category: 'action',
      integration: 'mailchimp'
    },
    
    // Generic nodes
    {
      type: 'function',
      label: 'Function',
      description: 'Execute a custom JavaScript function and return a response.',
      icon: '⚡',
      category: 'logic'
    },
    {
      type: 'request',
      label: 'Request',
      description: 'Perform an asynchronous HTTP request to an API endpoint.',
      icon: '🌐',
      category: 'utility'
    },
    {
      type: 'response',
      label: 'Response',
      description: 'Sends an HTTP response. Can only be added to Workflows triggered by an API Endpoint.',
      icon: '✅',
      category: 'utility'
    },
    {
      type: 'condition',
      label: 'Conditional',
      description: 'Adds conditional logic that executes different paths depending on if the conditions are met.',
      icon: '🔀',
      category: 'logic'
    },
    {
      type: 'fanout',
      label: 'Fan Out',
      description: 'Iterates over each item in an array. Can only be added after a step that returns an array.',
      icon: '📤',
      category: 'logic'
    },
    {
      type: 'delay',
      label: 'Delay',
      description: 'Wait for a specified period of time before executing the next step.',
      icon: '⏰',
      category: 'utility'
    },
    {
      type: 'resource',
      label: 'Resources',
      description: 'Connect your internal API as a reusable Resource for Workflows.',
      icon: '🔗',
      category: 'utility'
    }
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'action', label: 'Actions' },
    { id: 'logic', label: 'Logic' },
    { id: 'utility', label: 'Utility' }
  ];

  const filteredTemplates = nodeTemplates.filter(template => {
    const matchesSearch = template.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectNode = (template: NodeTemplate) => {
    onSelectNode(template);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose a step to add</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search steps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {filteredTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleSelectNode(template)}
                className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                  {template.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{template.label}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </div>
                {template.integration && (
                  <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {template.integration}
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No steps found matching your criteria.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NodeLibrary;