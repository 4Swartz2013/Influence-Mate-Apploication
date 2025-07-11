import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Workflow, 
  Zap,
  MessageSquare,
  Mail,
  Clock,
  Filter,
  Play,
  Pause,
  Settings,
  Plus,
  ChevronRight,
  Bot,
  Send,
  Tag,
  Archive,
  Flag,
  UserPlus,
  Check
} from 'lucide-react';

interface WorkflowWizardProps {
  onClose: () => void;
  onAssign: (workflowId: string, config: any) => void;
  targetType: 'message' | 'comment';
  targetId: string;
}

const availableWorkflows = [
  {
    id: 'auto-reply-positive',
    name: 'Auto-Reply to Positive Comments',
    description: 'Automatically send a thank you reply to positive comments and mentions',
    category: 'Engagement',
    icon: MessageSquare,
    color: 'bg-green-500',
    triggers: ['positive_comment', 'positive_mention'],
    actions: ['send_reply', 'add_tag'],
    isActive: true,
    usageCount: 156
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Sequence',
    description: 'Qualify potential business leads and route them to appropriate team members',
    category: 'Sales',
    icon: UserPlus,
    color: 'bg-blue-500',
    triggers: ['business_inquiry', 'collaboration_request'],
    actions: ['send_questionnaire', 'assign_to_sales', 'schedule_call'],
    isActive: true,
    usageCount: 89
  },
  {
    id: 'content-promotion',
    name: 'Content Promotion Follow-up',
    description: 'Follow up with engaged users to promote related content or products',
    category: 'Marketing',
    icon: Zap,
    color: 'bg-purple-500',
    triggers: ['high_engagement', 'content_share'],
    actions: ['send_related_content', 'offer_discount', 'add_to_newsletter'],
    isActive: true,
    usageCount: 234
  },
  {
    id: 'crisis-management',
    name: 'Crisis Management Response',
    description: 'Quickly respond to negative feedback and escalate to human review',
    category: 'Support',
    icon: Flag,
    color: 'bg-red-500',
    triggers: ['negative_comment', 'complaint'],
    actions: ['send_apology', 'escalate_to_human', 'flag_for_review'],
    isActive: false,
    usageCount: 12
  },
  {
    id: 'influencer-outreach',
    name: 'Influencer Outreach Sequence',
    description: 'Automated outreach sequence for potential influencer partnerships',
    category: 'Partnerships',
    icon: Send,
    color: 'bg-indigo-500',
    triggers: ['influencer_mention', 'high_follower_count'],
    actions: ['send_partnership_proposal', 'schedule_call', 'add_to_crm'],
    isActive: true,
    usageCount: 67
  },
  {
    id: 'customer-support',
    name: 'Customer Support Triage',
    description: 'Automatically categorize and route customer support requests',
    category: 'Support',
    icon: Settings,
    color: 'bg-orange-500',
    triggers: ['support_request', 'product_question'],
    actions: ['categorize_request', 'send_auto_response', 'assign_to_support'],
    isActive: true,
    usageCount: 178
  }
];

const workflowActions = [
  { id: 'send_reply', name: 'Send Reply', icon: MessageSquare, description: 'Send an automated reply message' },
  { id: 'send_email', name: 'Send Email', icon: Mail, description: 'Send a follow-up email' },
  { id: 'add_tag', name: 'Add Tag', icon: Tag, description: 'Add a tag to the contact' },
  { id: 'archive', name: 'Archive', icon: Archive, description: 'Archive the message or comment' },
  { id: 'flag', name: 'Flag for Review', icon: Flag, description: 'Flag for human review' },
  { id: 'assign_to_team', name: 'Assign to Team', icon: UserPlus, description: 'Assign to a team member' },
  { id: 'schedule_call', name: 'Schedule Call', icon: Clock, description: 'Schedule a follow-up call' },
  { id: 'delay', name: 'Add Delay', icon: Pause, description: 'Wait before next action' }
];

export const WorkflowWizard: React.FC<WorkflowWizardProps> = ({ 
  onClose, 
  onAssign, 
  targetType, 
  targetId 
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [customConfig, setCustomConfig] = useState({
    triggerConditions: [],
    actions: [],
    isActive: true
  });
  const [step, setStep] = useState<'select' | 'configure' | 'confirm'>('select');

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    setStep('configure');
  };

  const handleAssignWorkflow = () => {
    if (!selectedWorkflow) return;
    
    onAssign(selectedWorkflow, {
      targetType,
      targetId,
      config: customConfig
    });
    
    setStep('confirm');
  };

  const selectedWorkflowData = availableWorkflows.find(w => w.id === selectedWorkflow);

  const renderWorkflowList = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Workflow
        </h3>
        <p className="text-gray-600">
          Choose a workflow to assign to this {targetType}
        </p>
      </div>

      <div className="grid gap-4">
        {availableWorkflows.map((workflow) => {
          const Icon = workflow.icon;
          
          return (
            <motion.div
              key={workflow.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleWorkflowSelect(workflow.id)}
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${workflow.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${workflow.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {workflow.usageCount} uses
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {workflow.category}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Plus className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Create Custom Workflow</span>
        </div>
        <p className="text-sm text-blue-800">
          Need something specific? Create a custom workflow with our visual editor.
        </p>
        <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          Open Workflow Builder →
        </button>
      </div>
    </div>
  );

  const renderWorkflowConfig = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Configure Workflow
        </h3>
        <p className="text-gray-600">
          Customize the workflow settings for this {targetType}
        </p>
      </div>

      {selectedWorkflowData && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <selectedWorkflowData.icon className="w-6 h-6 text-gray-600" />
            <h4 className="font-medium text-gray-900">{selectedWorkflowData.name}</h4>
          </div>
          <p className="text-sm text-gray-600">{selectedWorkflowData.description}</p>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Trigger Conditions</h4>
        <div className="space-y-2">
          {selectedWorkflowData?.triggers.map((trigger) => (
            <label key={trigger} className="flex items-center space-x-3">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 capitalize">{trigger.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
        <div className="space-y-3">
          {selectedWorkflowData?.actions.map((actionId) => {
            const action = workflowActions.find(a => a.id === actionId);
            if (!action) return null;
            
            const Icon = action.icon;
            return (
              <div key={actionId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{action.name}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={customConfig.isActive}
            onChange={(e) => setCustomConfig(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Activate workflow immediately</span>
        </label>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Workflow Assigned Successfully
        </h3>
        <p className="text-gray-600">
          The workflow "{selectedWorkflowData?.name}" has been assigned to this {targetType}.
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          The workflow will now automatically process this {targetType} based on the configured triggers and actions.
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Workflow</h2>
              <p className="text-sm text-gray-600">
                Automate actions for this {targetType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'select' && renderWorkflowList()}
              {step === 'configure' && renderWorkflowConfig()}
              {step === 'confirm' && renderConfirmation()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 'confirm' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={() => {
                if (step === 'configure') {
                  setStep('select');
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {step === 'configure' ? 'Back' : 'Cancel'}
            </button>
            
            {step === 'configure' && (
              <button
                onClick={handleAssignWorkflow}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Workflow className="w-4 h-4" />
                <span>Assign Workflow</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};