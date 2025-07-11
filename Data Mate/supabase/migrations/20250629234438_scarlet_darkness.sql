/*
  # Fix Critical Database Schema Issues

  1. Schema Fixes
    - Add missing updated_at column to comments table
    - Add missing user_id column to transcripts table  
    - Create missing audience_segments table and related tables
    - Ensure all required columns exist

  2. Security
    - Enable RLS on all tables
    - Add proper policies for user data access

  3. Performance
    - Add necessary indexes
    - Create update triggers
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

-- Ensure contacts table exists with all required columns
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
  END IF;
END $$;

-- Ensure transcripts table exists with user_id column
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

-- Add user_id column to transcripts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transcripts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE transcripts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
  END IF;
END $$;

-- Ensure ai_insights table exists
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

-- Create missing audience_segments table
CREATE TABLE IF NOT EXISTS audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  primary_traits jsonb DEFAULT '{}',
  cluster_criteria jsonb DEFAULT '{}',
  ai_persona_label text,
  total_contacts integer DEFAULT 0,
  engagement_score decimal(3,2),
  outreach_readiness_score decimal(3,2),
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audience_members join table
CREATE TABLE IF NOT EXISTS audience_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_segment_id uuid REFERENCES audience_segments(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  similarity_score decimal(3,2),
  added_at timestamptz DEFAULT now(),
  UNIQUE(audience_segment_id, contact_id)
);

-- Create enrichment_jobs table
CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_type text NOT NULL,
  status text DEFAULT 'pending',
  target_table text,
  target_id uuid,
  parameters jsonb DEFAULT '{}',
  progress integer DEFAULT 0,
  results jsonb DEFAULT '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create audience_insights table
CREATE TABLE IF NOT EXISTS audience_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  audience_segment_id uuid REFERENCES audience_segments(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score decimal(3,2),
  actionable_recommendations text[],
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create all necessary indexes
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_updated_at_idx ON contacts(updated_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_contact_id_idx ON comments(contact_id);
CREATE INDEX IF NOT EXISTS comments_updated_at_idx ON comments(updated_at DESC);
CREATE INDEX IF NOT EXISTS transcripts_user_id_idx ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS transcripts_contact_id_idx ON transcripts(contact_id);
CREATE INDEX IF NOT EXISTS transcripts_updated_at_idx ON transcripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_contact_id_idx ON ai_insights(contact_id);
CREATE INDEX IF NOT EXISTS ai_insights_updated_at_idx ON ai_insights(updated_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_updated_at_idx ON campaigns(updated_at DESC);
CREATE INDEX IF NOT EXISTS audience_segments_user_id_idx ON audience_segments(user_id);
CREATE INDEX IF NOT EXISTS audience_segments_updated_at_idx ON audience_segments(updated_at DESC);
CREATE INDEX IF NOT EXISTS audience_members_segment_id_idx ON audience_members(audience_segment_id);
CREATE INDEX IF NOT EXISTS audience_members_contact_id_idx ON audience_members(contact_id);
CREATE INDEX IF NOT EXISTS enrichment_jobs_user_id_idx ON enrichment_jobs(user_id);
CREATE INDEX IF NOT EXISTS enrichment_jobs_status_idx ON enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS audience_insights_segment_id_idx ON audience_insights(audience_segment_id);
CREATE INDEX IF NOT EXISTS audience_insights_user_id_idx ON audience_insights(user_id);

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_insights ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own comments" ON comments;
CREATE POLICY "Users can manage their own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own transcripts" ON transcripts;
CREATE POLICY "Users can manage their own transcripts"
  ON transcripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own ai_insights" ON ai_insights;
CREATE POLICY "Users can manage their own ai_insights"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own campaigns" ON campaigns;
CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own audience segments" ON audience_segments;
CREATE POLICY "Users can manage their own audience segments"
  ON audience_segments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage audience members for their segments" ON audience_members;
CREATE POLICY "Users can manage audience members for their segments"
  ON audience_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audience_segments 
      WHERE id = audience_members.audience_segment_id 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own enrichment jobs" ON enrichment_jobs;
CREATE POLICY "Users can manage their own enrichment jobs"
  ON enrichment_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage insights for their audience segments" ON audience_insights;
CREATE POLICY "Users can manage insights for their audience segments"
  ON audience_insights
  FOR ALL
  TO authenticated
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

-- Create triggers to automatically update updated_at columns
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

DROP TRIGGER IF EXISTS update_audience_segments_updated_at ON audience_segments;
CREATE TRIGGER update_audience_segments_updated_at BEFORE UPDATE ON audience_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_audience_insights_updated_at ON audience_insights;
CREATE TRIGGER update_audience_insights_updated_at BEFORE UPDATE ON audience_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update audience segment contact count
CREATE OR REPLACE FUNCTION update_audience_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE audience_segments 
    SET total_contacts = (
      SELECT COUNT(*) FROM audience_members 
      WHERE audience_segment_id = NEW.audience_segment_id
    )
    WHERE id = NEW.audience_segment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE audience_segments 
    SET total_contacts = (
      SELECT COUNT(*) FROM audience_members 
      WHERE audience_segment_id = OLD.audience_segment_id
    )
    WHERE id = OLD.audience_segment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to maintain contact counts
DROP TRIGGER IF EXISTS update_audience_contact_count_trigger ON audience_members;
CREATE TRIGGER update_audience_contact_count_trigger
  AFTER INSERT OR DELETE ON audience_members
  FOR EACH ROW EXECUTE FUNCTION update_audience_contact_count();