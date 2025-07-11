/*
  # Data Provenance RPC Functions
  
  1. New Functions
    - get_fields_with_changes - Returns the fields that have change history with counts
    - get_field_provenance - Gets provenance for a specific field
    - get_source_chain - Builds the complete source chain for a data point
    
  2. Functionality
    - Provide backend support for the Data Provenance Viewer UI
    - Optimize queries by aggregating and processing data server-side
*/

-- Function to get fields that have provenance records with counts
CREATE OR REPLACE FUNCTION get_fields_with_changes(
  p_contact_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  name TEXT,
  count BIGINT,
  lastUpdated TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    field_name AS name,
    COUNT(*) AS count,
    MAX(detected_at) AS lastUpdated
  FROM 
    data_provenance
  WHERE 
    contact_id = p_contact_id AND
    user_id = p_user_id
  GROUP BY 
    field_name
  ORDER BY 
    lastUpdated DESC;
END;
$$;

-- Function to get provenance for a specific field
CREATE OR REPLACE FUNCTION get_field_provenance(
  p_contact_id UUID,
  p_field_name TEXT,
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  old_value TEXT,
  new_value TEXT,
  source_type TEXT,
  source_detail JSONB,
  confidence_before NUMERIC,
  confidence_after NUMERIC,
  detected_at TIMESTAMPTZ,
  job_id UUID,
  job_type TEXT,
  job_status TEXT,
  error_count BIGINT,
  last_error TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.old_value,
    dp.new_value,
    dp.source_type,
    dp.source_detail,
    dp.confidence_before,
    dp.confidence_after,
    dp.detected_at,
    ej.id AS job_id,
    ej.job_type,
    ej.status AS job_status,
    COUNT(je.id) AS error_count,
    MAX(je.error_message) AS last_error
  FROM 
    data_provenance dp
    LEFT JOIN enrichment_jobs ej ON dp.enrichment_job_id = ej.id
    LEFT JOIN job_errors je ON ej.id = je.enrichment_job_id
  WHERE 
    dp.contact_id = p_contact_id AND
    dp.field_name = p_field_name AND
    dp.user_id = p_user_id
  GROUP BY
    dp.id, dp.old_value, dp.new_value, dp.source_type, dp.source_detail,
    dp.confidence_before, dp.confidence_after, dp.detected_at,
    ej.id, ej.job_type, ej.status
  ORDER BY 
    dp.detected_at DESC
  LIMIT 
    p_limit;
END;
$$;

-- Function to build the complete source chain for a data point
CREATE OR REPLACE FUNCTION get_source_chain(
  p_provenance_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  step_id UUID,
  step_type TEXT,
  step_label TEXT,
  description TEXT,
  timestamp TIMESTAMPTZ,
  data JSONB,
  status TEXT,
  confidence NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_contact_id UUID;
  v_field_name TEXT;
  v_enrichment_job_id UUID;
  v_detected_at TIMESTAMPTZ;
BEGIN
  -- Get the starting provenance record information
  SELECT 
    contact_id, field_name, enrichment_job_id, detected_at
  INTO 
    v_contact_id, v_field_name, v_enrichment_job_id, v_detected_at
  FROM 
    data_provenance
  WHERE 
    id = p_provenance_id AND
    user_id = p_user_id;
  
  -- Return if record not found
  IF v_contact_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Start with the current provenance record
  RETURN QUERY
  SELECT 
    dp.id AS step_id,
    dp.source_type AS step_type,
    CASE 
      WHEN dp.source_type = 'scraper' THEN 'Web Scraper'
      WHEN dp.source_type = 'upload' THEN 'CSV Upload'
      WHEN dp.source_type = 'api' THEN 'API Integration'
      WHEN dp.source_type = 'manual' THEN 'Manual Entry'
      WHEN dp.source_type = 'enrichment_job' THEN 'AI Enrichment'
      WHEN dp.source_type = 'sync' THEN 'Auto-Sync'
      ELSE dp.source_type
    END AS step_label,
    'Field value changed from "' || COALESCE(dp.old_value, '(empty)') || 
    '" to "' || COALESCE(dp.new_value, '(empty)') || '"' AS description,
    dp.detected_at AS timestamp,
    dp.source_detail AS data,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM job_errors je 
        WHERE je.enrichment_job_id = dp.enrichment_job_id
      ) THEN 'error'
      ELSE 'success'
    END AS status,
    dp.confidence_after AS confidence
  FROM 
    data_provenance dp
  WHERE 
    dp.id = p_provenance_id AND
    dp.user_id = p_user_id;

  -- Add enrichment job if it exists
  IF v_enrichment_job_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ej.id AS step_id,
      'enrichment_job' AS step_type,
      'Enrichment Process' AS step_label,
      ej.job_type || ' job' AS description,
      ej.created_at AS timestamp,
      ej.parameters AS data,
      ej.status AS status,
      NULL::NUMERIC AS confidence
    FROM 
      enrichment_jobs ej
    WHERE 
      ej.id = v_enrichment_job_id AND
      ej.user_id = p_user_id;
      
    -- Add any job errors
    RETURN QUERY
    SELECT 
      je.id AS step_id,
      'error' AS step_type,
      'Error Detected' AS step_label,
      je.error_message AS description,
      je.occurred_at AS timestamp,
      jsonb_build_object(
        'error_type', je.error_type,
        'error_code', je.error_code,
        'retry_count', je.retry_count
      ) AS data,
      'error' AS status,
      NULL::NUMERIC AS confidence
    FROM 
      job_errors je
    WHERE 
      je.enrichment_job_id = v_enrichment_job_id AND
      je.user_id = p_user_id
    ORDER BY
      je.occurred_at DESC
    LIMIT 1;
  END IF;
  
  -- Add prior value if it exists
  RETURN QUERY
  SELECT 
    dp.id AS step_id,
    'previous_value' AS step_type,
    'Previous Value' AS step_label,
    'Original value: "' || COALESCE(dp.new_value, '(empty)') || '"' AS description,
    dp.detected_at AS timestamp,
    jsonb_build_object('previous_confidence', dp.confidence_after) AS data,
    'success' AS status,
    dp.confidence_after AS confidence
  FROM 
    data_provenance dp
  WHERE 
    dp.contact_id = v_contact_id AND
    dp.field_name = v_field_name AND
    dp.user_id = p_user_id AND
    dp.detected_at < v_detected_at
  ORDER BY 
    dp.detected_at DESC
  LIMIT 1;
  
  -- Add initial creation if appropriate
  IF v_field_name = 'name' THEN
    RETURN QUERY
    SELECT 
      c.id AS step_id,
      'creation' AS step_type,
      'Contact Created' AS step_label,
      'Initial contact record created' AS description,
      c.created_at AS timestamp,
      '{}'::jsonb AS data,
      'success' AS status,
      NULL::NUMERIC AS confidence
    FROM 
      contacts c
    WHERE 
      c.id = v_contact_id AND
      c.user_id = p_user_id;
  END IF;
END;
$$;