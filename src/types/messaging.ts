export interface Message {
  id: string;
  threadId?: string;
  platform: Platform;
  type: MessageType;
  content: string;
  sender: Contact;
  recipient?: Contact;
  timestamp: Date;
  status: MessageStatus;
  isRead: boolean;
  assignedTo?: string;
  campaignId?: string;
  attachments?: Attachment[];
  workflowTriggered?: boolean;
}

export interface Thread {
  id: string;
  platform: Platform;
  participants: Contact[];
  messages: Message[];
  lastUpdated: Date;
  isRead: boolean;
  subject?: string;
}

export interface Comment {
  id: string;
  platform: Platform;
  postId: string;
  postTitle: string;
  content: string;
  author: Contact;
  timestamp: Date;
  replied: boolean;
  workflowTriggered?: boolean;
  replies?: Comment[];
  likes?: number;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  username?: string;
  avatar?: string;
  platform: Platform;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export type Platform = 
  | 'email' 
  | 'instagram' 
  | 'facebook' 
  | 'twitter' 
  | 'linkedin' 
  | 'whatsapp' 
  | 'youtube' 
  | 'tiktok';

export type MessageType = 'email' | 'dm' | 'comment' | 'mention';

export type MessageStatus = 'unread' | 'read' | 'replied' | 'archived' | 'flagged';

export type TabType = 'inbox' | 'sent' | 'archived' | 'drafts' | 'comments' | 'workflows';

export interface FilterState {
  platforms: Platform[];
  status: MessageStatus[];
  campaign?: string;
  assigned?: string;
  search: string;
}