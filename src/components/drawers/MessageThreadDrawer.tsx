import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Archive,
  Flag,
  UserPlus,
  Workflow,
  Reply,
  Forward
} from 'lucide-react';
import { useCommunications } from '../../hooks/useCommunications';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';

export const MessageThreadDrawer: React.FC = () => {
  const [replyText, setReplyText] = useState('');
  const [showActions, setShowActions] = useState(false);
  
  const { 
    selectedMessage, 
    setSelectedMessage, 
    setShowMessageThread 
  } = useCommunications();

  const handleClose = () => {
    setShowMessageThread(false);
    setSelectedMessage(null);
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log('Sending reply:', replyText);
      setReplyText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  if (!selectedMessage) return null;

  const platformConfig = getPlatformConfig(selectedMessage.platform);
  const PlatformIcon = platformConfig.icon;

  // Mock thread messages for demonstration
  const threadMessages = [
    selectedMessage,
    // Add more messages to show thread conversation
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white h-full w-full max-w-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedMessage.sender_name?.charAt(0) || 'U'}
              </div>
              <div className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                ${platformConfig.color} text-white shadow-sm
              `}>
                <PlatformIcon className="w-2.5 h-2.5" />
              </div>
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900">
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
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                >
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                    <Flag className="w-4 h-4" />
                    <span>Flag</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                    <Workflow className="w-4 h-4" />
                    <span>Create Workflow</span>
                  </button>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Subject */}
            {selectedMessage.subject && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedMessage.subject}
                </h3>
              </div>
            )}

            {/* Message Body */}
            <div className="prose prose-sm max-w-none">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {selectedMessage.sender_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(new Date(selectedMessage.timestamp))}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedMessage.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedMessage.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedMessage.priority} priority
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.body}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                <div className="space-y-2">
                  {selectedMessage.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Paperclip className="w-5 h-5 text-gray-400" />
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
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Reply to ${selectedMessage.sender_name}...`}
                className="w-full p-4 pr-20 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <button className="p-1 rounded hover:bg-gray-100">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Workflow className="w-4 h-4" />
                  <span>Reply with Workflow</span>
                </button>
                
                <button className="text-sm text-purple-600 hover:text-purple-700">
                  Use Template
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
                
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                    ${replyText.trim() 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};