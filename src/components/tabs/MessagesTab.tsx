import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  Flag, 
  Archive,
  MoreHorizontal,
  Reply,
  Forward,
  Trash2
} from 'lucide-react';
import { useCommunications } from '../../hooks/useCommunications';
import { Message } from '../../types/communications';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';

interface MessagesTabProps {
  searchQuery: string;
}

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    user_id: 'user1',
    platform: 'instagram',
    sender_name: 'Sarah Johnson',
    sender_handle: '@sarahj_official',
    sender_email: 'sarah@example.com',
    subject: 'Collaboration Opportunity',
    body: 'Hi! I love your content and would like to discuss a potential collaboration for our upcoming campaign.',
    message_type: 'dm',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    is_read: false,
    is_archived: false,
    is_flagged: false,
    status: 'pending',
    priority: 'high',
    attachments: [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    platform: 'email',
    sender_name: 'Mark Thompson',
    sender_email: 'mark@company.com',
    subject: 'Brand Partnership Proposal',
    body: 'We would love to partner with you for our spring collection launch. Please find the proposal attached.',
    message_type: 'email',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_read: true,
    is_archived: false,
    is_flagged: true,
    status: 'replied',
    priority: 'normal',
    attachments: [
      { id: '1', filename: 'proposal.pdf', url: '#', type: 'pdf', size: 1024000 }
    ],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const MessagesTab: React.FC<MessagesTabProps> = ({ searchQuery }) => {
  const { 
    filters, 
    selectedMessage, 
    setSelectedMessage, 
    setShowMessageThread 
  } = useCommunications();

  const filteredMessages = useMemo(() => {
    return mockMessages.filter(message => {
      const matchesSearch = searchQuery === '' || 
        message.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlatform = filters.platforms.length === 0 || 
        filters.platforms.includes(message.platform);
      
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(message.status);
      
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [searchQuery, filters]);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setShowMessageThread(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'replied': return 'bg-green-500';
      case 'ignored': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex h-full">
      {/* Message List */}
      <div className={`${selectedMessage ? 'hidden lg:block' : 'flex-1'} lg:w-96 border-r border-gray-200 bg-white overflow-hidden`}>
        <div className="h-full overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map((message, index) => {
                const platformConfig = getPlatformConfig(message.platform);
                const PlatformIcon = platformConfig.icon;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMessageClick(message)}
                    className={`
                      p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
                      ${selectedMessage?.id === message.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}
                      ${!message.is_read ? 'bg-blue-25' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {message.sender_name?.charAt(0) || 'U'}
                        </div>
                        
                        {/* Platform Badge */}
                        <div className={`
                          absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center
                          ${platformConfig.color} text-white shadow-sm
                        `}>
                          <PlatformIcon className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-sm font-medium truncate ${!message.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.sender_name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {message.is_flagged && (
                              <Flag className="w-4 h-4 text-red-500" />
                            )}
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(message.status)}`} />
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(new Date(message.timestamp))}
                            </span>
                          </div>
                        </div>

                        {/* Subject */}
                        {message.subject && (
                          <p className={`text-sm font-medium mb-1 ${!message.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {message.subject}
                          </p>
                        )}

                        {/* Content Preview */}
                        <p className={`text-sm line-clamp-2 ${!message.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {message.body}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`${platformConfig.textColor} font-medium`}>
                              {platformConfig.name}
                            </span>
                            {message.sender_email && (
                              <>
                                <span>•</span>
                                <span>{message.sender_email}</span>
                              </>
                            )}
                          </div>
                          
                          {message.attachments.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{message.attachments.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!message.is_read && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message Thread View */}
      <div className={`${selectedMessage ? 'flex-1' : 'hidden'} lg:flex lg:flex-1 flex-col`}>
        {selectedMessage ? (
          <div className="flex-1 flex flex-col">
            {/* Thread Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedMessage.sender_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.sender_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedMessage.sender_email || selectedMessage.sender_handle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Reply className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Forward className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Archive className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl">
                {selectedMessage.subject && (
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedMessage.subject}
                  </h3>
                )}
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.body}
                  </p>
                </div>

                {selectedMessage.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reply Section */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="space-y-4">
                <textarea
                  placeholder="Type your reply..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Add attachment
                    </button>
                    <button className="text-sm text-purple-600 hover:text-purple-700">
                      Use template
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Save Draft
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a message
              </h3>
              <p className="text-gray-600">
                Choose a message from the list to view and reply to conversations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};