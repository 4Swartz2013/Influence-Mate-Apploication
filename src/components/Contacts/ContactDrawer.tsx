import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Calendar,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  Sparkles,
  Tag,
  Clock,
  TrendingUp,
  Heart,
  Eye
} from 'lucide-react';
import { Contact } from '../../types';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';

interface ContactDrawerProps {
  contact: Contact;
  onClose: () => void;
  onEnrich: () => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({ 
  contact, 
  onClose, 
  onEnrich 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'interactions' | 'enrichment'>('overview');
  
  const platformConfig = contact.platform ? getPlatformConfig(contact.platform as any) : null;
  const PlatformIcon = platformConfig?.icon;

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const mockInteractions = [
    {
      id: '1',
      type: 'message',
      title: 'Instagram DM',
      description: 'Collaboration inquiry about spring campaign',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      platform: 'instagram'
    },
    {
      id: '2',
      type: 'comment',
      title: 'YouTube Comment',
      description: 'Positive feedback on latest video',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      platform: 'youtube'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white h-full w-full max-w-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {contact.profile_image ? (
                <img
                  src={contact.profile_image}
                  alt={contact.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {contact.full_name?.charAt(0) || 'U'}
                </div>
              )}
              
              {contact.enriched && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {contact.full_name}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {platformConfig && PlatformIcon && (
                  <div className="flex items-center space-x-1">
                    <PlatformIcon className="w-4 h-4" />
                    <span>{platformConfig.name}</span>
                  </div>
                )}
                {contact.handle && (
                  <span>{contact.handle}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!contact.enriched && (
              <button
                onClick={onEnrich}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enrich</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'interactions', label: 'Interactions' },
              { id: 'enrichment', label: 'Enrichment' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.email && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                      </div>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      </div>
                    </div>
                  )}

                  {contact.location && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{contact.location}</p>
                      </div>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Company</p>
                        <p className="text-sm text-gray-600">{contact.company}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {contact.interaction_count}
                    </div>
                    <div className="text-sm text-blue-600">Interactions</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${contact.total_value.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">Total Value</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(contact.sentiment_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-purple-600">Sentiment</div>
                  </div>
                </div>

                {/* Tags */}
                {contact.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {contact.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                    <p className="text-gray-700 leading-relaxed">{contact.bio}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'interactions' && (
              <motion.div
                key="interactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900">Interaction Timeline</h3>
                
                <div className="space-y-4">
                  {mockInteractions.map((interaction) => {
                    const config = getPlatformConfig(interaction.platform as any);
                    const Icon = config.icon;
                    
                    return (
                      <div key={interaction.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{interaction.title}</h4>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(interaction.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{interaction.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'enrichment' && (
              <motion.div
                key="enrichment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Enrichment Status</h3>
                  {!contact.enriched && (
                    <button
                      onClick={onEnrich}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Start Enrichment</span>
                    </button>
                  )}
                </div>

                {contact.enriched ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Contact Enriched</span>
                      </div>
                      <p className="text-sm text-green-800">
                        This contact was enriched on {contact.enriched_at && formatTimeAgo(new Date(contact.enriched_at))} 
                        using {contact.enrichment_source}.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Source</p>
                        <p className="text-sm text-gray-600">{contact.enrichment_source}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Confidence</p>
                        <p className="text-sm text-gray-600">95%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Contact Not Enriched</h4>
                    <p className="text-gray-600 mb-4">
                      Enrich this contact to get additional profile information, social stats, and professional details.
                    </p>
                    <button
                      onClick={onEnrich}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Start Enrichment
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};