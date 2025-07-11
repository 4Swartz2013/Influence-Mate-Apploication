import React, { useState } from 'react';
import { X, Save, TestTube, ChevronRight } from 'lucide-react';
import { WorkflowNode } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface NodeConfigPanelProps {
  node: WorkflowNode;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onClose }) => {
  const { updateNode } = useWorkflowStore();
  const [config, setConfig] = useState(node.data.config || {});
  const [activeSection, setActiveSection] = useState('config');

  const handleSave = () => {
    updateNode(node.id, {
      data: {
        ...node.data,
        config
      }
    });
  };

  const handleTest = () => {
    console.log('Testing node:', node.id);
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">How should this Workflow be triggered?</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-blue-600">⏰</span>
            </div>
            <div className="text-sm font-medium text-gray-900">Scheduler</div>
            <div className="text-xs text-gray-500">Run this Workflow as a scheduled background job</div>
          </button>
          <button className="p-4 border border-indigo-300 bg-indigo-50 rounded-lg">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-indigo-600">⚡</span>
            </div>
            <div className="text-sm font-medium text-gray-900">App Event</div>
            <div className="text-xs text-gray-500">Trigger on an custom event sent from your app</div>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2 mx-auto">
            <span className="text-gray-600">🔗</span>
          </div>
          <div className="text-sm font-medium text-gray-900">Integration enabled</div>
          <div className="text-xs text-gray-500">Trigger when a user initially activates their Mailchimp integration</div>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
            <span className="text-green-600">📨</span>
          </div>
          <div className="text-sm font-medium text-gray-900">Request</div>
          <div className="text-xs text-gray-500">Trigger the workflow directly with the SDK or API</div>
        </button>
      </div>

      <div>
        <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors w-full">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
            <span className="text-purple-600">🐵</span>
          </div>
          <div className="text-sm font-medium text-gray-900">Mailchimp</div>
          <div className="text-xs text-gray-500">Trigger when subscribed or unsubscribed events occurs in Mailchimp lists</div>
        </button>
      </div>
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose an action
        </label>
        <select 
          value={config.action || ''}
          onChange={(e) => setConfig({ ...config, action: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select an action...</option>
          <optgroup label="Campaigns">
            <option value="create_campaign">Create Campaign</option>
            <option value="update_campaign">Update Campaign</option>
            <option value="send_campaign">Send Campaign</option>
            <option value="search_campaigns">Search Campaigns</option>
            <option value="get_campaign_by_id">Get Campaign by ID</option>
            <option value="delete_campaign_by_id">Delete Campaign by ID</option>
          </optgroup>
          <optgroup label="Lists/Audiences">
            <option value="create_list">Create List</option>
            <option value="get_list_by_id">Get List by ID</option>
            <option value="search_lists">Search Lists</option>
            <option value="add_contact_to_list">Add Contact to List</option>
            <option value="update_contact_in_list">Update Contact in List</option>
            <option value="get_contacts_from_list">Get Contacts from List</option>
          </optgroup>
        </select>
      </div>

      {config.action && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={config.campaignName || ''}
              onChange={(e) => setConfig({ ...config, campaignName: e.target.value })}
              placeholder="Enter campaign name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={config.subject || ''}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              placeholder="Enter subject line..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderConditionalConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition Logic
        </label>
        <textarea
          value={config.condition || ''}
          onChange={(e) => setConfig({ ...config, condition: e.target.value })}
          placeholder="{{email}}.includes('@gmail.com')"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use JavaScript expressions with variables in double braces
        </p>
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (node.type) {
      case 'trigger':
        return renderTriggerConfig();
      case 'action':
        return renderActionConfig();
      case 'condition':
        return renderConditionalConfig();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No configuration available for this node type.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{node.data.icon || '⚙️'}</span>
            <h3 className="font-semibold text-gray-900">
              {node.type === 'trigger' ? 'Edit Step' : 'Add a Step'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{node.type === 'trigger' ? 'Trigger' : node.data.label}</span>
          {node.data.integration && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="capitalize">{node.data.integration}</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveSection('config')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeSection === 'config'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {node.type === 'trigger' ? 'Trigger' : 'Configure'}
          </button>
          <button
            onClick={() => setActiveSection('test')}
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeSection === 'test'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Test Step
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'config' ? (
          <div className="p-4">
            {renderConfig()}
          </div>
        ) : (
          <div className="p-4">
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Test this step</h4>
              <p className="text-gray-600 text-sm mb-4">
                Run a test to see how this step performs with sample data.
              </p>
              <button
                onClick={handleTest}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Run Test
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;