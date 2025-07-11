import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useCommunications } from '../../hooks/useCommunications';
import { Contact } from '../../types/communications';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';

interface ContactsTabProps {
  searchQuery: string;
}

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: '1',
    user_id: 'user1',
    full_name: 'Sarah Johnson',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    handle: '@sarahj_official',
    platform: 'instagram',
    profile_image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Fashion influencer & lifestyle blogger',
    location: 'Los Angeles, CA',
    website: 'https://sarahjohnson.com',
    company: 'SJ Media',
    job_title: 'Content Creator',
    follower_count: 125000,
    engagement_rate: 4.2,
    sentiment_score: 0.8,
    tags: ['VIP', 'Fashion', 'Lifestyle'],
    custom_fields: {},
    enriched: true,
    enriched_at: new Date().toISOString(),
    enrichment_source: 'AI Agent',
    last_interaction: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    interaction_count: 15,
    total_value: 2500.00,
    status: 'active',
    source: 'auto-generated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    full_name: 'Mark Thompson',
    first_name: 'Mark',
    last_name: 'Thompson',
    email: 'mark@company.com',
    phone: '+1 (555) 987-6543',
    platform: 'email',
    company: 'Tech Solutions Inc',
    job_title: 'Marketing Director',
    follower_count: 0,
    engagement_rate: 0,
    sentiment_score: 0.6,
    tags: ['Business', 'Partnership'],
    custom_fields: {},
    enriched: false,
    last_interaction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    interaction_count: 8,
    total_value: 5000.00,
    status: 'active',
    source: 'manual',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const ContactsTab: React.FC<ContactsTabProps> = ({ searchQuery }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  const { 
    filters, 
    selectedContact, 
    setSelectedContact, 
    setShowContactDrawer,
    setShowEnrichmentWizard
  } = useCommunications();

  const filteredContacts = useMemo(() => {
    return mockContacts.filter(contact => {
      const matchesSearch = searchQuery === '' || 
        contact.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => contact.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [searchQuery, filters]);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDrawer(true);
  };

  const handleEnrichContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEnrichmentWizard(true);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'blocked': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredContacts.length} Contacts
            </h2>
            
            {selectedContacts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedContacts.length} selected
                </span>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Bulk Actions
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="flex-1 overflow-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts(filteredContacts.map(c => c.id));
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact, index) => {
                  const platformConfig = contact.platform ? getPlatformConfig(contact.platform as any) : null;
                  const PlatformIcon = platformConfig?.icon;

                  return (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleContactClick(contact)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {contact.profile_image ? (
                              <img
                                src={contact.profile_image}
                                alt={contact.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {contact.full_name?.charAt(0) || 'U'}
                              </div>
                            )}
                            
                            {contact.enriched && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.full_name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              {contact.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {platformConfig && PlatformIcon && (
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${platformConfig.color}`}>
                              <PlatformIcon className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-900">{platformConfig.name}</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {contact.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{contact.interaction_count}</p>
                          <p className="text-gray-500">
                            {contact.last_interaction && formatTimeAgo(new Date(contact.last_interaction))}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          ${contact.total_value.toLocaleString()}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleContactClick(contact)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          {!contact.enriched && (
                            <button
                              onClick={() => handleEnrichContact(contact)}
                              className="p-1 rounded hover:bg-purple-100"
                              title="Enrich Contact"
                            >
                              <Sparkles className="w-4 h-4 text-purple-500" />
                            </button>
                          )}
                          
                          <button className="p-1 rounded hover:bg-gray-100" title="More Actions">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};