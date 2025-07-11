import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Send,
  Users,
  Bot,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { TipTapEditor } from './TipTapEditor';

interface BulkReplyModalProps {
  onClose: () => void;
  onSend: (content: string) => void;
  count: number;
}

export const BulkReplyModal: React.FC<BulkReplyModalProps> = ({ 
  onClose, 
  onSend, 
  count 
}) => {
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = () => {
    const finalContent = useAI ? generatedContent : (richContent || content);
    if (finalContent.trim()) {
      onSend(finalContent);
    }
  };

  const handleGenerateAI = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generated = `This is an AI-generated bulk reply based on your prompt: "${aiPrompt}"\n\nThank you for your message! I appreciate your interest and will get back to you with more details soon. In the meantime, please feel free to check out my latest content.`;
      
      setGeneratedContent(generated);
      setIsGenerating(false);
    }, 1500);
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bulk Reply</h2>
              <p className="text-sm text-gray-600">
                Send a reply to {count} {count === 1 ? 'item' : 'items'}
              </p>
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
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Bulk Reply Information</h3>
            </div>
            <p className="text-sm text-blue-800">
              You're replying to {count} {count === 1 ? 'item' : 'items'} at once. 
              The same message will be sent to all selected recipients.
            </p>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-3 mb-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Influence AI</p>
                <p className="text-sm text-gray-600">Let AI generate your reply</p>
              </div>
            </div>
            <button 
              onClick={() => setUseAI(!useAI)}
              className="text-purple-600"
            >
              {useAI ? (
                <ToggleRight className="w-8 h-8" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {useAI ? (
            <div className="space-y-4">
              <div className="relative">
                <Bot className="absolute left-3 top-3 w-5 h-5 text-purple-500" />
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe how you want to respond to these messages..."
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  The AI will generate a complete response based on your prompt
                </p>
                <button
                  onClick={handleGenerateAI}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    ${aiPrompt.trim() && !isGenerating
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

              {/* Generated Content Preview */}
              {generatedContent && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">AI-Generated Reply</span>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-800">
                    {generatedContent}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply Message
              </label>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <TipTapEditor
                  content={richContent}
                  onChange={setRichContent}
                  placeholder="Compose your reply message..."
                />
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
            disabled={(useAI && !generatedContent) || (!useAI && !richContent.trim())}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg
              ${((useAI && generatedContent) || (!useAI && richContent.trim()))
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4" />
            <span>Send to {count}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};