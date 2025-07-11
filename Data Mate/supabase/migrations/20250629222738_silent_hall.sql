/*
  # TikTok Harvester Schema Extension

  1. Add any needed tables for TikTok harvesting
  2. Add integration table updates for storing TikTok API tokens
  3. Allow transcript fields to store TikTok captions
*/

-- If the integrations table doesn't exist yet, create it
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- 'instagram', 'tiktok', etc.
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

-- Make sure we have indexes
CREATE INDEX IF NOT EXISTS integrations_user_id_platform_idx ON integrations(user_id, platform);
CREATE INDEX IF NOT EXISTS integrations_platform_user_id_idx ON integrations(platform_user_id);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create updated_at trigger
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_integrations_updated_at'
  ) THEN
    CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Make sure transcript columns exist
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

-- Create indexes
CREATE INDEX IF NOT EXISTS transcript_extracts_user_id_idx ON transcript_extracts(user_id);
CREATE INDEX IF NOT EXISTS transcript_extracts_media_id_idx ON transcript_extracts(media_id);
CREATE INDEX IF NOT EXISTS content_media_transcript_idx ON content_media(transcript_source);

-- Enable RLS
ALTER TABLE transcript_extracts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
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

-- Create trigger for updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_transcript_extracts_updated_at'
  ) THEN
    CREATE TRIGGER update_transcript_extracts_updated_at BEFORE UPDATE ON transcript_extracts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;