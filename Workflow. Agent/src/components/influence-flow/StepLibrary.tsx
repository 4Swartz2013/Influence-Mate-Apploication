import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Search, 
  MessageSquare, 
  Clock, 
  Eye, 
  GitBranch, 
  Webhook, 
  Bot,
  Filter
} from 'lucide-react';

interface StepTemplate {
  type: string;
  label: string;
  description: string;
  icon: any;
  category: 'messaging' | 'logic' | 'automation' | 'ai';
  platform?: string;
  config?: Record<string, any>;
}

interface StepLibraryProps {
  onSelectStep: (template: StepTemplate) => void;
  onClose: () => void;
}

const StepLibrary: React.FC<StepLibraryProps> = ({ onSelectStep, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const stepTemplates: StepTemplate[] = [
    // Messaging Steps
    {
      type: 'send_message',
      label: 'Send Message',
      description: 'Send a message via Instagram DM, email, SMS, or other platforms',
      icon: MessageSquare,
      category: 'messaging'
    },
    {
      type: 'send_message',
      label: 'Send Instagram DM',
      description: 'Send a direct message on Instagram',
      icon: MessageSquare,
      category: 'messaging',
      platform: 'instagram'
    },
    {
      type: 'send_message',
      label: 'Send Email',
      description: 'Send an email message',
      icon: MessageSquare,
      category: 'messaging',
      platform: 'email'
    },
    {
      type: 'send_message',
      label: 'Send WhatsApp Message',
      description: 'Send a message via WhatsApp',
      icon: MessageSquare,
      category: 'messaging',
      platform: 'whatsapp'
    },
    {
      type: 'send_message',
      label: 'Send SMS',
      description: 'Send an SMS text message',
      icon: MessageSquare,
      category: 'messaging',
      platform: 'sms'
    },
    {
      type: 'send_message',
      label: 'Send Telegram Message',
      description: 'Send a message via Telegram',
      icon: MessageSquare,
      category: 'messaging',
      platform: 'telegram'
    },

    // Logic Steps
    {
      type: 'delay',
      label: 'Delay',
      description: 'Wait for a specified period before continuing',
      icon: Clock,
      category: 'logic'
    },
    {
      type: 'wait_for_reply',
      label: 'Wait for Reply',
      description: 'Pause workflow until user replies or timeout occurs',
      icon: Eye,
      category: 'logic'
    },
    {
      type: 'branch_condition',
      label: 'Branch Condition',
      description: 'Split workflow based on conditions or user responses',
      icon: GitBranch,
      category: 'logic'
    },

    // Automation Steps
    {
      type: 'webhook_trigger',
      label: 'Webhook',
      description: 'Trigger external webhooks or wait for incoming webhooks',
      icon: Webhook,
      category: 'automation'
    },

    // AI Steps
    {
      type: 'run_agent',
      label: 'Run AI Agent',
      description: 'Execute an AI agent to process data or generate responses',
      icon: Bot,
      category: 'ai'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Steps' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'logic', label: 'Logic & Flow' },
    { id: 'automation', label: 'Automation' },
    { id: 'ai', label: 'AI & Agents' }
  ];

  const filteredTemplates = stepTemplates.filter(template => {
    const matchesSearch = template.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTemplates = categories.reduce((acc, category) => {
    if (category.id === 'all') return acc;
    
    const categoryTemplates = filteredTemplates.filter(t => t.category === category.id);
    if (categoryTemplates.length > 0) {
      acc[category.id] = {
        label: category.label,
        templates: categoryTemplates
      };
    }
    return acc;
  }, {} as Record<string, { label: string; templates: StepTemplate[] }>);

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
        return '';
    }
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Choose a step to add</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search steps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {Object.keys(groupedTemplates).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-2">No steps found</p>
              <p className="text-sm">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedTemplates).map(([categoryId, categoryData]) => (
                <div key={categoryId}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {categoryData.label}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryData.templates.map((template, index) => (
                      <button
                        key={`${categoryId}-${index}`}
                        onClick={() => onSelectStep(template)}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
                      >
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 group-hover:bg-white transition-colors">
                          <template.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-gray-900">{template.label}</div>
                            {template.platform && (
                              <span className="text-lg">{getPlatformEmoji(template.platform)}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {template.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepLibrary;