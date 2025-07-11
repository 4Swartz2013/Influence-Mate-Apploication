import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  MessageCircle, 
  Sparkles,
  Search,
  Filter,
  Plus,
  Bell,
  Menu,
  X,
  Home,
  BarChart3,
  Settings,
  Zap,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardView } from './Dashboard/DashboardView';
import { MessagesView } from './Messages/MessagesView';
import { CommentsView } from './Comments/CommentsView';
import { ContactsView } from './Contacts/ContactsView';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, count: 0 },
  { id: 'messages', label: 'Messages', icon: MessageSquare, count: 24 },
  { id: 'comments', label: 'Comments', icon: MessageCircle, count: 12 },
  { id: 'contacts', label: 'Contacts', icon: Users, count: 156 },
  { id: 'enrichment', label: 'Enrichment', icon: Sparkles, count: 0 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, count: 0 },
  { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
];

export const CommunicationsHub: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  
  const [filters, setFilters] = useState({
    platforms: [],
    status: [],
    priority: [],
    tags: [],
    dateRange: {},
    search: ''
  });

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'messages': return 'Messages';
      case 'comments': return 'Comments & Mentions';
      case 'contacts': return 'Contact Center';
      case 'enrichment': return 'Enrichment Hub';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview of your communications and performance';
      case 'messages': return 'Unified inbox for all your messages across platforms';
      case 'comments': return 'Track and respond to comments and mentions';
      case 'contacts': return 'Manage your contact database and relationships';
      case 'enrichment': return 'Enhance contact profiles with AI-powered data';
      case 'analytics': return 'Insights and performance metrics';
      case 'settings': return 'Configure your account and preferences';
      default: return 'Manage your influence and communications';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesView searchQuery={searchQuery} filters={filters} />;
      case 'comments':
        return <CommentsView searchQuery={searchQuery} filters={filters} />;
      case 'contacts':
        return <ContactsView searchQuery={searchQuery} filters={filters} />;
      case 'enrichment':
        return (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enrichment Hub</h3>
            <p className="text-gray-600">Enhance contact profiles with AI-powered data enrichment.</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
            <p className="text-gray-600">View performance metrics and insights.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Configure your account and preferences.</p>
          </div>
        );
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
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
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
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
                  <span className="font-medium">{tab.label}</span>
                </div>
                {tab.count > 0 && (
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${isActive 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {tab.count}
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

        {/* User Profile & Upgrade */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1 rounded hover:bg-gray-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Upgrade Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  {activeTabConfig && <activeTabConfig.icon className="w-6 h-6" />}
                  <span>{getTabTitle()}</span>
                </h1>
                <p className="text-sm text-gray-600">
                  {getTabSubtitle()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>

              <button 
                onClick={() => handleNavigate('messages')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Message</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};