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

-- Add a trigger function to automatically create contacts from messages
CREATE OR REPLACE FUNCTION create_contact_from_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a contact if we have a sender name and either email or handle
  IF NEW.sender_name IS NOT NULL AND (NEW.sender_email IS NOT NULL OR NEW.sender_handle IS NOT NULL) THEN
    -- Check if contact already exists
    IF NOT EXISTS (
      SELECT 1 FROM contacts 
      WHERE user_id = NEW.user_id 
      AND (
        (NEW.sender_email IS NOT NULL AND email = NEW.sender_email) OR
        (NEW.sender_handle IS NOT NULL AND handle = NEW.sender_handle)
      )
    ) THEN
      -- Insert new contact
      INSERT INTO contacts (
        user_id,
        full_name,
        email,
        handle,
        platform,
        source,
        last_interaction,
        interaction_count
      ) VALUES (
        NEW.user_id,
        NEW.sender_name,
        NEW.sender_email,
        NEW.sender_handle,
        NEW.platform,
        'message',
        NEW.timestamp,
        1
      )
      RETURNING id INTO NEW.contact_id;
    ELSE
      -- Get existing contact ID
      SELECT id INTO NEW.contact_id
      FROM contacts
      WHERE user_id = NEW.user_id 
      AND (
        (NEW.sender_email IS NOT NULL AND email = NEW.sender_email) OR
        (NEW.sender_handle IS NOT NULL AND handle = NEW.sender_handle)
      )
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger function to automatically create contacts from comments
CREATE OR REPLACE FUNCTION create_contact_from_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a contact if we have an author name and handle
  IF NEW.author_name IS NOT NULL AND NEW.author_handle IS NOT NULL THEN
    -- Check if contact already exists
    IF NOT EXISTS (
      SELECT 1 FROM contacts 
      WHERE user_id = NEW.user_id 
      AND handle = NEW.author_handle
    ) THEN
      -- Insert new contact
      INSERT INTO contacts (
        user_id,
        full_name,
        handle,
        platform,
        profile_image,
        source,
        last_interaction,
        interaction_count
      ) VALUES (
        NEW.user_id,
        NEW.author_name,
        NEW.author_handle,
        NEW.platform,
        NEW.author_avatar,
        'comment',
        NEW.timestamp,
        1
      )
      RETURNING id INTO NEW.contact_id;
    ELSE
      -- Get existing contact ID
      SELECT id INTO NEW.contact_id
      FROM contacts
      WHERE user_id = NEW.user_id 
      AND handle = NEW.author_handle
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic contact creation
DROP TRIGGER IF EXISTS create_contact_from_message_trigger ON messages;
CREATE TRIGGER create_contact_from_message_trigger
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION create_contact_from_message();

DROP TRIGGER IF EXISTS create_contact_from_comment_trigger ON comments;
CREATE TRIGGER create_contact_from_comment_trigger
BEFORE INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_contact_from_comment();