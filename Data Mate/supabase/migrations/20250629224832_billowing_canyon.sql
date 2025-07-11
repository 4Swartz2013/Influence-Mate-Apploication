/*
  # Twitter Harvester Schema Support
  
  1. Add Twitter-specific fields to content_media
    - Support for Spaces and videos with captions
    - Ensure all transcript fields exist
    
  2. Ensure transcript_extracts table exists
    - For storing raw transcript data and confidence scores
*/

-- Make sure transcript columns exist on content_media
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_media' AND column_name = 'transcript_text'
  ) THEN
    ALTER TABLE content_media ADD COLUMN transcript_text text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_media' AND column_name = 'transcript_source'
  ) THEN
    ALTER TABLE content_media ADD COLUMN transcript_source text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_media' AND column_name = 'confidence_transcript'
  ) THEN
    ALTER TABLE content_media ADD COLUMN confidence_transcript numeric(3,2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_media' AND column_name = 'alt_text'
  ) THEN
    ALTER TABLE content_media ADD COLUMN alt_text text;
  END IF;
END $$;

-- Create transcript_extracts table if it doesn't exist
CREATE TABLE IF NOT EXISTS transcript_extracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id uuid REFERENCES content_media(id) ON DELETE CASCADE NOT NULL,
  extract_type TEXT NOT NULL, -- 'caption', 'whisper', 'api', etc.
  content TEXT NOT NULL,
  source_url TEXT,
  raw_data JSONB DEFAULT '{}',
  confidence_score NUMERIC(3,2),
  language_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure integrations table exists
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- 'twitter', 'instagram', 'tiktok', etc.
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  platform_user_id text,
  platform_username text,
  scope text[],
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create indexes for transcript_extracts table
CREATE INDEX IF NOT EXISTS transcript_extracts_user_id_idx ON transcript_extracts(user_id);
CREATE INDEX IF NOT EXISTS transcript_extracts_media_id_idx ON transcript_extracts(media_id);
CREATE INDEX IF NOT EXISTS content_media_transcript_source_idx ON content_media(transcript_source);
CREATE INDEX IF NOT EXISTS integrations_user_id_platform_idx ON integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS integrations_platform_user_id_idx ON integrations(platform_user_id);

-- Enable RLS on new tables
ALTER TABLE transcript_extracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transcript_extracts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE tablename = 'transcript_extracts' AND policyname = 'Users can manage their own transcript extracts'
  ) THEN
    CREATE POLICY "Users can manage their own transcript extracts"
      ON transcript_extracts
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create RLS policies for integrations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE tablename = 'integrations' AND policyname = 'Users can manage their own integrations'
  ) THEN
    CREATE POLICY "Users can manage their own integrations"
      ON integrations
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create updated_at triggers if needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_transcript_extracts_updated_at'
  ) THEN
    CREATE TRIGGER update_transcript_extracts_updated_at BEFORE UPDATE ON transcript_extracts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_integrations_updated_at'
  ) THEN
    CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;