/*
  # Unified Communications & CRM Schema - Fixed Migration

  1. New Tables
    - `messages` - Unified messaging across all platforms
    - `contacts` - CRM contacts with enrichment capabilities
    - `contact_enrichment_logs` - Track enrichment activities
    - `comments` - Social media comments and mentions
    - `contact_interactions` - Timeline of all contact interactions
    - `contact_tags` - Flexible tagging system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Secure contact enrichment logs

  3. Indexes
    - Performance indexes for common queries
    - Full-text search capabilities
*/

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS contact_interactions CASCADE;
DROP TABLE IF EXISTS contact_enrichment_logs CASCADE;
DROP TABLE IF EXISTS contact_tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_contact_interaction_count() CASCADE;

-- Messages table for unified communications
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- 'email', 'instagram', 'sms', 'whatsapp', etc.
  external_id text,
  thread_id text,
  contact_id uuid, -- Will add FK constraint after contacts table is created
  sender_name text,
  sender_handle text,
  sender_email text,
  recipient_name text,
  recipient_handle text,
  recipient_email text,
  subject text,
  body text NOT NULL,
  message_type text DEFAULT 'message', -- 'message', 'email', 'dm', 'comment'
  timestamp timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  is_flagged boolean DEFAULT false,
  status text DEFAULT 'pending', -- 'replied', 'pending', 'ignored', 'scheduled'
  priority text DEFAULT 'normal', -- 'high', 'normal', 'low'
  attachments jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contacts table for CRM functionality
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  handle text,
  platform text,
  profile_image text,
  bio text,
  location text,
  website text,
  company text,
  job_title text,
  follower_count integer DEFAULT 0,
  engagement_rate float DEFAULT 0,
  sentiment_score float DEFAULT 0,
  tags text[] DEFAULT '{}',
  custom_fields jsonb DEFAULT '{}',
  enriched boolean DEFAULT false,
  enriched_at timestamptz,
  enrichment_source text,
  last_interaction timestamptz,
  interaction_count integer DEFAULT 0,
  total_value decimal(10,2) DEFAULT 0,
  status text DEFAULT 'active', -- 'active', 'inactive', 'blocked'
  source text DEFAULT 'manual', -- 'manual', 'import', 'auto-generated'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact enrichment logs
CREATE TABLE contact_enrichment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enriched_by text NOT NULL, -- 'AI Agent', 'Scraper', 'Clearbit', 'Manual'
  enrichment_type text NOT NULL, -- 'profile', 'social', 'professional', 'contact_info'
  data_before jsonb DEFAULT '{}',
  data_after jsonb DEFAULT '{}',
  fields_updated text[] DEFAULT '{}',
  confidence_score float,
  cost decimal(10,4) DEFAULT 0,
  status text DEFAULT 'completed', -- 'pending', 'completed', 'failed'
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Comments and mentions
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  external_id text,
  post_id text,
  post_title text,
  post_url text,
  content text NOT NULL,
  author_name text,
  author_handle text,
  author_avatar text,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  is_reply boolean DEFAULT false,
  replied boolean DEFAULT false,
  reply_content text,
  replied_at timestamptz,
  sentiment text, -- 'positive', 'negative', 'neutral'
  sentiment_score float,
  likes_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  is_mention boolean DEFAULT false,
  workflow_triggered boolean DEFAULT false,
  workflow_id text,
  created_at timestamptz DEFAULT now()
);

-- Contact interactions timeline
CREATE TABLE contact_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type text NOT NULL, -- 'message', 'comment', 'email', 'call', 'meeting'
  platform text,
  title text,
  description text,
  metadata jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Contact tags for flexible categorization
CREATE TABLE contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Now add the foreign key constraint for messages.contact_id
ALTER TABLE messages ADD CONSTRAINT messages_contact_id_fkey 
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enrichment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own messages"
  ON messages FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own enrichment logs"
  ON contact_enrichment_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comments"
  ON comments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contact interactions"
  ON contact_interactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contact tags"
  ON contact_tags FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_platform ON messages(platform);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_platform ON contacts(platform);
CREATE INDEX idx_contacts_last_interaction ON contacts(last_interaction DESC);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_platform ON comments(platform);
CREATE INDEX idx_comments_timestamp ON comments(timestamp DESC);
CREATE INDEX idx_comments_contact_id ON comments(contact_id);

CREATE INDEX idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX idx_contact_interactions_timestamp ON contact_interactions(timestamp DESC);

-- Full-text search indexes
CREATE INDEX idx_messages_search ON messages USING GIN(to_tsvector('english', body || ' ' || COALESCE(sender_name, '') || ' ' || COALESCE(subject, '')));
CREATE INDEX idx_contacts_search ON contacts USING GIN(to_tsvector('english', full_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company, '')));
CREATE INDEX idx_comments_search ON comments USING GIN(to_tsvector('english', content || ' ' || COALESCE(author_name, '')));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_contacts_updated_at 
  BEFORE UPDATE ON contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update contact interaction count
CREATE OR REPLACE FUNCTION update_contact_interaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.contact_id IS NOT NULL THEN
            UPDATE contacts 
            SET interaction_count = interaction_count + 1,
                last_interaction = COALESCE(NEW.timestamp, now())
            WHERE id = NEW.contact_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.contact_id IS NOT NULL THEN
            UPDATE contacts 
            SET interaction_count = GREATEST(interaction_count - 1, 0)
            WHERE id = OLD.contact_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for interaction counting
CREATE TRIGGER update_contact_interaction_count_messages
  AFTER INSERT OR DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_interaction_count();

CREATE TRIGGER update_contact_interaction_count_comments
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_interaction_count();