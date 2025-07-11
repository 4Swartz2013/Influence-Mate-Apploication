import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Save, 
  Bot, 
  Settings, 
  Brain, 
  MessageSquare, 
  Zap,
  Plus,
  Trash2,
  TestTube,
  Play
} from 'lucide-react';
import { AIAgent, AgentTool } from '../../types/influenceFlow';

interface AIAgentBuilderProps {
  agent?: AIAgent | null;
  onBack: () => void;
}

const AIAgentBuilder: React.FC<AIAgentBuilderProps> = ({ agent, onBack }) => {
  const [currentAgent, setCurrentAgent] = useState<AIAgent>(
    agent || {
      id: `agent_${Date.now()}`,
      name: 'New AI Agent',
      description: '',
      purpose: '',
      tools: [],
      memory: {
        enabled: false,
        type: 'vector_store',
        contextSize: 4000,
        recallSettings: {}
      },
      chatSettings: {
        systemPrompt: '',
        temperature: 0.7,
        topP: 0.9,
        outputMode: 'message',
        model: 'gpt-4'
      },
      executionLogic: {
        triggers: ['manual'],
        maxRetries: 3
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'memory' | 'chat' | 'execution'>('overview');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const availableTools = [
    {
      id: 'web_scraper',
      name: 'Web Scraper',
      description: 'Extract data from web pages',
      type: 'web_scraper' as const
    },
    {
      id: 'search_tool',
      name: 'Search Tool',
      description: 'Search the web for information',
      type: 'search_tool' as const
    },
    {
      id: 'api_call',
      name: 'API Call',
      description: 'Make HTTP requests to external APIs',
      type: 'api_call' as const
    },
    {
      id: 'data_extractor',
      name: 'Data Extractor',
      description: 'Extract and process structured data',
      type: 'data_extractor' as const
    },
    {
      id: 'code_interpreter',
      name: 'Code Interpreter',
      description: 'Execute Python code for data analysis',
      type: 'code_interpreter' as const
    }
  ];

  const handleSave = () => {
    // Save agent logic here
    console.log('Saving agent:', currentAgent);
  };

  const handleTestAgent = async () => {
    setIsTesting(true);
    // Simulate agent test
    setTimeout(() => {
      setTestResults({
        status: 'success',
        executionTime: '2.1s',
        output: {
          message: 'Agent executed successfully',
          response: 'Hello! I am your AI assistant. How can I help you today?',
          toolsUsed: currentAgent.tools.filter(t => t.enabled).length
        }
      });
      setIsTesting(false);
    }, 2000);
  };

  const addTool = (toolTemplate: any) => {
    const newTool: AgentTool = {
      id: `tool_${Date.now()}`,
      name: toolTemplate.name,
      type: toolTemplate.type,
      config: {},
      enabled: true
    };

    setCurrentAgent(prev => ({
      ...prev,
      tools: [...prev.tools, newTool],
      updatedAt: new Date().toISOString()
    }));
  };

  const removeTool = (toolId: string) => {
    setCurrentAgent(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t.id !== toolId),
      updatedAt: new Date().toISOString()
    }));
  };

  const toggleTool = (toolId: string) => {
    setCurrentAgent(prev => ({
      ...prev,
      tools: prev.tools.map(t => 
        t.id === toolId ? { ...t, enabled: !t.enabled } : t
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agent Name
        </label>
        <input
          type="text"
          value={currentAgent.name}
          onChange={(e) => setCurrentAgent(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter agent name..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={currentAgent.description}
          onChange={(e) => setCurrentAgent(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="Describe what this agent does..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Purpose
        </label>
        <textarea
          value={currentAgent.purpose}
          onChange={(e) => setCurrentAgent(prev => ({ ...prev, purpose: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={2}
          placeholder="What is the main purpose of this agent?"
        />
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Agent Tools</h4>
        <div className="relative">
          <select
            onChange={(e) => {
              const tool = availableTools.find(t => t.id === e.target.value);
              if (tool) addTool(tool);
              e.target.value = '';
            }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Add Tool...</option>
            {availableTools
              .filter(tool => !currentAgent.tools.some(t => t.type === tool.type))
              .map(tool => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {currentAgent.tools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium mb-1">No tools added yet</p>
          <p className="text-sm">Add tools to give your agent capabilities</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentAgent.tools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">{tool.name}</h5>
                  <p className="text-sm text-gray-600">{tool.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tool.enabled}
                    onChange={() => toggleTool(tool.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled</span>
                </label>
                <button
                  onClick={() => removeTool(tool.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMemoryTab = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={currentAgent.memory.enabled}
            onChange={(e) => setCurrentAgent(prev => ({
              ...prev,
              memory: { ...prev.memory, enabled: e.target.checked }
            }))}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Enable Memory</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Allow the agent to remember previous conversations and context
        </p>
      </div>

      {currentAgent.memory.enabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Type
            </label>
            <select
              value={currentAgent.memory.type}
              onChange={(e) => setCurrentAgent(prev => ({
                ...prev,
                memory: { ...prev.memory, type: e.target.value as any }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="vector_store">Vector Store</option>
              <option value="supabase">Supabase</option>
              <option value="redis">Redis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Context Size
            </label>
            <input
              type="number"
              value={currentAgent.memory.contextSize}
              onChange={(e) => setCurrentAgent(prev => ({
                ...prev,
                memory: { ...prev.memory, contextSize: parseInt(e.target.value) }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="4000"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt
        </label>
        <textarea
          value={currentAgent.chatSettings.systemPrompt}
          onChange={(e) => setCurrentAgent(prev => ({
            ...prev,
            chatSettings: { ...prev.chatSettings, systemPrompt: e.target.value }
          }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="You are a helpful AI assistant..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature
          </label>
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={currentAgent.chatSettings.temperature}
            onChange={(e) => setCurrentAgent(prev => ({
              ...prev,
              chatSettings: { ...prev.chatSettings, temperature: parseFloat(e.target.value) }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top P
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={currentAgent.chatSettings.topP}
            onChange={(e) => setCurrentAgent(prev => ({
              ...prev,
              chatSettings: { ...prev.chatSettings, topP: parseFloat(e.target.value) }
            }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model
        </label>
        <select
          value={currentAgent.chatSettings.model}
          onChange={(e) => setCurrentAgent(prev => ({
            ...prev,
            chatSettings: { ...prev.chatSettings, model: e.target.value }
          }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="claude-3-haiku">Claude 3 Haiku</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Mode
        </label>
        <select
          value={currentAgent.chatSettings.outputMode}
          onChange={(e) => setCurrentAgent(prev => ({
            ...prev,
            chatSettings: { ...prev.chatSettings, outputMode: e.target.value as any }
          }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="message">Message</option>
          <option value="api_payload">API Payload</option>
          <option value="internal_variable">Internal Variable</option>
        </select>
      </div>
    </div>
  );

  const renderExecutionTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Types
        </label>
        <div className="space-y-2">
          {['manual', 'message_step', 'api', 'internal_trigger'].map((trigger) => (
            <label key={trigger} className="flex items-center">
              <input
                type="checkbox"
                checked={currentAgent.executionLogic.triggers.includes(trigger)}
                onChange={(e) => {
                  const triggers = e.target.checked
                    ? [...currentAgent.executionLogic.triggers, trigger]
                    : currentAgent.executionLogic.triggers.filter(t => t !== trigger);
                  
                  setCurrentAgent(prev => ({
                    ...prev,
                    executionLogic: { ...prev.executionLogic, triggers }
                  }));
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {trigger.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Retries
        </label>
        <input
          type="number"
          min="0"
          max="10"
          value={currentAgent.executionLogic.maxRetries}
          onChange={(e) => setCurrentAgent(prev => ({
            ...prev,
            executionLogic: { ...prev.executionLogic, maxRetries: parseInt(e.target.value) }
          }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fallback Response
        </label>
        <textarea
          value={currentAgent.executionLogic.fallbackResponse || ''}
          onChange={(e) => setCurrentAgent(prev => ({
            ...prev,
            executionLogic: { ...prev.executionLogic, fallbackResponse: e.target.value }
          }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
          placeholder="Response when agent fails..."
        />
      </div>

      {/* Test Agent Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Test Agent</h4>
          <button
            onClick={handleTestAgent}
            disabled={isTesting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Test Agent
              </>
            )}
          </button>
        </div>

        {testResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-800">Agent Test Passed</span>
              <span className="text-xs text-gray-500">({testResults.executionTime})</span>
            </div>
            <div className="text-sm text-green-700 mb-2">
              Response: {testResults.output.response}
            </div>
            <div className="text-xs text-gray-600">
              Tools used: {testResults.output.toolsUsed}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'tools', label: 'Tools', icon: Zap },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'chat', label: 'Chat Settings', icon: MessageSquare },
    { id: 'execution', label: 'Execution Logic', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back to Agents</span>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentAgent.name}
              </h1>
              <p className="text-sm text-gray-600">AI Agent Configuration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Agent
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'tools' && renderToolsTab()}
          {activeTab === 'memory' && renderMemoryTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'execution' && renderExecutionTab()}
        </div>
      </div>
    </div>
  );
};

export default AIAgentBuilder;