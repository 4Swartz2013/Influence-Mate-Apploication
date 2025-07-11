import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  MessageCircle, 
  BarChart3,
  Settings,
  Sparkles,
  X,
  Home,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, count: 0 },
  { id: 'messages', label: 'Messages', icon: MessageSquare, count: 24 },
  { id: 'comments', label: 'Comments', icon: MessageCircle, count: 12 },
  { id: 'contacts', label: 'Contacts', icon: Users, count: 156 },
  { id: 'enrichment', label: 'Enrichment', icon: Sparkles, count: 0 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, count: 0 },
  { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange 
}) => {
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
          lg:translate-x-0 ${isOpen ? 'shadow-xl' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Influence Mate
              </h1>
              <p className="text-xs text-gray-500">Communications Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl text-left transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${isActive 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {item.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 mt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unread Messages</span>
              <span className="font-semibold text-orange-600">24</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending Comments</span>
              <span className="font-semibold text-blue-600">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Enriched Contacts</span>
              <span className="font-semibold text-green-600">89%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-semibold text-purple-600">87.5%</span>
            </div>
          </div>
        </div>

        {/* Upgrade Banner */}
        <div className="p-4 m-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-blue-100 mb-3">
            Unlock advanced features and unlimited enrichments
          </p>
          <button className="w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      </motion.div>
    </>
  );
};