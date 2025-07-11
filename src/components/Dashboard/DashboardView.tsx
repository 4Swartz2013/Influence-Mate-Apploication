import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  BarChart3,
  Plus,
  ArrowRight,
  Zap,
  Database,
  UserPlus
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { stats, isLoading } = useDashboard();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send-message':
        onNavigate?.('messages');
        break;
      case 'add-contact':
        onNavigate?.('contacts');
        break;
      case 'enrich-contacts':
        onNavigate?.('enrichment');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Messages',
      value: stats?.totalMessages || 0,
      change: '+12%',
      icon: MessageSquare,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Across all platforms',
      onClick: () => onNavigate?.('messages')
    },
    {
      title: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      change: '-5%',
      icon: MessageCircle,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'Needs attention',
      onClick: () => onNavigate?.('messages')
    },
    {
      title: 'Total Contacts',
      value: stats?.totalContacts || 0,
      change: '+8%',
      icon: Users,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'In your network',
      onClick: () => onNavigate?.('contacts')
    },
    {
      title: 'Response Rate',
      value: `${stats?.responseRate.toFixed(1) || 0}%`,
      change: '+3%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'Last 30 days',
      onClick: () => onNavigate?.('analytics')
    }
  ];

  const quickActions = [
    {
      title: 'Send Message',
      description: 'Compose a new message',
      icon: MessageSquare,
      color: 'bg-blue-500',
      action: 'send-message'
    },
    {
      title: 'Add Contact',
      description: 'Import or create contact',
      icon: UserPlus,
      color: 'bg-green-500',
      action: 'add-contact'
    },
    {
      title: 'Connect CRM',
      description: 'Import from CRM systems',
      icon: Database,
      color: 'bg-purple-500',
      action: 'connect-crm'
    }
  ];

  const recentActivity = [
    { 
      type: 'message', 
      content: 'New collaboration inquiry from @sarah_j', 
      time: '2 min ago', 
      icon: MessageSquare,
      platform: 'Instagram'
    },
    { 
      type: 'comment', 
      content: 'Reply sent to YouTube comment', 
      time: '15 min ago', 
      icon: MessageCircle,
      platform: 'YouTube'
    },
    { 
      type: 'contact', 
      content: 'Contact enriched: Mark Thompson', 
      time: '1 hour ago', 
      icon: Sparkles,
      platform: 'AI Agent'
    },
    { 
      type: 'message', 
      content: 'Email from brand partnership team', 
      time: '2 hours ago', 
      icon: MessageSquare,
      platform: 'Email'
    },
    { 
      type: 'comment', 
      content: 'New mention on Twitter', 
      time: '3 hours ago', 
      icon: MessageCircle,
      platform: 'Twitter'
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-full">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Influence Mate</h1>
              <p className="text-blue-100 text-lg mb-6">
                Manage all your communications and grow your influence in one place
              </p>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate?.('messages')}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </button>
                <button className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.onClick}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.lightColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                onClick={() => handleQuickAction(action.action)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">{activity.content}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-blue-600 font-medium">{activity.platform}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <button 
            onClick={() => onNavigate?.('dashboard')}
            className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Activity
          </button>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance</h2>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Response Rate</span>
                <span className="text-sm font-semibold text-gray-900">{stats?.responseRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.responseRate || 0}%` }}
                  transition={{ delay: 1, duration: 1 }}
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Enriched Contacts</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.totalContacts ? Math.round((stats.enrichedContacts / stats.totalContacts) * 100) : 89}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${stats?.totalContacts ? (stats.enrichedContacts / stats.totalContacts) * 100 : 89}%` 
                  }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">Engagement Score</span>
                <span className="text-sm font-semibold text-gray-900">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92%' }}
                  transition={{ delay: 1.4, duration: 1 }}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Avg. Response Time</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.avgResponseTime || 2.3}h
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};