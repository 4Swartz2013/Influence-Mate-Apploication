import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Paperclip, Flag, Workflow } from 'lucide-react';
import { Message } from '../../types';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';

interface MessageCardProps {
  message: Message;
  onClick: () => void;
  onWorkflowAssign: () => void;
  isSelected: boolean;
  delay?: number;
}

export const MessageCard: React.FC<MessageCardProps> = ({ 
  message, 
  onClick, 
  onWorkflowAssign,
  isSelected, 
  delay = 0 
}) => {
  const platformConfig = getPlatformConfig(message.platform);
  const PlatformIcon = platformConfig.icon;

  const getStatusColor = () => {
    switch (message.status) {
      case 'pending': return 'bg-yellow-500';
      case 'replied': return 'bg-green-500';
      case 'ignored': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = () => {
    switch (message.priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 relative
        ${isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''}
        ${!message.is_read ? 'bg-blue-25' : ''}
      `}
    >
      <div onClick={onClick}>
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
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor()}`}>
                  {message.priority}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {message.is_flagged && (
                  <Flag className="w-4 h-4 text-red-500" />
                )}
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
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
              
              <div className="flex items-center space-x-2">
                {message.attachments.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Paperclip className="w-3 h-3" />
                    <span>{message.attachments.length}</span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWorkflowAssign();
                  }}
                  className="p-1 rounded hover:bg-blue-100 text-purple-600 hover:text-purple-700"
                  title="Assign Workflow"
                >
                  <Workflow className="w-4 h-4" />
                </button>
              </div>
            </div>
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
};