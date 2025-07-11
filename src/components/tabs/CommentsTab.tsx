import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  ExternalLink,
  MoreHorizontal,
  Sparkles,
  Flag,
  Archive
} from 'lucide-react';
import { useCommunications } from '../../hooks/useCommunications';
import { Comment } from '../../types/communications';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';

interface CommentsTabProps {
  searchQuery: string;
}

// Mock data for demonstration
const mockComments: Comment[] = [
  {
    id: '1',
    user_id: 'user1',
    platform: 'instagram',
    post_id: 'post-123',
    post_title: 'Morning routine for productivity',
    post_url: 'https://instagram.com/p/abc123',
    content: 'This morning routine changed my life! Thank you for sharing these amazing tips. Do you have any recommendations for evening routines too?',
    author_name: 'David Kim',
    author_handle: '@davidkim_fit',
    author_avatar: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    is_reply: false,
    replied: false,
    sentiment: 'positive',
    sentiment_score: 0.9,
    likes_count: 12,
    replies_count: 3,
    is_mention: false,
    workflow_triggered: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    platform: 'youtube',
    post_id: 'video-456',
    post_title: 'How to Start Your Influencer Journey',
    post_url: 'https://youtube.com/watch?v=abc123',
    content: 'Great video! I\'ve been struggling with content consistency. Your tips on batch creating content are gold!',
    author_name: 'Maria Santos',
    author_handle: '@mariasantos',
    author_avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_reply: false,
    replied: true,
    reply_content: 'Thank you so much! Consistency is definitely key - you\'ve got this!',
    replied_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    sentiment_score: 0.8,
    likes_count: 8,
    replies_count: 1,
    is_mention: false,
    workflow_triggered: false,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user1',
    platform: 'twitter',
    post_id: 'tweet-789',
    post_title: 'Thoughts on work-life balance',
    content: '@yourusername Your perspective on work-life balance really resonates with me. How do you handle burnout?',
    author_name: 'Alex Chen',
    author_handle: '@alexchen_dev',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    is_reply: false,
    replied: false,
    sentiment: 'neutral',
    sentiment_score: 0.5,
    likes_count: 5,
    replies_count: 0,
    is_mention: true,
    workflow_triggered: false,
    created_at: new Date().toISOString()
  }
];

export const CommentsTab: React.FC<CommentsTabProps> = ({ searchQuery }) => {
  const { filters } = useCommunications();

  const filteredComments = useMemo(() => {
    return mockComments.filter(comment => {
      const matchesSearch = searchQuery === '' || 
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlatform = filters.platforms.length === 0 || 
        filters.platforms.includes(comment.platform);
      
      return matchesSearch && matchesPlatform;
    });
  }, [searchQuery, filters]);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  return (
    <div className="h-full bg-white">
      {filteredComments.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
          <p className="text-gray-600">Comments and mentions will appear here when they come in.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredComments.map((comment, index) => {
            const platformConfig = getPlatformConfig(comment.platform);
            const PlatformIcon = platformConfig.icon;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={comment.author_avatar || `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150`}
                        alt={comment.author_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className={`
                        absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center
                        ${platformConfig.color} text-white shadow-sm
                      `}>
                        <PlatformIcon className="w-3 h-3" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {comment.author_name}
                        </h3>
                        {comment.is_mention && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Mention
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(comment.sentiment)}`}>
                          {getSentimentIcon(comment.sentiment)} {comment.sentiment}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        <span>{formatTimeAgo(new Date(comment.timestamp))}</span>
                        <span>•</span>
                        <span className={`${platformConfig.textColor} font-medium`}>
                          {platformConfig.name}
                        </span>
                        {comment.author_handle && (
                          <>
                            <span>•</span>
                            <span>{comment.author_handle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button className="p-2 rounded-lg hover:bg-gray-100">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Post Context */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {comment.post_title || `Post on ${platformConfig.name}`}
                    </h4>
                    {comment.post_url && (
                      <button className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Post ID: {comment.post_id}
                  </p>
                </div>

                {/* Comment Content */}
                <div className="mb-4">
                  <p className="text-gray-900 leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* Existing Reply */}
                {comment.replied && comment.reply_content && (
                  <div className="mb-4 ml-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-blue-900">Your Reply</span>
                      <span className="text-xs text-blue-600">
                        {comment.replied_at && formatTimeAgo(new Date(comment.replied_at))}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {comment.reply_content}
                    </p>
                  </div>
                )}

                {/* Comment Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Heart className="w-4 h-4" />
                      <span>{comment.likes_count}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      <span>{comment.replies_count} replies</span>
                    </div>

                    {comment.replied && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Replied
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!comment.replied && (
                      <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Reply className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    )}
                    
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Reply</span>
                    </button>

                    <button className="p-1 rounded hover:bg-gray-100">
                      <Flag className="w-4 h-4 text-gray-400" />
                    </button>

                    <button className="p-1 rounded hover:bg-gray-100">
                      <Archive className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Quick Reply (if not replied) */}
                {!comment.replied && (
                  <div className="mt-4 ml-8">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        Y
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder={`Reply to ${comment.author_name}...`}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <button className="text-xs text-purple-600 hover:text-purple-700">
                              Use Template
                            </button>
                            <button className="text-xs text-blue-600 hover:text-blue-700">
                              AI Suggest
                            </button>
                          </div>
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};