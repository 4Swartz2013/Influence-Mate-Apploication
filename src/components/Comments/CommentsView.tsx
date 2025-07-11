import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  ExternalLink,
  MoreHorizontal,
  Sparkles,
  Flag,
  Archive,
  Bot,
  Workflow,
  Plus,
  Filter,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { WorkflowWizard } from '../Workflows/WorkflowWizard';
import { AIReplyModal } from './AIReplyModal';
import { BulkReplyModal } from '../Messages/BulkReplyModal';
import { Comment, Platform } from '../../types';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';
import { PlatformFilter } from '../shared/PlatformFilter';

interface CommentsViewProps {
  searchQuery: string;
  filters: any;
}

export const CommentsView: React.FC<CommentsViewProps> = ({ searchQuery, filters }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showWorkflowWizard, setShowWorkflowWizard] = useState(false);
  const [showAIReplyModal, setShowAIReplyModal] = useState(false);
  const [showBulkReplyModal, setShowBulkReplyModal] = useState(false);
  const [workflowTarget, setWorkflowTarget] = useState<{ type: 'message' | 'comment'; id: string } | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [activePlatformFilters, setActivePlatformFilters] = useState<Platform[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const { 
    comments, 
    isLoading, 
    replyToComment, 
    archiveComments, 
    flagComments, 
    assignWorkflow,
    bulkReply
  } = useComments({ 
    ...filters, 
    search: searchQuery,
    platforms: activePlatformFilters.length > 0 ? activePlatformFilters : undefined
  });

  const handleReply = (commentId: string) => {
    if (replyText.trim()) {
      replyToComment({ commentId, replyContent: replyText });
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleWorkflowAssign = (commentId: string) => {
    setWorkflowTarget({ type: 'comment', id: commentId });
    setShowWorkflowWizard(true);
  };

  const handleWorkflowComplete = (workflowId: string, config: any) => {
    if (workflowTarget) {
      if (workflowTarget.type === 'comment') {
        assignWorkflow({ 
          commentIds: [workflowTarget.id], 
          workflowId 
        });
      }
    } else if (selectedComments.length > 0) {
      assignWorkflow({ 
        commentIds: selectedComments, 
        workflowId 
      });
    }
    
    setShowWorkflowWizard(false);
    setWorkflowTarget(null);
  };

  const handleAIReply = (comment: Comment) => {
    setSelectedComment(comment);
    setShowAIReplyModal(true);
  };

  const handleSendAIReply = (content: string) => {
    if (selectedComment) {
      replyToComment({ commentId: selectedComment.id, replyContent: content });
    }
    setShowAIReplyModal(false);
    setSelectedComment(null);
  };

  const handleBulkReply = () => {
    setShowBulkReplyModal(true);
  };

  const handleSendBulkReply = (content: string) => {
    bulkReply({ 
      commentIds: selectedComments, 
      replyContent: content 
    });
    setShowBulkReplyModal(false);
  };

  const handleBulkWorkflow = () => {
    setShowWorkflowWizard(true);
  };

  const handleBulkArchive = () => {
    archiveComments(selectedComments);
    setSelectedComments([]);
    setShowBulkActions(false);
  };

  const handleBulkFlag = () => {
    flagComments(selectedComments);
    setShowBulkActions(false);
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(c => c.id));
    }
  };

  const handlePlatformFilterChange = (platforms: Platform[]) => {
    setActivePlatformFilters(platforms);
  };

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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{comments.length} Comments</h3>
              {selectedComments.length > 0 && (
                <span className="text-sm text-gray-600">({selectedComments.length} selected)</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowWorkflowWizard(true)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Workflow className="w-4 h-4" />
                <span>New Workflow</span>
              </button>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSelectAll}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                {selectedComments.length === comments.length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedComments.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Bulk Actions
                  </button>
                  
                  {showBulkActions && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button 
                        onClick={handleBulkReply}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Reply className="w-4 h-4" />
                        <span>Reply All</span>
                      </button>
                      <button 
                        onClick={handleBulkWorkflow}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Workflow className="w-4 h-4" />
                        <span>Assign Workflow</span>
                      </button>
                      <button 
                        onClick={handleBulkArchive}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Archive</span>
                      </button>
                      <button 
                        onClick={handleBulkFlag}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Flag</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded hover:bg-gray-100">
                <Filter className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Filter */}
        <div className="px-4 py-2 border-b border-gray-200">
          <PlatformFilter 
            activePlatforms={activePlatformFilters}
            onChange={handlePlatformFilterChange}
          />
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
              <p className="text-gray-600">Comments and mentions will appear here when they come in.</p>
            </div>
          ) : (
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
                    className="p-6 hover:bg-gray-50 transition-colors relative"
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute left-4 top-6 z-10">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => toggleCommentSelection(comment.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="pl-6">
                      {/* Comment Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {comment.author_name?.charAt(0) || 'U'}
                            </div>
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
                              {comment.sentiment && (
                                <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(comment.sentiment)}`}>
                                  {getSentimentIcon(comment.sentiment)} {comment.sentiment}
                                </span>
                              )}
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
                            <a 
                              href={comment.post_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
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
                            <button 
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              <span>Reply</span>
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleAIReply(comment)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Bot className="w-4 h-4" />
                            <span>AI Reply</span>
                          </button>

                          <button 
                            onClick={() => handleWorkflowAssign(comment.id)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Workflow className="w-4 h-4" />
                            <span>Workflow</span>
                          </button>

                          <button 
                            onClick={() => flagComments([comment.id])}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Flag className="w-4 h-4 text-gray-400" />
                          </button>

                          <button 
                            onClick={() => archiveComments([comment.id])}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Archive className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Reply */}
                      {replyingTo === comment.id && !comment.replied && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 ml-8"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              Y
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Reply to ${comment.author_name}...`}
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <button className="text-xs text-purple-600 hover:text-purple-700">
                                    Use Template
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setReplyingTo(null);
                                      handleAIReply(comment);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                  >
                                    AI Suggest
                                  </button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleReply(comment.id)}
                                    disabled={!replyText.trim()}
                                    className={`
                                      px-4 py-1 text-sm rounded-lg transition-colors
                                      ${replyText.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }
                                    `}
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Workflow Wizard */}
      {showWorkflowWizard && (
        <WorkflowWizard
          onClose={() => setShowWorkflowWizard(false)}
          onAssign={handleWorkflowComplete}
          targetType={workflowTarget?.type || 'comment'}
          targetId={workflowTarget?.id || selectedComments[0] || ''}
        />
      )}

      {/* AI Reply Modal */}
      {showAIReplyModal && selectedComment && (
        <AIReplyModal
          onClose={() => {
            setShowAIReplyModal(false);
            setSelectedComment(null);
          }}
          onSend={handleSendAIReply}
          commentAuthor={selectedComment.author_name || 'User'}
          commentContent={selectedComment.content}
        />
      )}

      {/* Bulk Reply Modal */}
      {showBulkReplyModal && (
        <BulkReplyModal
          onClose={() => setShowBulkReplyModal(false)}
          onSend={handleSendBulkReply}
          count={selectedComments.length}
        />
      )}
    </>
  );
};