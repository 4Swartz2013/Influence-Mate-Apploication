/*
  # Confidence Score System

  1. Schema Updates
    - Add per-field confidence columns to contacts table
    - Create field_confidence_log table to track history

  2. Functions
    - Add function to flag low-confidence records
    - Add trigger to notify on low confidence
*/

-- Add per-field confidence columns to contacts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'confidence_email'
  ) THEN
    ALTER TABLE contacts
      ADD COLUMN confidence_email     NUMERIC DEFAULT 0,
      ADD COLUMN confidence_location  NUMERIC DEFAULT 0,
      ADD COLUMN confidence_bio       NUMERIC DEFAULT 0,
      ADD COLUMN confidence_phone     NUMERIC DEFAULT 0,
      ADD COLUMN confidence_username  NUMERIC DEFAULT 0,
      ADD COLUMN confidence_name      NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Create field confidence log table
CREATE TABLE IF NOT EXISTS field_confidence_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        UUID REFERENCES contacts(id) ON DELETE CASCADE,
  field_name        TEXT NOT NULL,                 -- 'email', 'location', etc.
  confidence        NUMERIC NOT NULL,
  calc_method       TEXT NOT NULL,                 -- 'regex', 'mx_check', 'geo_validation', ...
  created_at        TIMESTAMP DEFAULT now(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS field_confidence_log_contact_id_idx ON field_confidence_log(contact_id);
CREATE INDEX IF NOT EXISTS field_confidence_log_user_id_idx ON field_confidence_log(user_id);
CREATE INDEX IF NOT EXISTS field_confidence_log_created_at_idx ON field_confidence_log(created_at DESC);
CREATE INDEX IF NOT EXISTS field_confidence_log_field_name_idx ON field_confidence_log(field_name);

-- Enable RLS
ALTER TABLE field_confidence_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own field confidence logs"
  ON field_confidence_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to notify on low confidence
CREATE OR REPLACE FUNCTION flag_low_confidence() RETURNS TRIGGER AS $$
BEGIN
  -- Check if any critical field has low confidence
  IF NEW.confidence_email < 0.5
     OR NEW.confidence_location < 0.4
     OR NEW.confidence_name < 0.6
     OR NEW.confidence_phone < 0.5
     OR NEW.contact_score < 0.5 THEN
    
    -- Send notification via pg_notify
    PERFORM pg_notify('confidence_low', json_build_object(
      'contact_id', NEW.id,
      'user_id', NEW.user_id,
      'contact_score', NEW.contact_score,
      'email_score', NEW.confidence_email,
      'location_score', NEW.confidence_location,
      'name_score', NEW.confidence_name,
      'phone_score', NEW.confidence_phone
    )::text);
    
    -- Queue re-enrichment job if not already queued
    IF NOT EXISTS (
      SELECT 1 FROM enrichment_jobs 
      WHERE target_id = NEW.id 
        AND target_table = 'contacts' 
        AND job_type = 'confidence_reenrichment'
        AND status IN ('pending', 'processing')
    ) THEN
      INSERT INTO enrichment_jobs (
        user_id,
        job_type,
        status,
        target_table,
        target_id,
        parameters,
        progress
      ) VALUES (
        NEW.user_id,
        'confidence_reenrichment',
        'pending',
        'contacts',
        NEW.id,
        json_build_object(
          'trigger', 'low_confidence_auto',
          'fields', array_remove(ARRAY[
            CASE WHEN NEW.confidence_email < 0.5 THEN 'email' ELSE NULL END,
            CASE WHEN NEW.confidence_location < 0.4 THEN 'location' ELSE NULL END,
            CASE WHEN NEW.confidence_name < 0.6 THEN 'name' ELSE NULL END,
            CASE WHEN NEW.confidence_phone < 0.5 THEN 'phone' ELSE NULL END
          ], NULL),
          'current_scores', json_build_object(
            'email', NEW.confidence_email,
            'location', NEW.confidence_location,
            'name', NEW.confidence_name,
            'phone', NEW.confidence_phone,
            'overall', NEW.contact_score
          )
        ),
        0
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new or updated contacts
DROP TRIGGER IF EXISTS trg_confidence_notify ON contacts;
CREATE TRIGGER trg_confidence_notify
AFTER INSERT OR UPDATE ON contacts
FOR EACH ROW EXECUTE PROCEDURE flag_low_confidence();

-- Add function to recalculate overall confidence score
CREATE OR REPLACE FUNCTION calculate_overall_confidence() RETURNS TRIGGER AS $$
DECLARE
  email_weight NUMERIC := 0.25;
  location_weight NUMERIC := 0.15;
  bio_weight NUMERIC := 0.15;
  phone_weight NUMERIC := 0.15;
  name_weight NUMERIC := 0.20;
  username_weight NUMERIC := 0.10;
  
  total_weight NUMERIC := 0;
  weighted_sum NUMERIC := 0;
BEGIN
  -- Add up weighted confidence scores for available fields
  IF NEW.confidence_email IS NOT NULL AND NEW.confidence_email > 0 THEN
    weighted_sum := weighted_sum + (NEW.confidence_email * email_weight);
    total_weight := total_weight + email_weight;
  END IF;
  
  IF NEW.confidence_location IS NOT NULL AND NEW.confidence_location > 0 THEN
    weighted_sum := weighted_sum + (NEW.confidence_location * location_weight);
    total_weight := total_weight + location_weight;
  END IF;
  
  IF NEW.confidence_bio IS NOT NULL AND NEW.confidence_bio > 0 THEN
    weighted_sum := weighted_sum + (NEW.confidence_bio * bio_weight);
    total_weight := total_weight + bio_weight;
  END IF;
  
  IF NEW.confidence_phone IS NOT NULL AND NEW.confidence_phone > 0 THEN
    weighted_sum := weighted_sum + (NEW.confidence_phone * phone_weight);
    total_weight := total_weight + phone_weight;
  END IF;
  
  IF NEW.confidence_name IS NOT NULL AND NEW.confidence_name > 0 THEN
    weighted_sum := weighted_sum + (NEW.confidence_name * name_weight);
    total_weight := total_weight + name_weight;
  END IF;
  
  IF NEW.confidence_username IS NOT NULL AND NEW.confidence_username > 0 THEN
    weighted_sum := weighted_sum + (NEW.confidence_username * username_weight);
    total_weight := total_weight + username_weight;
  END IF;
  
  -- Calculate overall score if we have any weights
  IF total_weight > 0 THEN
    NEW.contact_score := weighted_sum / total_weight;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update contact_score
DROP TRIGGER IF EXISTS trg_calculate_overall_confidence ON contacts;
CREATE TRIGGER trg_calculate_overall_confidence
BEFORE INSERT OR UPDATE ON contacts
FOR EACH ROW EXECUTE PROCEDURE calculate_overall_confidence();