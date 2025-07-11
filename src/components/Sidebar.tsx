import React from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, 
  Send, 
  Archive, 
  FileText, 
  MessageSquare, 
  Workflow,
  X
} from 'lucide-react';
import { TabType } from '../types/messaging';
import { useMessaging } from '../hooks/useMessaging';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabConfig = {
  inbox: { icon: Inbox, label: 'Inbox', count: 12 },
  sent: { icon: Send, label: 'Sent', count: 0 },
  archived: { icon: Archive, label: 'Archived', count: 45 },
  drafts: { icon: FileText, label: 'Drafts', count: 3 },
  comments: { icon: MessageSquare, label: 'Comments', count: 8 },
  workflows: { icon: Workflow, label: 'Workflows', count: 0 }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useMessaging();

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    onClose(); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
          lg:translate-x-0 lg:border-r lg:bg-white
          ${isOpen ? 'shadow-xl' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Messaging Center
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeTab === key;
            
            return (
              <motion.button
                key={key}
                onClick={() => handleTabClick(key as TabType)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg text-left transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{config.label}</span>
                </div>
                {config.count > 0 && (
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${isActive 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {config.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 mt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unread Messages</span>
              <span className="font-medium text-gray-900">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending Replies</span>
              <span className="font-medium text-gray-900">8</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Workflows</span>
              <span className="font-medium text-gray-900">3</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};