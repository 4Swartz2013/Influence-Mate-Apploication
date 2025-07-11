import React, { useState } from 'react';
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
  Sparkles,
  UserPlus,
  Database,
  Download,
  Upload,
  Tag,
  RefreshCw
} from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { ContactDrawer } from './ContactDrawer';
import { EnrichmentWizard } from './EnrichmentWizard';
import { CRMConnectionWizard } from './CRMConnectionWizard';
import { AddContactForm } from './AddContactForm';
import { Contact, Platform } from '../../types';
import { getPlatformConfig, formatTimeAgo } from '../../utils/platformUtils';
import { PlatformFilter } from '../shared/PlatformFilter';

interface ContactsViewProps {
  searchQuery: string;
  filters: any;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ searchQuery, filters }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showEnrichmentWizard, setShowEnrichmentWizard] = useState(false);
  const [showCRMWizard, setShowCRMWizard] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activePlatformFilters, setActivePlatformFilters] = useState<Platform[]>([]);
  const [activeSourceFilters, setActiveSourceFilters] = useState<string[]>([]);
  
  const { contacts, isLoading, createContact, updateContact, deleteContact, enrichContact, isEnriching } = useContacts({ 
    ...filters, 
    search: searchQuery,
    platforms: activePlatformFilters.length > 0 ? activePlatformFilters : undefined,
    sources: activeSourceFilters.length > 0 ? activeSourceFilters : undefined
  });

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDrawer(true);
  };

  const handleEnrichContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEnrichmentWizard(true);
  };

  const handleCRMConnection = () => {
    setShowCRMWizard(true);
  };

  const handleCRMComplete = (source: string, config: any) => {
    console.log('CRM Import:', source, config);
    setShowCRMWizard(false);
    // Here you would handle the actual import process
  };

  const handleAddContact = (contactData: any) => {
    createContact(contactData);
    setShowCreateForm(false);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handlePlatformFilterChange = (platforms: Platform[]) => {
    setActivePlatformFilters(platforms);
  };

  const toggleSourceFilter = (source: string) => {
    setActiveSourceFilters(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleBulkEnrich = () => {
    console.log('Bulk enrich:', selectedContacts);
    // Implement bulk enrichment
  };

  const handleBulkTag = () => {
    console.log('Bulk tag:', selectedContacts);
    // Implement bulk tagging
  };

  const handleBulkExport = () => {
    console.log('Bulk export:', selectedContacts);
    // Implement bulk export
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'manual': return 'Manual Entry';
      case 'import': return 'Imported';
      case 'auto-generated': return 'Auto-Generated';
      case 'comment': return 'From Comment';
      case 'message': return 'From Message';
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'import': return 'bg-purple-100 text-purple-800';
      case 'auto-generated': return 'bg-green-100 text-green-800';
      case 'comment': return 'bg-yellow-100 text-yellow-800';
      case 'message': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {contacts.length} Contacts
              </h2>
              
              {selectedContacts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedContacts.length} selected
                  </span>
                  <div className="relative">
                    <button 
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Bulk Actions
                    </button>
                    
                    {showBulkActions && (
                      <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button 
                          onClick={handleBulkEnrich}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Enrich</span>
                        </button>
                        <button 
                          onClick={handleBulkTag}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Tag className="w-4 h-4" />
                          <span>Add Tags</span>
                        </button>
                        <button 
                          onClick={handleBulkExport}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export</span>
                        </button>
                        <button 
                          onClick={() => console.log('Delete contacts:', selectedContacts)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>

              <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button 
                onClick={handleCRMConnection}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Database className="w-4 h-4" />
                <span>Connect CRM</span>
              </button>
              
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-2 border-b border-gray-200">
          <div className="flex flex-col space-y-2">
            {/* Platform Filter */}
            <PlatformFilter 
              activePlatforms={activePlatformFilters}
              onChange={handlePlatformFilterChange}
            />
            
            {/* Source Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto py-1">
              <span className="text-xs font-medium text-gray-500">Source:</span>
              {['manual', 'import', 'auto-generated', 'comment', 'message'].map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSourceFilter(source)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                    ${activeSourceFilters.includes(source) 
                      ? getSourceColor(source) 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {getSourceLabel(source)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="flex-1 overflow-auto">
          {contacts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-4">Get started by importing your contacts or adding them manually.</p>
              <div className="flex items-center justify-center space-x-3">
                <button 
                  onClick={handleCRMConnection}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Database className="w-4 h-4" />
                  <span>Import Contacts</span>
                </button>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Manually</span>
                </button>
              </div>
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
                        onChange={handleSelectAll}
                        checked={selectedContacts.length === contacts.length && contacts.length > 0}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
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
                  {contacts.map((contact, index) => {
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
                          <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(contact.source)}`}>
                            {getSourceLabel(contact.source)}
                          </span>
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
                                disabled={isEnriching}
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

      {/* Contact Drawer */}
      {showContactDrawer && selectedContact && (
        <ContactDrawer
          contact={selectedContact}
          onClose={() => {
            setShowContactDrawer(false);
            setSelectedContact(null);
          }}
          onEnrich={() => {
            setShowContactDrawer(false);
            setShowEnrichmentWizard(true);
          }}
        />
      )}

      {/* Enrichment Wizard */}
      {showEnrichmentWizard && selectedContact && (
        <EnrichmentWizard
          contact={selectedContact}
          onClose={() => {
            setShowEnrichmentWizard(false);
            setSelectedContact(null);
          }}
          onEnrich={(source, fields) => {
            enrichContact({ contactId: selectedContact.id, source, fields });
            setShowEnrichmentWizard(false);
            setSelectedContact(null);
          }}
        />
      )}

      {/* CRM Connection Wizard */}
      {showCRMWizard && (
        <CRMConnectionWizard
          onClose={() => setShowCRMWizard(false)}
          onComplete={handleCRMComplete}
        />
      )}

      {/* Add Contact Form */}
      {showCreateForm && (
        <AddContactForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleAddContact}
        />
      )}
    </>
  );
};