import React, { useState } from 'react';
import { 
  X, 
  Save, 
  TestTube, 
  MessageSquare, 
  Clock, 
  Eye, 
  GitBranch, 
  Webhook, 
  Bot,
  Settings,
  Trash2,
  Play
} from 'lucide-react';
import { MessageStep } from '../../types/influenceFlow';

interface MessageStepConfigPanelProps {
  step: MessageStep;
  onClose: () => void;
  onUpdate: (updates: Partial<MessageStep>) => void;
  onDelete: () => void;
}

const MessageStepConfigPanel: React.FC<MessageStepConfigPanelProps> = ({
  step,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [config, setConfig] = useState(step.data.config);
  const [activeTab, setActiveTab] = useState<'config' | 'test'>('config');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    onUpdate({
      data: {
        ...step.data,
        config
      }
    });
    onClose();
  };

  const handleTest = async () => {
    setIsTesting(true);
    // Simulate test execution
    setTimeout(() => {
      setTestResults({
        status: 'success',
        executionTime: '0.8s',
        output: {
          message: 'Step executed successfully',
          data: { stepType: step.type, platform: step.data.platform }
        }
      });
      setIsTesting(false);
    }, 1500);
  };

  const getStepIcon = () => {
    switch (step.type) {
      case 'send_message':
        return MessageSquare;
      case 'delay':
        return Clock;
      case 'wait_for_reply':
        return Eye;
      case 'branch_condition':
        return GitBranch;
      case 'webhook_trigger':
        return Webhook;
      case 'run_agent':
        return Bot;
      default:
        return Settings;
    }
  };

  const renderStepConfig = () => {
    switch (step.type) {
      case 'send_message':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={step.data.platform || ''}
                onChange={(e) => onUpdate({
                  data: { ...step.data, platform: e.target.value as any }
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select platform...</option>
                <option value="instagram">Instagram DM</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Template
              </label>
              <textarea
                value={config.messageTemplate || ''}
                onChange={(e) => setConfig({ ...config, messageTemplate: e.target.value })}
                placeholder="Enter your message template..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use variables like {`{{firstName}}`} for personalization
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.personalization || false}
                  onChange={(e) => setConfig({ ...config, personalization: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Enable AI personalization</span>
              </label>
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Duration
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={config.delayAmount || ''}
                  onChange={(e) => setConfig({ ...config, delayAmount: parseInt(e.target.value) })}
                  placeholder="5"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <select
                  value={config.delayUnit || 'minutes'}
                  onChange={(e) => setConfig({ ...config, delayUnit: e.target.value as any })}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'wait_for_reply':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout Duration (minutes)
              </label>
              <input
                type="number"
                value={config.timeoutDuration || ''}
                onChange={(e) => setConfig({ ...config, timeoutDuration: parseInt(e.target.value) })}
                placeholder="60"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action on Timeout
              </label>
              <select
                value={config.timeoutAction || 'continue'}
                onChange={(e) => setConfig({ ...config, timeoutAction: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="continue">Continue to next step</option>
                <option value="end">End workflow</option>
                <option value="tag">Tag user and continue</option>
              </select>
            </div>
          </div>
        );

      case 'branch_condition':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition Type
              </label>
              <select
                value={config.conditionType || 'reply_received'}
                onChange={(e) => setConfig({ ...config, conditionType: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="reply_received">Reply received</option>
                <option value="time_elapsed">Time elapsed</option>
                <option value="custom_field">Custom field value</option>
                <option value="agent_decision">AI agent decision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition Logic
              </label>
              <textarea
                value={config.condition || ''}
                onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                placeholder="Enter condition logic..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>
          </div>
        );

      case 'webhook_trigger':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://api.example.com/webhook"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTTP Method
              </label>
              <select
                value={config.webhookMethod || 'POST'}
                onChange={(e) => setConfig({ ...config, webhookMethod: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>
        );

      case 'run_agent':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select AI Agent
              </label>
              <select
                value={config.agentId || ''}
                onChange={(e) => setConfig({ ...config, agentId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose an agent...</option>
                <option value="agent1">Content Assistant</option>
                <option value="agent2">Customer Support Bot</option>
                <option value="agent3">Lead Qualifier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fallback Response
              </label>
              <textarea
                value={config.fallbackResponse || ''}
                onChange={(e) => setConfig({ ...config, fallbackResponse: e.target.value })}
                placeholder="Response if agent fails..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No configuration available for this step type.</p>
          </div>
        );
    }
  };

  const renderTestSection = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TestTube className="w-8 h-8 text-gray-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Test this step</h4>
        <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
          Run a test to see how this step performs with sample data.
        </p>
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {isTesting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Test
            </>
          )}
        </button>
      </div>

      {testResults && (
        <div className="border-t border-gray-200 pt-6">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Test Results</h5>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-800">Test Passed</span>
              <span className="text-xs text-gray-500">({testResults.executionTime})</span>
            </div>
            <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(testResults.output, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );

  const StepIcon = getStepIcon();

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Configure Step</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {step.data.label}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configure
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'test'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Test Step
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'config' ? renderStepConfig() : renderTestSection()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <button
            onClick={() => onDelete()}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageStepConfigPanel;