import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Bot, 
  Workflow, 
  Plus, 
  Search, 
  Filter,
  Play,
  Pause,
  Settings,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import MessagingWorkflowBuilder from './MessagingWorkflowBuilder';
import AIAgentBuilder from './AIAgentBuilder';
import AIAgentBuilderNew from './AIAgentBuilderNew';
import { MessagingWorkflow, AIAgent } from '../../types/influenceFlow';

const InfluenceFlowDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'agents' | 'analytics'>('workflows');
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [showNewAgentBuilder, setShowNewAgentBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<MessagingWorkflow | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual data fetching
  const workflows: MessagingWorkflow[] = [
    {
      id: 'wf1',
      name: 'Instagram Welcome Sequence',
      description: 'Automated welcome message for new Instagram followers',
      steps: [],
      edges: [],
      status: 'active',
      triggerType: 'campaign',
      targetPlatforms: ['instagram'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'wf2',
      name: 'Email Nurture Campaign',
      description: 'Multi-step email sequence for lead nurturing',
      steps: [],
      edges: [],
      status: 'draft',
      triggerType: 'manual',
      targetPlatforms: ['email'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const agents: AIAgent[] = [
    {
      id: 'agent1',
      name: 'Content Assistant',
      description: 'AI agent for content creation and optimization',
      purpose: 'Help create engaging social media content',
      tools: [],
      memory: { enabled: true, type: 'vector_store', contextSize: 4000, recallSettings: {} },
      chatSettings: {
        systemPrompt: 'You are a helpful content creation assistant.',
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
  ];

  const stats = [
    {
      label: 'Active Workflows',
      value: workflows.filter(w => w.status === 'active').length,
      icon: Workflow,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'AI Agents',
      value: agents.length,
      icon: Bot,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      label: 'Messages Sent',
      value: '2.4k',
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'Response Rate',
      value: '68%',
      icon: BarChart3,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    }
  ];

  if (showWorkflowBuilder) {
    return (
      <MessagingWorkflowBuilder
        workflow={selectedWorkflow}
        onBack={() => {
          setShowWorkflowBuilder(false);
          setSelectedWorkflow(null);
        }}
      />
    );
  }

  if (showAgentBuilder) {
    return (
      <AIAgentBuilder
        agent={selectedAgent}
        onBack={() => {
          setShowAgentBuilder(false);
          setSelectedAgent(null);
        }}
      />
    );
  }

  if (showNewAgentBuilder) {
    return (
      <AIAgentBuilderNew
        agent={selectedAgent}
        onBack={() => {
          setShowNewAgentBuilder(false);
          setSelectedAgent(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Influence Flow</h1>
            <p className="text-gray-600">Messaging automation & AI agent orchestration</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWorkflowBuilder(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
            <button
              onClick={() => setShowNewAgentBuilder(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              New Agent
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} border border-gray-200 rounded-xl p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'workflows', label: 'Messaging Workflows', icon: MessageSquare },
              { id: 'agents', label: 'AI Agents', icon: Bot },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
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

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Content */}
        {activeTab === 'workflows' && (
          <WorkflowsView 
            workflows={workflows}
            onEditWorkflow={(workflow) => {
              setSelectedWorkflow(workflow);
              setShowWorkflowBuilder(true);
            }}
          />
        )}

        {activeTab === 'agents' && (
          <AgentsView 
            agents={agents}
            onEditAgent={(agent) => {
              setSelectedAgent(agent);
              setShowNewAgentBuilder(true);
            }}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}
      </div>
    </div>
  );
};

// Workflows View Component
const WorkflowsView: React.FC<{ 
  workflows: MessagingWorkflow[]; 
  onEditWorkflow: (workflow: MessagingWorkflow) => void;
}> = ({ workflows, onEditWorkflow }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📷';
      case 'email':
        return '📧';
      case 'whatsapp':
        return '💬';
      case 'sms':
        return '📱';
      case 'telegram':
        return '✈️';
      default:
        return '📨';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <motion.div
          key={workflow.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEditWorkflow(workflow)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(workflow.status)}
                  <span className="text-sm text-gray-500 capitalize">{workflow.status}</span>
                </div>
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {workflow.targetPlatforms.map((platform) => (
                <span key={platform} className="text-lg">
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              {workflow.steps.length} steps
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Agents View Component
const AgentsView: React.FC<{ 
  agents: AIAgent[]; 
  onEditAgent: (agent: AIAgent) => void;
}> = ({ agents, onEditAgent }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEditAgent(agent)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <span className="text-sm text-gray-500">AI Agent</span>
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-4">{agent.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {agent.chatSettings.model}
              </span>
              {agent.memory.enabled && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Memory
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {agent.tools.length} tools
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Analytics View Component
const AnalyticsView: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
      <p className="text-gray-600">Detailed analytics and reporting for your messaging workflows and AI agents.</p>
    </div>
  );
};

export default InfluenceFlowDashboard;