import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Archive,
  Flag,
  Reply,
  Forward,
  Workflow,
  Bot,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Message } from '../../types';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';
import { TipTapEditor } from './TipTapEditor';
import { supabase } from '../../lib/supabase';

interface MessageThreadProps {
  message: Message;
  onClose: () => void;
  onReply: (content: string) => void;
  onWorkflowAssign: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ 
  message, 
  onClose,
  onReply,
  onWorkflowAssign
}) => {
  const [replyText, setReplyText] = useState('');
  const [richReplyText, setRichReplyText] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [threadMessages, setThreadMessages] = useState<Message[]>([message]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  
  const platformConfig = getPlatformConfig(message.platform);
  const PlatformIcon = platformConfig.icon;
  const supportsRichText = message.platform === 'email';

  // Fetch thread messages
  useEffect(() => {
    const fetchThreadMessages = async () => {
      setIsLoadingThread(true);
      
      const threadId = message.thread_id || message.id;
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`id.eq.${threadId},thread_id.eq.${threadId}`)
        .order('timestamp', { ascending: true });
      
      if (!error && data) {
        setThreadMessages(data as Message[]);
      }
      
      setIsLoadingThread(false);
    };
    
    fetchThreadMessages();
  }, [message.id, message.thread_id]);

  const handleSendReply = () => {
    const content = useAI ? generatedReply : (supportsRichText ? richReplyText : replyText);
    if ((content.trim() || useAI) && !isLoadingThread) {
      onReply(content);
      setReplyText('');
      setRichReplyText('');
      setAiPrompt('');
      setGeneratedReply('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !supportsRichText) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const handleGenerateAIReply = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generated = `This is an AI-generated reply based on your prompt: "${aiPrompt}"\n\nHello ${message.sender_name},\n\nThank you for reaching out. I appreciate your message and would be happy to discuss this further. Let's connect soon to explore how we can work together.\n\nBest regards,\n[Your Name]`;
      
      setGeneratedReply(generated);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {message.sender_name?.charAt(0) || 'U'}
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
                {message.sender_name}
              </h2>
              <p className="text-sm text-gray-600">
                {message.sender_email || message.sender_handle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={onWorkflowAssign}
            className="p-2 rounded-lg hover:bg-purple-100 text-purple-600"
            title="Assign Workflow"
          >
            <Workflow className="w-5 h-5" />
          </button>
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
                <button 
                  onClick={onWorkflowAssign}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Workflow className="w-4 h-4" />
                  <span>Assign Workflow</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Message Thread Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl space-y-6">
          {message.subject && (
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {message.subject}
            </h3>
          )}
          
          {/* Thread Messages */}
          {isLoadingThread ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ) : (
            threadMessages.map((msg, index) => {
              const isFromMe = msg.sender_name === 'You';
              return (
                <div 
                  key={msg.id}
                  className={`${isFromMe ? 'ml-12' : 'mr-12'}`}
                >
                  <div className={`
                    rounded-lg p-4 mb-2
                    ${isFromMe 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-gray-50'
                    }
                  `}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${isFromMe ? 'text-blue-900' : 'text-gray-900'}`}>
                          {msg.sender_name}
                        </span>
                        <span className={`text-sm ${isFromMe ? 'text-blue-600' : 'text-gray-500'}`}>
                          {formatTimeAgo(new Date(msg.timestamp))}
                        </span>
                      </div>
                      {msg.priority && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          msg.priority === 'high' ? 'bg-red-100 text-red-800' :
                          msg.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {msg.priority} priority
                        </span>
                      )}
                    </div>
                    
                    <div className={`prose prose-sm max-w-none ${isFromMe ? 'text-blue-800' : 'text-gray-700'}`}>
                      <div dangerouslySetInnerHTML={{ __html: msg.body }} />
                    </div>
                  </div>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      {msg.attachments.map((attachment: any) => (
                        <div key={attachment.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <Paperclip className="w-4 h-4 text-gray-400" />
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
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reply Section */}
      <div className="p-6 border-t border-gray-200">
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
                placeholder={`Describe how you want to respond to ${message.sender_name}...`}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={4}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                The AI will generate a complete response based on your prompt and the conversation context
              </p>
              <button
                onClick={handleGenerateAIReply}
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

            {/* Generated Reply Preview */}
            {generatedReply && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900">AI-Generated Reply</span>
                  </div>
                  <button 
                    onClick={() => setGeneratedReply('')}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-gray-800">
                  {generatedReply}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              {supportsRichText ? (
                <TipTapEditor
                  content={richReplyText}
                  onChange={setRichReplyText}
                  placeholder={`Reply to ${message.sender_name}...`}
                />
              ) : (
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Reply to ${message.sender_name}...`}
                  className="w-full p-4 pr-20 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              )}
              
              {!supportsRichText && (
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <Smile className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Add attachment
            </button>
            <button className="text-sm text-purple-600 hover:text-purple-700">
              Use template
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {useAI ? (generatedReply ? 'AI has generated your reply' : 'Generate AI reply first') : 
                supportsRichText ? 'Use toolbar for formatting' : 
                'Press Enter to send, Shift+Enter for new line'}
            </span>
            
            <button
              onClick={handleSendReply}
              disabled={((!replyText.trim() && !richReplyText.trim() && !generatedReply) || isLoadingThread)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${((replyText.trim() || richReplyText.trim() || generatedReply) && !isLoadingThread)
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
  );
};