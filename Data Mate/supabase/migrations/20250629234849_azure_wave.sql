/*
  # Fix Missing Database Columns

  1. Missing Columns
    - Add missing `updated_at` column to `comments` table
    - Add missing `user_id` column to `transcripts` table

  2. Data Safety
    - Handle existing data gracefully
    - Set appropriate defaults for new columns
    - Maintain referential integrity

  3. Performance
    - Add necessary indexes
    - Update triggers for timestamp management
*/

-- Fix comments table - add missing updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'updated_at'
  ) THEN
    -- Add the column with default value
    ALTER TABLE comments ADD COLUMN updated_at timestamptz DEFAULT now();
    
    -- Update existing records to set updated_at = created_at
    UPDATE comments SET updated_at = created_at WHERE updated_at IS NULL;
    
    -- Make the column NOT NULL after setting values
    ALTER TABLE comments ALTER COLUMN updated_at SET NOT NULL;
  END IF;
END $$;

-- Fix transcripts table - add missing user_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transcripts' AND column_name = 'user_id'
  ) THEN
    -- First, check if there are any existing records
    IF EXISTS (SELECT 1 FROM transcripts LIMIT 1) THEN
      -- If there are existing records, we need to handle them carefully
      -- Add column as nullable first
      ALTER TABLE transcripts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
      
      -- Try to populate user_id from related contact records
      UPDATE transcripts SET user_id = (
        SELECT contacts.user_id 
        FROM contacts 
        WHERE contacts.id = transcripts.contact_id
        LIMIT 1
      ) WHERE transcripts.contact_id IS NOT NULL AND transcripts.user_id IS NULL;
      
      -- For orphaned records without contact relationship, delete them
      DELETE FROM transcripts WHERE user_id IS NULL;
      
      -- Now make the column NOT NULL
      ALTER TABLE transcripts ALTER COLUMN user_id SET NOT NULL;
    ELSE
      -- No existing records, safe to add NOT NULL column directly
      ALTER TABLE transcripts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
    END IF;
  END IF;
END $$;

-- Ensure all necessary indexes exist
CREATE INDEX IF NOT EXISTS comments_updated_at_idx ON comments(updated_at DESC);
CREATE INDEX IF NOT EXISTS transcripts_user_id_idx ON transcripts(user_id);

-- Ensure RLS policies exist for the user_id column on transcripts
DROP POLICY IF EXISTS "Users can manage their own transcripts" ON transcripts;
CREATE POLICY "Users can manage their own transcripts"
  ON transcripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure the updated_at trigger exists for comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';