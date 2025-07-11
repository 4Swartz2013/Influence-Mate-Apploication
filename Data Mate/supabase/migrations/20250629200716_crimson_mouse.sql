/*
  # Auto-Sync & Re-Enrichment System

  1. New Tables
    - `sync_change_log` - Tracks field-level changes for re-enrichment
    - `sync_jobs` - Manages sync execution schedules and status
    - `field_enrichment_history` - Tracks enrichment history per field

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create sync change log table
CREATE TABLE IF NOT EXISTS sync_change_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  confidence_before decimal(3,2),
  confidence_after decimal(3,2),
  change_source text NOT NULL, -- 'scrape', 'import', 'webhook', 'manual'
  sync_status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  enrichment_job_id uuid REFERENCES enrichment_jobs(id) ON DELETE SET NULL,
  detected_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create sync jobs table for managing sync schedules
CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_name text NOT NULL,
  sync_type text NOT NULL, -- 'cron', 'event_triggered', 'manual'
  schedule_expression text, -- cron expression for scheduled jobs
  last_run_at timestamptz,
  next_run_at timestamptz,
  status text DEFAULT 'active', -- 'active', 'paused', 'disabled'
  config jsonb DEFAULT '{}',
  stats jsonb DEFAULT '{}', -- success/failure counts, avg duration, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create field enrichment history table
CREATE TABLE IF NOT EXISTS field_enrichment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  field_name text NOT NULL,
  enrichment_method text NOT NULL,
  confidence_score decimal(3,2),
  data_source text,
  enriched_value text,
  enrichment_job_id uuid REFERENCES enrichment_jobs(id) ON DELETE SET NULL,
  enriched_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS sync_change_log_user_id_idx ON sync_change_log(user_id);
CREATE INDEX IF NOT EXISTS sync_change_log_contact_id_idx ON sync_change_log(contact_id);
CREATE INDEX IF NOT EXISTS sync_change_log_status_idx ON sync_change_log(sync_status);
CREATE INDEX IF NOT EXISTS sync_change_log_detected_at_idx ON sync_change_log(detected_at DESC);
CREATE INDEX IF NOT EXISTS sync_jobs_user_id_idx ON sync_jobs(user_id);
CREATE INDEX IF NOT EXISTS sync_jobs_next_run_idx ON sync_jobs(next_run_at);
CREATE INDEX IF NOT EXISTS field_enrichment_history_contact_id_idx ON field_enrichment_history(contact_id);
CREATE INDEX IF NOT EXISTS field_enrichment_history_field_name_idx ON field_enrichment_history(field_name);

-- Enable RLS
ALTER TABLE sync_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_enrichment_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own sync change logs"
  ON sync_change_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync jobs"
  ON sync_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own field enrichment history"
  ON field_enrichment_history
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add sync status fields to contacts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'last_sync_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN last_sync_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'sync_status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN sync_status text DEFAULT 'synced';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'outdated_fields'
  ) THEN
    ALTER TABLE contacts ADD COLUMN outdated_fields text[] DEFAULT '{}';
  END IF;
END $$;

-- Create triggers for updated_at
CREATE TRIGGER update_sync_jobs_updated_at BEFORE UPDATE ON sync_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to detect field changes and create sync logs
CREATE OR REPLACE FUNCTION detect_contact_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_name text;
  old_val text;
  new_val text;
  conf_score decimal(3,2);
BEGIN
  -- Only process if this is an update
  IF TG_OP = 'UPDATE' THEN
    -- Check each syncable field for changes
    FOR field_name, old_val, new_val IN
      SELECT 
        'username', OLD.username, NEW.username WHERE OLD.username IS DISTINCT FROM NEW.username
      UNION ALL
      SELECT 
        'bio', OLD.bio, NEW.bio WHERE OLD.bio IS DISTINCT FROM NEW.bio
      UNION ALL
      SELECT 
        'location', OLD.location, NEW.location WHERE OLD.location IS DISTINCT FROM NEW.location
      UNION ALL
      SELECT 
        'email', OLD.email, NEW.email WHERE OLD.email IS DISTINCT FROM NEW.email
      UNION ALL
      SELECT 
        'name', OLD.name, NEW.name WHERE OLD.name IS DISTINCT FROM NEW.name
    LOOP
      -- Get confidence score from metadata
      conf_score := COALESCE(
        (OLD.metadata->>'confidence_scores'->field_name)::decimal(3,2), 
        0.5
      );
      
      -- Insert change log entry
      INSERT INTO sync_change_log (
        user_id,
        contact_id,
        field_name,
        old_value,
        new_value,
        confidence_before,
        change_source,
        sync_status
      ) VALUES (
        NEW.user_id,
        NEW.id,
        field_name,
        old_val,
        new_val,
        conf_score,
        COALESCE(NEW.metadata->>'last_update_source', 'manual'),
        'pending'
      );
      
      -- Mark contact as needing sync
      NEW.sync_status := 'outdated';
      NEW.outdated_fields := array_append(
        COALESCE(NEW.outdated_fields, '{}'), 
        field_name
      );
    END LOOP;
    
    -- Update last_sync_at if any changes detected
    IF array_length(NEW.outdated_fields, 1) > 0 THEN
      NEW.last_sync_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to detect contact changes
CREATE TRIGGER detect_contact_changes_trigger
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION detect_contact_changes();