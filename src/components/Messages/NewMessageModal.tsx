import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Users, 
  Mail,
  MessageSquare,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  Youtube,
  Music,
  Phone,
  ChevronDown,
  Search,
  Bot,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { TipTapEditor } from './TipTapEditor';
import { Platform } from '../../types';
import { getPlatformConfig } from '../../utils/platformUtils';
import { supabase } from '../../lib/supabase';

interface NewMessageModalProps {
  onClose: () => void;
  onSend: (messageData: any) => void;
}

const platforms: { id: Platform; name: string; icon: any; supportsRichText: boolean }[] = [
  { id: 'email', name: 'Email', icon: Mail, supportsRichText: true },
  { id: 'instagram', name: 'Instagram DM', icon: Instagram, supportsRichText: false },
  { id: 'twitter', name: 'Twitter DM', icon: Twitter, supportsRichText: false },
  { id: 'linkedin', name: 'LinkedIn Message', icon: Linkedin, supportsRichText: false },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, supportsRichText: false },
  { id: 'youtube', name: 'YouTube Comment', icon: Youtube, supportsRichText: false },
  { id: 'tiktok', name: 'TikTok Comment', icon: Music, supportsRichText: false },
  { id: 'sms', name: 'SMS', icon: Phone, supportsRichText: false }
];

export const NewMessageModal: React.FC<NewMessageModalProps> = ({ onClose, onSend }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedPlatformConfig = platforms.find(p => p.id === selectedPlatform);
  const supportsRichText = selectedPlatformConfig?.supportsRichText || false;

  // Fetch contacts for the dropdown
  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('id, full_name, email, handle, platform')
        .order('full_name', { ascending: true });
      
      if (data) {
        setContacts(data);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (!contactSearchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = contactSearchQuery.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.full_name?.toLowerCase().includes(query) || 
      contact.email?.toLowerCase().includes(query) || 
      contact.handle?.toLowerCase().includes(query)
    );
    
    setFilteredContacts(filtered);
  }, [contactSearchQuery, contacts]);

  const handleSend = () => {
    if (!recipient.trim() || (!content.trim() && !richContent.trim() && !useAI && !generatedContent)) return;

    const messageData = {
      platform: selectedPlatform,
      recipient,
      subject: subject.trim() || undefined,
      content: useAI ? generatedContent : (supportsRichText ? richContent : content),
      message_type: selectedPlatform === 'email' ? 'email' : 'dm',
      priority: 'normal',
      useAI: useAI,
      aiPrompt: aiPrompt
    };

    onSend(messageData);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  const handleContactSelect = (contact: any) => {
    setRecipient(selectedPlatform === 'email' ? contact.email : contact.handle);
    setShowContactSearch(false);
  };

  const handleGenerateAIContent = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedText = `This is an AI-generated message based on your prompt: "${aiPrompt}"\n\nHello ${recipient},\n\nThank you for your interest. I'd be happy to discuss this further with you. Let's schedule a time to talk about how we can collaborate effectively.\n\nLooking forward to connecting,\n[Your Name]`;
      
      setGeneratedContent(generatedText);
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
              <p className="text-sm text-gray-600">Compose and send a message across platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex items-center space-x-3">
                  {selectedPlatformConfig && (
                    <>
                      <selectedPlatformConfig.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">{selectedPlatformConfig.name}</span>
                    </>
                  )}
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              <AnimatePresence>
                {showPlatformDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                  >
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <button
                          key={platform.id}
                          onClick={() => {
                            setSelectedPlatform(platform.id);
                            setShowPlatformDropdown(false);
                          }}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left"
                        >
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-900">{platform.name}</span>
                          {platform.supportsRichText && (
                            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Rich Text
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedPlatform === 'email' ? 'To' : 'Recipient'}
            </label>
            <div className="relative">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  onFocus={() => setShowContactSearch(true)}
                  placeholder={
                    selectedPlatform === 'email' 
                      ? 'Enter email address or search contacts' 
                      : `Enter ${selectedPlatformConfig?.name} handle or search contacts`
                  }
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  onClick={() => setShowContactSearch(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Contact Search Dropdown */}
              <AnimatePresence>
                {showContactSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                  >
                    <div className="p-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={contactSearchQuery}
                          onChange={(e) => setContactSearchQuery(e.target.value)}
                          placeholder="Search contacts..."
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {filteredContacts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No contacts found
                        </div>
                      ) : (
                        filteredContacts.map((contact) => {
                          const contactPlatform = contact.platform ? getPlatformConfig(contact.platform as Platform) : null;
                          const ContactIcon = contactPlatform?.icon;
                          
                          return (
                            <button
                              key={contact.id}
                              onClick={() => handleContactSelect(contact)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {contact.full_name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {contact.full_name}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  {ContactIcon && (
                                    <ContactIcon className="w-3 h-3" />
                                  )}
                                  <span className="truncate">
                                    {selectedPlatform === 'email' ? contact.email : contact.handle}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Subject (for email) */}
          {selectedPlatform === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* AI Message Toggle */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Influence AI</p>
                <p className="text-sm text-gray-600">Let AI generate your message</p>
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

          {/* AI Prompt or Manual Message */}
          {useAI ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Prompt
              </label>
              <div className="relative">
                <Bot className="absolute left-3 top-3 w-5 h-5 text-purple-500" />
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe what you want to say, e.g. 'Write a friendly response thanking them for their interest in our product and asking about their specific needs'"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  The AI will generate a complete message based on your prompt
                </p>
                <button
                  onClick={handleGenerateAIContent}
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
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Message
                  </label>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              
              {supportsRichText ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <TipTapEditor
                    content={richContent}
                    onChange={setRichContent}
                    placeholder="Compose your message..."
                  />
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                />
              )}
            </div>
          )}

          {/* Character Count for non-email platforms */}
          {!supportsRichText && !useAI && (
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {selectedPlatform === 'twitter' && content.length > 280 && (
                  <span className="text-red-500">Character limit exceeded</span>
                )}
              </span>
              <span>
                {content.length}
                {selectedPlatform === 'twitter' && '/280'}
                {selectedPlatform === 'instagram' && '/2200'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {useAI ? (
              <span>AI will generate content based on your prompt</span>
            ) : supportsRichText ? (
              <span>Use Cmd/Ctrl + Enter to send</span>
            ) : (
              <span>Press Cmd/Ctrl + Enter to send</span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!recipient.trim() || (!content.trim() && !richContent.trim() && !useAI && !generatedContent)}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};