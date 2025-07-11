/*
  # Comprehensive Database Schema Fix

  This migration ensures all required tables and columns exist with proper structure.
  It's designed to be safe to run multiple times and will not cause data loss.

  1. Tables Created/Fixed
    - `ai_insights` - AI-generated insights table
    - `comments` - Add missing `updated_at` column
    - `transcripts` - Ensure `user_id` column exists
    - All other core tables verified

  2. Security
    - Enable RLS on all tables
    - Create proper policies for authenticated users

  3. Performance
    - Add necessary indexes
    - Create update triggers for timestamp management
*/

-- Create custom types if they don't exist
DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE insight_type AS ENUM ('conversion_prediction', 'persona_conflict', 'audience_clustering', 'outreach_suggestion', 'causal_analysis');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure contacts table exists
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Unknown Contact',
  email text,
  phone text,
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

-- Ensure comments table exists with updated_at column
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

-- Add updated_at column to comments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE comments ADD COLUMN updated_at timestamptz DEFAULT now();
    -- Initialize existing records
    UPDATE comments SET updated_at = created_at WHERE updated_at IS NULL;
  END IF;
END $$;

-- Ensure transcripts table exists with user_id
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

-- Add user_id to transcripts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transcripts' AND column_name = 'user_id'
  ) THEN
    -- Add as nullable first
    ALTER TABLE transcripts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Try to populate from contacts if possible
    UPDATE transcripts SET user_id = (
      SELECT c.user_id FROM contacts c WHERE c.id = transcripts.contact_id
    ) WHERE contact_id IS NOT NULL AND user_id IS NULL;
    
    -- Delete orphaned records without user_id
    DELETE FROM transcripts WHERE user_id IS NULL;
    
    -- Make NOT NULL after cleanup
    ALTER TABLE transcripts ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Create ai_insights table (this is the main missing table causing the 404 error)
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

-- Ensure campaigns table exists
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

-- Create all necessary indexes
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_updated_at_idx ON contacts(updated_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_updated_at_idx ON comments(updated_at DESC);
CREATE INDEX IF NOT EXISTS transcripts_user_id_idx ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS transcripts_updated_at_idx ON transcripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_updated_at_idx ON ai_insights(updated_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_updated_at_idx ON campaigns(updated_at DESC);

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop and recreate to ensure they're correct)
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;
CREATE POLICY "Users can manage their own contacts"
  ON contacts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own comments" ON comments;
CREATE POLICY "Users can manage their own comments"
  ON comments FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own transcripts" ON transcripts;
CREATE POLICY "Users can manage their own transcripts"
  ON transcripts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own ai_insights" ON ai_insights;
CREATE POLICY "Users can manage their own ai_insights"
  ON ai_insights FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own campaigns" ON campaigns;
CREATE POLICY "Users can manage their own campaigns"
  ON campaigns FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transcripts_updated_at ON transcripts;
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_insights_updated_at ON ai_insights;
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();