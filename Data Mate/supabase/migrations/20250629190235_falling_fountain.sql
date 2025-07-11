/*
  # Audience Intelligence System

  1. New Tables
    - `audience_segments` - AI-generated audience clusters
    - `audience_members` - Join table linking contacts to segments
    - `enrichment_jobs` - Background processing jobs
    - `audience_insights` - AI insights specific to audiences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create audience segment table
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

-- Create audience members join table
CREATE TABLE IF NOT EXISTS audience_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_segment_id uuid REFERENCES audience_segments(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  similarity_score decimal(3,2),
  added_at timestamptz DEFAULT now(),
  UNIQUE(audience_segment_id, contact_id)
);

-- Create enrichment jobs table
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

-- Create audience-specific insights table
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

-- Create indexes
CREATE INDEX audience_segments_user_id_idx ON audience_segments(user_id);
CREATE INDEX audience_segments_updated_at_idx ON audience_segments(updated_at DESC);
CREATE INDEX audience_members_segment_id_idx ON audience_members(audience_segment_id);
CREATE INDEX audience_members_contact_id_idx ON audience_members(contact_id);
CREATE INDEX enrichment_jobs_user_id_idx ON enrichment_jobs(user_id);
CREATE INDEX enrichment_jobs_status_idx ON enrichment_jobs(status);
CREATE INDEX audience_insights_segment_id_idx ON audience_insights(audience_segment_id);
CREATE INDEX audience_insights_user_id_idx ON audience_insights(user_id);

-- Enable RLS
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own audience segments"
  ON audience_segments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can manage their own enrichment jobs"
  ON enrichment_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage insights for their audience segments"
  ON audience_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_audience_segments_updated_at BEFORE UPDATE ON audience_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER update_audience_contact_count_trigger
  AFTER INSERT OR DELETE ON audience_members
  FOR EACH ROW EXECUTE FUNCTION update_audience_contact_count();