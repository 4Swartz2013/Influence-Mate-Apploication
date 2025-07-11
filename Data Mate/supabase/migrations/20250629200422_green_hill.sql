/*
  # Data Transformer Tables

  1. New Tables
    - `raw_contact_data` - Stores original unprocessed contact data
    - `field_mapping_logs` - Logs field mappings for ML learning

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Raw contact data table
CREATE TABLE IF NOT EXISTS raw_contact_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  external_source text NOT NULL,
  raw_data jsonb NOT NULL,
  field_mappings jsonb DEFAULT '{}',
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Field mapping logs table
CREATE TABLE IF NOT EXISTS field_mapping_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  external_source text NOT NULL,
  field_mappings jsonb NOT NULL,
  confidence_scores jsonb DEFAULT '{}',
  raw_field_names text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS raw_contact_data_user_id_idx ON raw_contact_data(user_id);
CREATE INDEX IF NOT EXISTS raw_contact_data_source_idx ON raw_contact_data(external_source);
CREATE INDEX IF NOT EXISTS raw_contact_data_created_at_idx ON raw_contact_data(created_at DESC);
CREATE INDEX IF NOT EXISTS field_mapping_logs_user_id_idx ON field_mapping_logs(user_id);
CREATE INDEX IF NOT EXISTS field_mapping_logs_contact_id_idx ON field_mapping_logs(contact_id);
CREATE INDEX IF NOT EXISTS field_mapping_logs_source_idx ON field_mapping_logs(external_source);

-- Enable RLS
ALTER TABLE raw_contact_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_mapping_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own raw contact data"
  ON raw_contact_data
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own field mapping logs"
  ON field_mapping_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add phone column to contacts table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'phone'
  ) THEN
    ALTER TABLE contacts ADD COLUMN phone text;
  END IF;
END $$;