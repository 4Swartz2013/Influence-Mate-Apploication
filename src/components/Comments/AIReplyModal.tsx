import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Bot, 
  Sparkles, 
  Send,
  Check,
  MessageCircle,
  Zap,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';

interface AIReplyModalProps {
  onClose: () => void;
  onSend: (content: string) => void;
  commentAuthor: string;
  commentContent: string;
}

const replyCategories = [
  { id: 'thank', name: 'Thank You', description: 'Express gratitude for the comment', icon: ThumbsUp },
  { id: 'question', name: 'Answer Question', description: 'Respond to a question in the comment', icon: MessageCircle },
  { id: 'feedback', name: 'Address Feedback', description: 'Respond to feedback or suggestions', icon: RefreshCw },
  { id: 'custom', name: 'Custom Reply', description: 'Create a custom AI-generated reply', icon: Zap }
];

export const AIReplyModal: React.FC<AIReplyModalProps> = ({ 
  onClose, 
  onSend, 
  commentAuthor,
  commentContent
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId !== 'custom') {
      generateReply(categoryId);
    }
  };

  const generateReply = (category: string) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      let reply = '';
      
      switch (category) {
        case 'thank':
          reply = `Thank you so much for your comment, ${commentAuthor}! I really appreciate you taking the time to share your thoughts. Your support means a lot to me!`;
          break;
        case 'question':
          reply = `Hi ${commentAuthor}, thanks for your question! Based on what you're asking about, I'd recommend trying the approach I outlined in the content. Let me know if you need any clarification or have follow-up questions!`;
          break;
        case 'feedback':
          reply = `I appreciate your feedback, ${commentAuthor}! Your insights are valuable and I'll definitely take them into consideration for future content. Thanks for helping me improve!`;
          break;
        case 'custom':
          reply = `This is a custom AI-generated reply based on your prompt: "${customPrompt}"\n\nHi ${commentAuthor}, thanks for engaging with my content! I've carefully considered your comment and wanted to respond personally. Looking forward to more interactions in the future!`;
          break;
        default:
          reply = `Thanks for your comment, ${commentAuthor}! I appreciate you taking the time to engage with my content.`;
      }
      
      setGeneratedReply(reply);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCustomGenerate = () => {
    if (!customPrompt.trim()) return;
    generateReply('custom');
  };

  const handleSend = () => {
    if (generatedReply) {
      onSend(generatedReply);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Reply</h2>
              <p className="text-sm text-gray-600">Generate an AI-powered response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Original Comment */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium text-gray-900">Original Comment</h3>
            </div>
            <p className="text-gray-700 text-sm">
              <span className="font-medium">{commentAuthor}:</span> {commentContent}
            </p>
          </div>

          {/* Reply Categories */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Choose Reply Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {replyCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`
                      p-3 border-2 rounded-lg text-left transition-all
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-600">{category.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-purple-600 ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt (if custom selected) */}
          {selectedCategory === 'custom' && (
            <div className="mb-6">
              <label className="block font-medium text-gray-900 mb-2">
                Custom Prompt
              </label>
              <div className="relative">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe how you want to respond to this comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleCustomGenerate}
                  disabled={!customPrompt.trim() || isGenerating}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    ${customPrompt.trim() && !isGenerating
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Generated Reply */}
          {isGenerating ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-gray-700">Generating AI reply...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          ) : generatedReply && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Generated Reply</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => generateReply(selectedCategory || 'thank')}
                    className="p-1 rounded hover:bg-gray-100"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{generatedReply}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Good reply</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                    <ThumbsDown className="w-4 h-4" />
                    <span>Needs work</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  AI-generated content may need review
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSend}
            disabled={!generatedReply}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg
              ${generatedReply
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4" />
            <span>Send Reply</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};