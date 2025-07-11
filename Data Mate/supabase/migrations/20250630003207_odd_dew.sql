/*
  # Fix Missing user_id Column in Transcripts Table

  1. Critical Fix
    - Ensure user_id column exists in transcripts table
    - Add proper foreign key constraint to auth.users
    - Handle existing data safely
    - Update RLS policies

  2. Data Safety
    - Check for existing records before making changes
    - Preserve existing data where possible
    - Clean up orphaned records if necessary

  3. Security
    - Ensure RLS is properly configured
    - Update policies to use user_id column
*/

-- First, check if the transcripts table exists at all
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Now handle the user_id column addition
DO $$
DECLARE
  has_user_id boolean;
  record_count integer;
BEGIN
  -- Check if user_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transcripts' AND column_name = 'user_id'
  ) INTO has_user_id;
  
  -- If user_id column doesn't exist, add it
  IF NOT has_user_id THEN
    -- Count existing records
    SELECT COUNT(*) INTO record_count FROM transcripts;
    
    IF record_count > 0 THEN
      -- There are existing records, handle them carefully
      RAISE NOTICE 'Found % existing transcript records, handling migration carefully', record_count;
      
      -- Add column as nullable first
      ALTER TABLE transcripts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      
      -- Try to populate user_id from related contact records
      UPDATE transcripts SET user_id = (
        SELECT contacts.user_id 
        FROM contacts 
        WHERE contacts.id = transcripts.contact_id
        LIMIT 1
      ) WHERE transcripts.contact_id IS NOT NULL AND transcripts.user_id IS NULL;
      
      -- For records still without user_id, try to get the first available user
      -- This is a fallback for orphaned records
      UPDATE transcripts SET user_id = (
        SELECT id FROM auth.users LIMIT 1
      ) WHERE transcripts.user_id IS NULL;
      
      -- If there are still NULL user_id records (no users exist), delete them
      DELETE FROM transcripts WHERE user_id IS NULL;
      
      -- Now make the column NOT NULL
      ALTER TABLE transcripts ALTER COLUMN user_id SET NOT NULL;
      
    ELSE
      -- No existing records, safe to add NOT NULL column directly
      ALTER TABLE transcripts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
    END IF;
    
    RAISE NOTICE 'Successfully added user_id column to transcripts table';
  ELSE
    RAISE NOTICE 'user_id column already exists in transcripts table';
  END IF;
END $$;

-- Ensure the updated_at column exists as well
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transcripts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE transcripts ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column to transcripts table';
  END IF;
END $$;

-- Create necessary indexes if they don't exist
CREATE INDEX IF NOT EXISTS transcripts_user_id_idx ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS transcripts_contact_id_idx ON transcripts(contact_id);
CREATE INDEX IF NOT EXISTS transcripts_updated_at_idx ON transcripts(updated_at DESC);

-- Enable RLS if not already enabled
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the RLS policy to ensure it uses user_id
DROP POLICY IF EXISTS "Users can manage their own transcripts" ON transcripts;
CREATE POLICY "Users can manage their own transcripts"
  ON transcripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure the update trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger for updated_at
DROP TRIGGER IF EXISTS update_transcripts_updated_at ON transcripts;
CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Final verification
DO $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transcripts' AND column_name = 'user_id'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'SUCCESS: user_id column exists in transcripts table';
  ELSE
    RAISE EXCEPTION 'FAILED: user_id column still missing from transcripts table';
  END IF;
END $$;