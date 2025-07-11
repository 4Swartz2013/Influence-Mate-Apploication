import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  ExternalLink, 
  Clock,
  Send,
  Workflow,
  MoreHorizontal
} from 'lucide-react';
import { Comment } from '../types/messaging';
import { getPlatformConfig, formatTimeAgo } from '../utils/platformUtils';

interface CommentSectionProps {
  comments: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReply = (commentId: string) => {
    if (replyText.trim()) {
      console.log('Replying to comment:', commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment, index) => {
        const platformConfig = getPlatformConfig(comment.platform);
        const PlatformIcon = platformConfig.icon;

        return (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Comment Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={comment.author.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                    alt={comment.author.name}
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
                  <h3 className="font-medium text-gray-900">
                    {comment.author.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{formatTimeAgo(comment.timestamp)}</span>
                    <span>•</span>
                    <span className={`${platformConfig.textColor} font-medium`}>
                      {platformConfig.name}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-1 rounded hover:bg-gray-100">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Post Context */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 text-sm">
                  {comment.postTitle}
                </h4>
                <button className="text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Post ID: {comment.postId}
              </p>
            </div>

            {/* Comment Content */}
            <div className="mb-4">
              <p className="text-gray-900 leading-relaxed">
                {comment.content}
              </p>
            </div>

            {/* Comment Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                {comment.likes !== undefined && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Heart className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comment.replies?.length || 0} replies</span>
                </div>

                {comment.replied && (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Replied
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Reply
                </button>
                
                <button className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center space-x-1">
                  <Workflow className="w-4 h-4" />
                  <span>Automate</span>
                </button>
              </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-3 border-l-2 border-gray-100 pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-3">
                    <img
                      src={reply.author.avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                      alt={reply.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {reply.author.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 ml-8"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src="https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=150"
                    alt="You"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author.name}...`}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        className={`
                          flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${replyText.trim()
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        <Send className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {comments.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
          <p className="text-gray-600">Comments and mentions will appear here when they come in.</p>
        </div>
      )}
    </div>
  );
};