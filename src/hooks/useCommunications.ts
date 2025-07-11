import { create } from 'zustand';
import { Message, Contact, Comment, FilterState, TabType, ContactTag } from '../types/communications';

interface CommunicationsStore {
  // UI State
  activeTab: TabType;
  selectedMessage: Message | null;
  selectedContact: Contact | null;
  selectedComment: Comment | null;
  
  // Data
  messages: Message[];
  contacts: Contact[];
  comments: Comment[];
  contactTags: ContactTag[];
  
  // Filters
  filters: FilterState;
  
  // Loading states
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingContacts: boolean;
  isLoadingComments: boolean;
  
  // Modals
  showEnrichmentWizard: boolean;
  showContactDrawer: boolean;
  showMessageThread: boolean;
  
  // Actions
  setActiveTab: (tab: TabType) => void;
  setSelectedMessage: (message: Message | null) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setSelectedComment: (comment: Comment | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setShowEnrichmentWizard: (show: boolean) => void;
  setShowContactDrawer: (show: boolean) => void;
  setShowMessageThread: (show: boolean) => void;
  
  // Data actions
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  
  // Bulk actions
  markMessagesAsRead: (messageIds: string[]) => void;
  archiveMessages: (messageIds: string[]) => void;
  deleteMessages: (messageIds: string[]) => void;
}

export const useCommunications = create<CommunicationsStore>((set, get) => ({
  // Initial state
  activeTab: 'messages',
  selectedMessage: null,
  selectedContact: null,
  selectedComment: null,
  
  messages: [],
  contacts: [],
  comments: [],
  contactTags: [],
  
  filters: {
    platforms: [],
    status: [],
    priority: [],
    tags: [],
    dateRange: {},
    search: ''
  },
  
  isLoading: false,
  isLoadingMessages: false,
  isLoadingContacts: false,
  isLoadingComments: false,
  
  showEnrichmentWizard: false,
  showContactDrawer: false,
  showMessageThread: false,
  
  // UI Actions
  setActiveTab: (tab) => set({ 
    activeTab: tab,
    selectedMessage: null,
    selectedContact: null,
    selectedComment: null
  }),
  
  setSelectedMessage: (message) => set({ selectedMessage: message }),
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  setSelectedComment: (comment) => set({ selectedComment: comment }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  setShowEnrichmentWizard: (show) => set({ showEnrichmentWizard: show }),
  setShowContactDrawer: (show) => set({ showContactDrawer: show }),
  setShowMessageThread: (show) => set({ showMessageThread: show }),
  
  // Data actions
  addMessage: (message) => set((state) => ({
    messages: [message, ...state.messages]
  })),
  
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),
  
  addContact: (contact) => set((state) => ({
    contacts: [contact, ...state.contacts]
  })),
  
  updateContact: (id, updates) => set((state) => ({
    contacts: state.contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    )
  })),
  
  addComment: (comment) => set((state) => ({
    comments: [comment, ...state.comments]
  })),
  
  updateComment: (id, updates) => set((state) => ({
    comments: state.comments.map(comment => 
      comment.id === id ? { ...comment, ...updates } : comment
    )
  })),
  
  // Bulk actions
  markMessagesAsRead: (messageIds) => set((state) => ({
    messages: state.messages.map(msg => 
      messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
    )
  })),
  
  archiveMessages: (messageIds) => set((state) => ({
    messages: state.messages.map(msg => 
      messageIds.includes(msg.id) ? { ...msg, is_archived: true } : msg
    )
  })),
  
  deleteMessages: (messageIds) => set((state) => ({
    messages: state.messages.filter(msg => !messageIds.includes(msg.id))
  }))
}));