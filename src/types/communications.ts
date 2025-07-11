export interface Message {
  id: string;
  user_id: string;
  platform: Platform;
  external_id?: string;
  thread_id?: string;
  contact_id?: string;
  sender_name?: string;
  sender_handle?: string;
  sender_email?: string;
  recipient_name?: string;
  recipient_handle?: string;
  recipient_email?: string;
  subject?: string;
  body: string;
  message_type: MessageType;
  timestamp: string;
  is_read: boolean;
  is_archived: boolean;
  is_flagged: boolean;
  status: MessageStatus;
  priority: Priority;
  attachments: Attachment[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface Contact {
  id: string;
  user_id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  handle?: string;
  platform?: string;
  profile_image?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  job_title?: string;
  follower_count: number;
  engagement_rate: number;
  sentiment_score: number;
  tags: string[];
  custom_fields: Record<string, any>;
  enriched: boolean;
  enriched_at?: string;
  enrichment_source?: string;
  last_interaction?: string;
  interaction_count: number;
  total_value: number;
  status: ContactStatus;
  source: ContactSource;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  platform: Platform;
  external_id?: string;
  post_id?: string;
  post_title?: string;
  post_url?: string;
  content: string;
  author_name?: string;
  author_handle?: string;
  author_avatar?: string;
  contact_id?: string;
  parent_comment_id?: string;
  timestamp: string;
  is_reply: boolean;
  replied: boolean;
  reply_content?: string;
  replied_at?: string;
  sentiment?: Sentiment;
  sentiment_score?: number;
  likes_count: number;
  replies_count: number;
  is_mention: boolean;
  workflow_triggered: boolean;
  workflow_id?: string;
  created_at: string;
  contact?: Contact;
  replies?: Comment[];
}

export interface ContactEnrichmentLog {
  id: string;
  contact_id: string;
  user_id: string;
  enriched_by: EnrichmentSource;
  enrichment_type: EnrichmentType;
  data_before: Record<string, any>;
  data_after: Record<string, any>;
  fields_updated: string[];
  confidence_score?: number;
  cost: number;
  status: EnrichmentStatus;
  error_message?: string;
  created_at: string;
}

export interface ContactInteraction {
  id: string;
  contact_id: string;
  user_id: string;
  interaction_type: InteractionType;
  platform?: string;
  title?: string;
  description?: string;
  metadata: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface ContactTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
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
  | 'tiktok'
  | 'sms'
  | 'telegram'
  | 'discord';

export type MessageType = 'message' | 'email' | 'dm' | 'comment';

export type MessageStatus = 'pending' | 'replied' | 'ignored' | 'scheduled';

export type Priority = 'high' | 'normal' | 'low';

export type ContactStatus = 'active' | 'inactive' | 'blocked';

export type ContactSource = 'manual' | 'import' | 'auto-generated';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type EnrichmentSource = 'AI Agent' | 'Scraper' | 'Clearbit' | 'PeopleDataLabs' | 'Manual';

export type EnrichmentType = 'profile' | 'social' | 'professional' | 'contact_info';

export type EnrichmentStatus = 'pending' | 'completed' | 'failed';

export type InteractionType = 'message' | 'comment' | 'email' | 'call' | 'meeting' | 'note';

export type TabType = 'messages' | 'comments' | 'contacts' | 'enrichment';

export interface FilterState {
  platforms: Platform[];
  status: MessageStatus[];
  priority: Priority[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  search: string;
}

export interface EnrichmentWizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface EnrichmentRequest {
  contactId: string;
  sources: EnrichmentSource[];
  fields: string[];
  budget?: number;
}