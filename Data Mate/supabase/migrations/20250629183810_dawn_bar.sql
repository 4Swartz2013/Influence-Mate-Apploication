/*
  # Initial schema for Influence Mate Data Intelligence Platform

  1. New Tables
    - `contacts` - Enriched influencer/contact profiles
    - `comments` - Scraped comments and analysis data
    - `transcripts` - Video/audio transcripts and AI summaries
    - `ai_insights` - AI-generated insights and predictions
    - `campaigns` - Marketing campaigns and tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create custom types
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE insight_type AS ENUM ('conversion_prediction', 'persona_conflict', 'audience_clustering', 'outreach_suggestion', 'causal_analysis');

-- Contacts table - enriched influencer profiles
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  platform text,
  username text,
  bio text,
  follower_count integer DEFAULT 0,
  engagement_rate decimal(5,4),
  location text,
  tags text[] DEFAULT '{}',
  contact_score decimal(3,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table - scraped comments and sentiment analysis
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  content text NOT NULL,
  platform text NOT NULL,
  post_url text,
  sentiment_score decimal(3,2),
  intent_labels text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcripts table - video/audio transcripts and AI analysis
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  content_url text NOT NULL,
  raw_transcript text NOT NULL,
  ai_summary text,
  topics text[] DEFAULT '{}',
  sentiment text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Insights table - AI-generated insights and predictions
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  insight_type insight_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score decimal(3,2),
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table - marketing campaigns and tracking
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status campaign_status DEFAULT 'draft',
  start_date timestamptz,
  end_date timestamptz,
  budget decimal(12,2),
  target_contacts text[] DEFAULT '{}',
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_updated_at_idx ON contacts(updated_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_contact_id_idx ON comments(contact_id);
CREATE INDEX IF NOT EXISTS transcripts_user_id_idx ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS transcripts_contact_id_idx ON transcripts(contact_id);
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_contact_id_idx ON ai_insights(contact_id);
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transcripts"
  ON transcripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ai_insights"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();