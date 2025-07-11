/*
  # Add source column to contacts table
  
  1. New Columns
    - `source` - Tracks where the contact came from (manual, import, auto-generated, comment, message)
  
  2. Changes
    - Add source column to contacts table with default value 'manual'
    - Add index on source column for faster filtering
*/

-- Add source column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'source'
  ) THEN
    ALTER TABLE contacts ADD COLUMN source text DEFAULT 'manual';
  END IF;
END $$;

-- Create index on source column
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);

-- Update existing contacts that came from comments
UPDATE contacts
SET source = 'comment'
WHERE id IN (
  SELECT DISTINCT contact_id 
  FROM comments 
  WHERE contact_id IS NOT NULL
);

-- Update existing contacts that came from messages
UPDATE contacts
SET source = 'message'
WHERE id IN (
  SELECT DISTINCT contact_id 
  FROM messages 
  WHERE contact_id IS NOT NULL
) AND source = 'manual';