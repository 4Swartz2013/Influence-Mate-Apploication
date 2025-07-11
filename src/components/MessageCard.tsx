import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Paperclip } from 'lucide-react';
import { Message } from '../types/messaging';
import { getPlatformConfig, formatTimeAgo } from '../utils/platformUtils';

interface MessageCardProps {
  message: Message;
  onClick: () => void;
  isSelected: boolean;
  delay?: number;
}

export const MessageCard: React.FC<MessageCardProps> = ({ 
  message, 
  onClick, 
  isSelected, 
  delay = 0 
}) => {
  const platformConfig = getPlatformConfig(message.platform);
  const PlatformIcon = platformConfig.icon;

  const getStatusColor = () => {
    switch (message.status) {
      case 'unread': return 'bg-blue-500';
      case 'read': return 'bg-gray-400';
      case 'replied': return 'bg-green-500';
      case 'archived': return 'bg-yellow-500';
      case 'flagged': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getTypeLabel = () => {
    switch (message.type) {
      case 'email': return 'Email';
      case 'dm': return 'Direct Message';
      case 'comment': return 'Comment';
      case 'mention': return 'Mention';
      default: return 'Message';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
        ${isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''}
        ${!message.isRead ? 'bg-blue-25' : ''}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={message.sender.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
            alt={message.sender.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          
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
              <h3 className={`text-sm font-medium truncate ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {message.sender.name}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${platformConfig.lightColor} ${platformConfig.textColor}`}>
                {getTypeLabel()}
              </span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-xs text-gray-500">
                {formatTimeAgo(message.timestamp)}
              </span>
            </div>
          </div>

          {/* Campaign Tag */}
          {message.campaignId && (
            <div className="mb-2">
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {message.campaignId}
              </span>
            </div>
          )}

          {/* Content Preview */}
          <p className={`text-sm line-clamp-2 ${!message.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
            {message.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              {message.sender.email && (
                <span>{message.sender.email}</span>
              )}
              {message.sender.username && (
                <span>{message.sender.username}</span>
              )}
            </div>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Paperclip className="w-3 h-3" />
                <span>{message.attachments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unread Indicator */}
      {!message.isRead && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"
        />
      )}
    </motion.div>
  );
};