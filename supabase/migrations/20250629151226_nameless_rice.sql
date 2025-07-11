-- Add is_archived and is_flagged columns to comments table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE comments ADD COLUMN is_archived boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'is_flagged'
  ) THEN
    ALTER TABLE comments ADD COLUMN is_flagged boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_comments_is_archived ON comments(is_archived);
CREATE INDEX IF NOT EXISTS idx_comments_is_flagged ON comments(is_flagged);

-- Create index for workflow_id and workflow_triggered
CREATE INDEX IF NOT EXISTS idx_comments_workflow ON comments(workflow_triggered, workflow_id);
CREATE INDEX IF NOT EXISTS idx_messages_workflow ON messages(metadata) WHERE metadata ? 'workflow_id';

-- Create index for bulk operations
CREATE INDEX IF NOT EXISTS idx_messages_status_platform ON messages(status, platform);
CREATE INDEX IF NOT EXISTS idx_comments_replied_platform ON comments(replied, platform);