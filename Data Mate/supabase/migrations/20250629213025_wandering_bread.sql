/*
  # Transcript and Media Extensions

  1. Schema Updates
    - Add transcript-related columns to content_media
    - Add new transcript_extracts table for raw audio/caption data

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to access their own data
*/

-- Add transcript-related columns to content_media
ALTER TABLE content_media
  ADD COLUMN IF NOT EXISTS transcript_source TEXT,
  ADD COLUMN IF NOT EXISTS transcript_text TEXT,
  ADD COLUMN IF NOT EXISTS confidence_transcript NUMERIC(3,2);

-- Create transcript_extracts table to store raw extraction data
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

-- Create RLS policies
CREATE POLICY "Users can manage their own transcript extracts"
  ON transcript_extracts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_transcript_extracts_updated_at BEFORE UPDATE ON transcript_extracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add media-specific confidence scores to field_confidence_log if not already supported
DO $$
BEGIN
  -- Check if there are any transcript confidence scores in the field_confidence_log table
  IF NOT EXISTS (
    SELECT 1 FROM field_confidence_log
    WHERE field_name = 'transcript'
    LIMIT 1
  ) THEN
    -- Insert an example record to ensure the field is supported
    -- This will be immediately deleted, it's just to ensure the schema supports it
    INSERT INTO field_confidence_log (
      user_id,
      contact_id,
      field_name,
      confidence,
      calc_method
    ) 
    VALUES (
      (SELECT id FROM auth.users LIMIT 1),
      NULL,
      'transcript',
      0.0,
      'test'
    );
    
    -- Delete the test record
    DELETE FROM field_confidence_log 
    WHERE field_name = 'transcript' 
    AND calc_method = 'test';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- In case the field_confidence_log table doesn't exist yet
    NULL;
END $$;