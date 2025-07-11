/*
  # Fix Missing Schema Elements for Influence Mate

  1. Schema Fixes
    - Create ai_insights table if it doesn't exist
    - Add updated_at column to comments table if it doesn't exist

  2. Data Integrity
    - Initialize updated_at values for existing comments records
    - Set up proper RLS policies and indexes
*/

-- Create ai_insights table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score decimal(3,2),
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add updated_at to comments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE comments ADD COLUMN updated_at timestamptz DEFAULT now();
    
    -- Initialize updated_at to match created_at for existing records
    UPDATE comments SET updated_at = created_at;
  END IF;
END $$;

-- Create indexes for ai_insights table
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_contact_id_idx ON ai_insights(contact_id);
CREATE INDEX IF NOT EXISTS ai_insights_updated_at_idx ON ai_insights(updated_at DESC);

-- Enable RLS on ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for ai_insights
CREATE POLICY IF NOT EXISTS "Users can manage their own ai_insights"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on ai_insights
DO $$ 
BEGIN
  -- First check if the function exists
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    -- Create the function if it doesn't exist
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  END IF;
  
  -- Create trigger for ai_insights if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_insights_updated_at'
  ) THEN
    CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  -- Create trigger for comments if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;