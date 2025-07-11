import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Plus, 
  Play, 
  Save, 
  Settings,
  MessageSquare,
  Clock,
  GitBranch,
  Bot,
  Webhook,
  Eye,
  TestTube
} from 'lucide-react';
import { MessagingWorkflow, MessageStep } from '../../types/influenceFlow';
import MessageStepConfigPanel from './MessageStepConfigPanel';
import StepLibrary from './StepLibrary';

interface MessagingWorkflowBuilderProps {
  workflow?: MessagingWorkflow | null;
  onBack: () => void;
}

const MessagingWorkflowBuilder: React.FC<MessagingWorkflowBuilderProps> = ({ 
  workflow, 
  onBack 
}) => {
  const [currentWorkflow, setCurrentWorkflow] = useState<MessagingWorkflow>(
    workflow || {
      id: `workflow_${Date.now()}`,
      name: 'New Messaging Workflow',
      description: '',
      steps: [],
      edges: [],
      status: 'draft',
      triggerType: 'manual',
      targetPlatforms: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );

  const [selectedStep, setSelectedStep] = useState<MessageStep | null>(null);
  const [showStepLibrary, setShowStepLibrary] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  const handleAddStep = (stepTemplate: any) => {
    const newStep: MessageStep = {
      id: `step_${Date.now()}`,
      type: stepTemplate.type,
      position: { x: 0, y: currentWorkflow.steps.length * 180 + 100 },
      data: {
        label: stepTemplate.label,
        subtitle: stepTemplate.description,
        platform: stepTemplate.platform,
        config: stepTemplate.config || {},
        status: 'idle'
      }
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      updatedAt: new Date().toISOString()
    }));

    setShowStepLibrary(false);
  };

  const handleStepClick = (step: MessageStep) => {
    setSelectedStep(step);
    setShowConfigPanel(true);
  };

  const handleUpdateStep = (stepId: string, updates: Partial<MessageStep>) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ),
      updatedAt: new Date().toISOString()
    }));

    if (selectedStep?.id === stepId) {
      setSelectedStep(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteStep = (stepId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
      edges: prev.edges.filter(edge => edge.source !== stepId && edge.target !== stepId),
      updatedAt: new Date().toISOString()
    }));

    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setShowConfigPanel(false);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
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

  const getStepColor = (type: string) => {
    switch (type) {
      case 'send_message':
        return 'text-blue-600 bg-blue-100';
      case 'delay':
        return 'text-yellow-600 bg-yellow-100';
      case 'wait_for_reply':
        return 'text-green-600 bg-green-100';
      case 'branch_condition':
        return 'text-orange-600 bg-orange-100';
      case 'webhook_trigger':
        return 'text-purple-600 bg-purple-100';
      case 'run_agent':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlatformEmoji = (platform?: string) => {
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back to Workflows</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentWorkflow.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="capitalize">{currentWorkflow.status}</span>
                  <span>•</span>
                  <span>{currentWorkflow.steps.length} steps</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Workflow
              </button>
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2">
                <Play className="w-4 h-4" />
                Activate
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Empty State */}
            {currentWorkflow.steps.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start building your messaging workflow
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add your first step to begin creating an automated messaging sequence.
                </p>
                <button
                  onClick={() => setShowStepLibrary(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add First Step
                </button>
              </div>
            )}

            {/* Steps List */}
            {currentWorkflow.steps.length > 0 && (
              <div className="space-y-4">
                {currentWorkflow.steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.type);
                  const stepColor = getStepColor(step.type);
                  
                  return (
                    <div key={step.id} className="relative">
                      {/* Step Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white border-2 rounded-xl p-6 cursor-pointer transition-all ${
                          selectedStep?.id === step.id
                            ? 'border-indigo-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleStepClick(step)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stepColor}`}>
                              <StepIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{step.data.label}</h3>
                                {step.data.platform && (
                                  <span className="text-lg">{getPlatformEmoji(step.data.platform)}</span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{step.data.subtitle}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              step.data.status === 'success' ? 'bg-green-500' :
                              step.data.status === 'error' ? 'bg-red-500' :
                              step.data.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                              'bg-gray-400'
                            }`} />
                            <span className="text-sm text-gray-500">Step {index + 1}</span>
                          </div>
                        </div>

                        {/* Step Configuration Preview */}
                        {step.data.config && Object.keys(step.data.config).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-600 space-y-1">
                              {step.data.config.messageTemplate && (
                                <div>
                                  <span className="font-medium">Message:</span> {step.data.config.messageTemplate.substring(0, 100)}...
                                </div>
                              )}
                              {step.data.config.delayAmount && (
                                <div>
                                  <span className="font-medium">Delay:</span> {step.data.config.delayAmount} {step.data.config.delayUnit}
                                </div>
                              )}
                              {step.data.config.condition && (
                                <div>
                                  <span className="font-medium">Condition:</span> {step.data.config.condition}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Connection Arrow */}
                      {index < currentWorkflow.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <div className="w-0.5 h-6 bg-gray-300"></div>
                        </div>
                      )}

                      {/* Add Step Button */}
                      <div className="flex justify-center py-2">
                        <button
                          onClick={() => setShowStepLibrary(true)}
                          className="w-8 h-8 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Step Configuration */}
      {showConfigPanel && selectedStep && (
        <MessageStepConfigPanel
          step={selectedStep}
          onClose={() => setShowConfigPanel(false)}
          onUpdate={(updates) => handleUpdateStep(selectedStep.id, updates)}
          onDelete={() => handleDeleteStep(selectedStep.id)}
        />
      )}

      {/* Step Library Modal */}
      {showStepLibrary && (
        <StepLibrary
          onSelectStep={handleAddStep}
          onClose={() => setShowStepLibrary(false)}
        />
      )}
    </div>
  );
};

export default MessagingWorkflowBuilder;