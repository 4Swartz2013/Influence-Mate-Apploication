import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Filter, Plus, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { FilterBar } from './FilterBar';
import { MessageCard } from './MessageCard';
import { ConversationThread } from './ConversationThread';
import { CommentSection } from './CommentSection';
import { useMessaging } from '../hooks/useMessaging';
import { mockMessages, mockComments } from '../data/mockData';
import { Message, Comment } from '../types/messaging';

export const MessagingCenter: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    activeTab, 
    selectedThread, 
    setSelectedThread, 
    filters 
  } = useMessaging();

  // Filter messages based on active tab and filters
  const filteredData = useMemo(() => {
    if (activeTab === 'comments') {
      return mockComments.filter(comment => {
        const matchesSearch = searchQuery === '' || 
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.author.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesPlatform = filters.platforms.length === 0 || 
          filters.platforms.includes(comment.platform);
        
        return matchesSearch && matchesPlatform;
      });
    }

    return mockMessages.filter(message => {
      const matchesTab = (() => {
        switch (activeTab) {
          case 'inbox': return message.status === 'unread' || message.status === 'read';
          case 'sent': return message.status === 'replied';
          case 'archived': return message.status === 'archived';
          case 'drafts': return false; // No drafts in mock data
          default: return true;
        }
      })();

      const matchesSearch = searchQuery === '' || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlatform = filters.platforms.length === 0 || 
        filters.platforms.includes(message.platform);
      
      return matchesTab && matchesSearch && matchesPlatform;
    });
  }, [activeTab, searchQuery, filters]);

  const handleMessageClick = (message: Message) => {
    const thread = {
      id: message.threadId || message.id,
      platform: message.platform,
      participants: [message.sender],
      messages: [message],
      lastUpdated: message.timestamp,
      isRead: message.isRead,
      subject: message.campaignId || 'Direct Message'
    };
    setSelectedThread(thread);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'inbox': return 'Inbox';
      case 'sent': return 'Sent Messages';
      case 'archived': return 'Archived';
      case 'drafts': return 'Drafts';
      case 'comments': return 'Comments & Replies';
      case 'workflows': return 'Workflow Triggers';
      default: return 'Messages';
    }
  };

  const unreadCount = mockMessages.filter(m => !m.isRead).length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                <h1 className="text-2xl font-bold text-gray-900">
                  {getTabTitle()}
                </h1>
                <p className="text-sm text-gray-600">
                  {activeTab === 'comments' 
                    ? `${filteredData.length} comments to review`
                    : `${filteredData.length} messages, ${unreadCount} unread`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <FilterBar />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Message List */}
          <div className={`${selectedThread ? 'hidden lg:block' : 'flex-1'} lg:w-96 border-r border-gray-200 bg-white overflow-hidden`}>
            <div className="h-full overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'comments' ? (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CommentSection comments={filteredData as Comment[]} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="divide-y divide-gray-100"
                  >
                    {filteredData.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                        <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                      </div>
                    ) : (
                      (filteredData as Message[]).map((message, index) => (
                        <MessageCard
                          key={message.id}
                          message={message}
                          onClick={() => handleMessageClick(message)}
                          isSelected={selectedThread?.id === (message.threadId || message.id)}
                          delay={index * 0.05}
                        />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Conversation View */}
          <div className={`${selectedThread ? 'flex-1' : 'hidden'} lg:flex lg:flex-1 flex-col`}>
            <AnimatePresence mode="wait">
              {selectedThread ? (
                <ConversationThread
                  key={selectedThread.id}
                  thread={selectedThread}
                  onClose={() => setSelectedThread(null)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-center bg-gray-50"
                >
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plus className="w-12 h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a message from the list to start viewing and replying to your conversations.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};