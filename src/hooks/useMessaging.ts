import { create } from 'zustand';
import { Message, Thread, Comment, FilterState, TabType, Platform } from '../types/messaging';

interface MessagingStore {
  activeTab: TabType;
  selectedThread: Thread | null;
  messages: Message[];
  threads: Thread[];
  comments: Comment[];
  filters: FilterState;
  isLoading: boolean;
  
  setActiveTab: (tab: TabType) => void;
  setSelectedThread: (thread: Thread | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  addMessage: (message: Message) => void;
  markAsRead: (messageId: string) => void;
  archiveMessage: (messageId: string) => void;
}

export const useMessaging = create<MessagingStore>((set, get) => ({
  activeTab: 'inbox',
  selectedThread: null,
  messages: [],
  threads: [],
  comments: [],
  filters: {
    platforms: [],
    status: [],
    search: ''
  },
  isLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab, selectedThread: null }),
  
  setSelectedThread: (thread) => set({ selectedThread: thread }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [message, ...state.messages]
  })),
  
  markAsRead: (messageId) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    )
  })),
  
  archiveMessage: (messageId) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'archived' } : msg
    )
  }))
}));