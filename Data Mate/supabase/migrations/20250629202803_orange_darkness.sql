/*
  # Data Provenance System

  1. New Tables
    - `data_provenance` - Per-field change history with source tracking
    - `job_errors` - Detailed error logs for failed enrichment jobs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create data provenance table for field-level tracking
CREATE TABLE IF NOT EXISTS data_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  source_type text NOT NULL, -- 'scraper', 'upload', 'api', 'manual', 'sync'
  source_detail jsonb DEFAULT '{}', -- { url, selector, scraper_id, job_id }
  enrichment_job_id uuid REFERENCES enrichment_jobs(id) ON DELETE SET NULL,
  confidence_before numeric(3,2),
  confidence_after numeric(3,2),
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create job errors table for detailed error tracking
CREATE TABLE IF NOT EXISTS job_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrichment_job_id uuid REFERENCES enrichment_jobs(id) ON DELETE CASCADE NOT NULL,
  error_type text NOT NULL, -- 'network', 'parsing', 'validation', 'api_limit'
  error_code text,
  error_message text NOT NULL,
  stack_trace text,
  retry_count integer DEFAULT 0,
  context jsonb DEFAULT '{}',
  occurred_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS data_provenance_user_id_idx ON data_provenance(user_id);
CREATE INDEX IF NOT EXISTS data_provenance_contact_id_idx ON data_provenance(contact_id);
CREATE INDEX IF NOT EXISTS data_provenance_field_name_idx ON data_provenance(field_name);
CREATE INDEX IF NOT EXISTS data_provenance_detected_at_idx ON data_provenance(detected_at DESC);
CREATE INDEX IF NOT EXISTS data_provenance_job_id_idx ON data_provenance(enrichment_job_id);
CREATE INDEX IF NOT EXISTS job_errors_user_id_idx ON job_errors(user_id);
CREATE INDEX IF NOT EXISTS job_errors_job_id_idx ON job_errors(enrichment_job_id);
CREATE INDEX IF NOT EXISTS job_errors_occurred_at_idx ON job_errors(occurred_at DESC);

-- Enable RLS
ALTER TABLE data_provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_errors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data provenance"
  ON data_provenance
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own job errors"
  ON job_errors
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create provenance records when contacts are updated
CREATE OR REPLACE FUNCTION track_contact_field_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_name text;
  old_val text;
  new_val text;
  conf_before numeric(3,2);
  conf_after numeric(3,2);
BEGIN
  -- Only process if this is an update
  IF TG_OP = 'UPDATE' THEN
    -- Check each trackable field for changes
    FOR field_name, old_val, new_val IN
      SELECT 
        'name', OLD.name, NEW.name WHERE OLD.name IS DISTINCT FROM NEW.name
      UNION ALL
      SELECT 
        'email', OLD.email, NEW.email WHERE OLD.email IS DISTINCT FROM NEW.email
      UNION ALL
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
        'phone', OLD.phone, NEW.phone WHERE OLD.phone IS DISTINCT FROM NEW.phone
      UNION ALL
      SELECT 
        'platform', OLD.platform, NEW.platform WHERE OLD.platform IS DISTINCT FROM NEW.platform
    LOOP
      -- Get confidence scores from metadata
      conf_before := COALESCE(
        (OLD.metadata->>'confidence_scores'->field_name)::numeric(3,2), 
        0.5
      );
      conf_after := COALESCE(
        (NEW.metadata->>'confidence_scores'->field_name)::numeric(3,2), 
        conf_before
      );
      
      -- Insert provenance record
      INSERT INTO data_provenance (
        user_id,
        contact_id,
        field_name,
        old_value,
        new_value,
        source_type,
        source_detail,
        confidence_before,
        confidence_after,
        detected_at
      ) VALUES (
        NEW.user_id,
        NEW.id,
        field_name,
        old_val,
        new_val,
        COALESCE(NEW.metadata->>'last_update_source', 'manual'),
        COALESCE(NEW.metadata->'source_detail', '{}'),
        conf_before,
        conf_after,
        now()
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to track contact changes
DROP TRIGGER IF EXISTS track_contact_field_changes_trigger ON contacts;
CREATE TRIGGER track_contact_field_changes_trigger
  AFTER UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION track_contact_field_changes();

-- Function to create provenance when enrichment job completes
CREATE OR REPLACE FUNCTION create_enrichment_provenance()
RETURNS TRIGGER AS $$
DECLARE
  job_params jsonb;
  contact_ids text[];
  contact_id_item text;
BEGIN
  -- Only process when job is completed successfully
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    job_params := NEW.parameters;
    
    -- Extract contact IDs from job parameters
    IF job_params ? 'contact_ids' THEN
      contact_ids := ARRAY(SELECT jsonb_array_elements_text(job_params->'contact_ids'));
    ELSIF NEW.target_table = 'contacts' AND NEW.target_id IS NOT NULL THEN
      contact_ids := ARRAY[NEW.target_id::text];
    END IF;
    
    -- Create provenance records for enriched fields
    IF array_length(contact_ids, 1) > 0 THEN
      FOREACH contact_id_item IN ARRAY contact_ids
      LOOP
        -- Create a general enrichment provenance record
        INSERT INTO data_provenance (
          user_id,
          contact_id,
          field_name,
          old_value,
          new_value,
          source_type,
          source_detail,
          enrichment_job_id,
          confidence_before,
          confidence_after,
          detected_at
        ) VALUES (
          NEW.user_id,
          contact_id_item::uuid,
          'enrichment_completed',
          'pending',
          'completed',
          'enrichment_job',
          jsonb_build_object(
            'job_type', NEW.job_type,
            'job_id', NEW.id,
            'parameters', NEW.parameters,
            'results', NEW.results
          ),
          NEW.id,
          0.5,
          0.8,
          NEW.completed_at
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for enrichment job completion
DROP TRIGGER IF EXISTS create_enrichment_provenance_trigger ON enrichment_jobs;
CREATE TRIGGER create_enrichment_provenance_trigger
  AFTER UPDATE ON enrichment_jobs
  FOR EACH ROW EXECUTE FUNCTION create_enrichment_provenance();