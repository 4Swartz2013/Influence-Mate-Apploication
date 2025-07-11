import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Archive,
  Flag,
  UserPlus,
  Workflow
} from 'lucide-react';
import { Thread } from '../types/messaging';
import { getPlatformConfig, formatTimeAgo } from '../utils/platformUtils';

interface ConversationThreadProps {
  thread: Thread;
  onClose: () => void;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({ 
  thread, 
  onClose 
}) => {
  const [replyText, setReplyText] = useState('');
  const [showActions, setShowActions] = useState(false);
  
  const platformConfig = getPlatformConfig(thread.platform);
  const PlatformIcon = platformConfig.icon;

  const handleSendReply = () => {
    if (replyText.trim()) {
      // Here you would typically send the reply via API
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={thread.participants[0]?.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                alt={thread.participants[0]?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center
                ${platformConfig.color} text-white shadow-sm
              `}>
                <PlatformIcon className="w-2.5 h-2.5" />
              </div>
            </div>
            
            <div>
              <h2 className="font-semibold text-gray-900">
                {thread.participants[0]?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {thread.participants[0]?.email || thread.participants[0]?.username}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <UserPlus className="w-5 h-5" />
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
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.sender.id === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-md ${message.sender.id === 'me' ? 'order-2' : 'order-1'}`}>
              <div className={`
                p-3 rounded-2xl
                ${message.sender.id === 'me' 
                  ? 'bg-blue-500 text-white ml-12' 
                  : 'bg-gray-100 text-gray-900 mr-12'
                }
              `}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              
              <div className={`mt-1 flex items-center space-x-2 text-xs text-gray-500 ${
                message.sender.id === 'me' ? 'justify-end' : 'justify-start'
              }`}>
                <span>{formatTimeAgo(message.timestamp)}</span>
                {message.sender.id === 'me' && (
                  <span className="text-blue-500">✓</span>
                )}
              </div>
            </div>
            
            {message.sender.id !== 'me' && (
              <img
                src={message.sender.avatar}
                alt={message.sender.name}
                className="w-8 h-8 rounded-full object-cover order-1 mr-2"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Reply to ${thread.participants[0]?.name}...`}
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button className="p-1 rounded hover:bg-gray-100">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <Workflow className="w-4 h-4" />
                <span>Reply with Workflow</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim()}
            className={`
              p-3 rounded-lg transition-all
              ${replyText.trim() 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};