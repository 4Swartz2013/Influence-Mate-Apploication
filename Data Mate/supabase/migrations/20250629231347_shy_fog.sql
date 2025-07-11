/*
  # Scraper Metrics SQL Views

  1. New Views
    - v_platform_kpis - Key performance indicators by platform
    - v_proxy_stats - Proxy usage statistics and failure rates
    - v_confidence_daily - Daily average confidence scores
    - v_worker_fleet_stats - Worker agent activity metrics
    - v_job_queue_lag - Job queue age statistics
    
  2. Functions
    - calculate_queue_lag - Calculates age of oldest pending job in seconds
    - get_platform_kpis - Get KPIs for a specific user
*/

-- Platform-specific KPIs
CREATE OR REPLACE VIEW v_platform_kpis AS
SELECT platform,
       count(*) FILTER (WHERE status='completed')    AS success,
       count(*) FILTER (WHERE status='failed')     AS failed,
       count(*) FILTER (WHERE status='pending')     AS queued,
       count(*) FILTER (WHERE status='processing')AS in_progress,
       round(100.0*count(*) FILTER (WHERE status='completed')/NULLIF(count(*),0),2) AS success_rate,
       avg(extract(epoch from (CASE 
            WHEN status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL
            THEN completed_at - started_at
            ELSE interval '0 seconds'
          END))) as avg_duration_sec,
       max(extract(epoch from (now() - created_at))) FILTER (WHERE status='pending') as max_queue_age_sec
FROM enrichment_jobs
WHERE created_at > now() - interval '24 hours'
GROUP BY platform;

-- Proxy statistics
CREATE OR REPLACE VIEW v_proxy_stats AS
SELECT proxy_id,
       count(*)                       AS total_hits,
       count(*) FILTER (WHERE error_msg IS NOT NULL) AS fails,
       round(100.0*count(*) FILTER (WHERE error_msg IS NOT NULL)/NULLIF(count(*),0),2)  AS fail_pct,
       max(scraped_at) as last_used_at
FROM raw_scrape_results
WHERE scraped_at > now() - interval '24 hours'
GROUP BY proxy_id;

-- Daily confidence scores
CREATE OR REPLACE VIEW v_confidence_daily AS
SELECT date_trunc('day', cm.harvested_at) AS day,
       avg(cm.confidence_transcript)      AS avg_conf,
       count(*)                           AS transcripts_count
FROM content_media cm
WHERE cm.confidence_transcript IS NOT NULL
GROUP BY 1
ORDER BY 1 DESC
LIMIT 30;

-- Worker fleet statistics
CREATE OR REPLACE VIEW v_worker_fleet_stats AS
SELECT wa.id,
       wa.agent_name, 
       wa.platform,
       wa.status,
       wa.capabilities,
       wa.last_heartbeat,
       count(ws.id) FILTER (WHERE ws.status = 'success') as successful_jobs,
       count(ws.id) FILTER (WHERE ws.status = 'failed') as failed_jobs,
       avg(ws.duration_ms) FILTER (WHERE ws.status = 'success') as avg_duration_ms,
       (EXTRACT(EPOCH FROM (now() - wa.last_heartbeat))) as seconds_since_heartbeat,
       CASE 
         WHEN (EXTRACT(EPOCH FROM (now() - wa.last_heartbeat))) > 600 THEN 'offline'
         ELSE wa.status
       END as effective_status
FROM worker_agents wa
LEFT JOIN worker_sessions ws ON wa.id = ws.agent_id AND ws.started_at > now() - interval '24 hours'
GROUP BY wa.id, wa.agent_name, wa.platform, wa.status, wa.capabilities, wa.last_heartbeat;

-- Job queue lag
CREATE OR REPLACE VIEW v_job_queue_lag AS
SELECT 
    EXTRACT(EPOCH FROM (now() - min(created_at))) as oldest_job_age_sec,
    count(*) as pending_jobs,
    count(*) FILTER (WHERE created_at < now() - interval '1 hour') as stale_jobs,
    avg(EXTRACT(EPOCH FROM (now() - created_at))) as avg_queue_age_sec
FROM enrichment_jobs
WHERE status = 'pending';

-- Function to calculate queue lag
CREATE OR REPLACE FUNCTION calculate_queue_lag() 
RETURNS INTEGER AS $$
DECLARE
    lag_seconds INTEGER;
BEGIN
    SELECT EXTRACT(EPOCH FROM (now() - min(created_at)))::INTEGER
    INTO lag_seconds
    FROM enrichment_jobs
    WHERE status = 'pending';
    
    RETURN COALESCE(lag_seconds, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get platform KPIs for a specific user
CREATE OR REPLACE FUNCTION get_platform_kpis(user_id_param UUID)
RETURNS TABLE (
    platform TEXT,
    success BIGINT,
    failed BIGINT,
    queued BIGINT,
    in_progress BIGINT,
    success_rate NUMERIC,
    avg_duration_sec DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ej.parameters->>'platform_required' as platform,
        count(*) FILTER (WHERE status='completed')    AS success,
        count(*) FILTER (WHERE status='failed')     AS failed,
        count(*) FILTER (WHERE status='pending')     AS queued,
        count(*) FILTER (WHERE status='processing')AS in_progress,
        round(100.0*count(*) FILTER (WHERE status='completed')/NULLIF(count(*),0),2) AS success_rate,
        avg(extract(epoch from (CASE 
            WHEN status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL
            THEN completed_at - started_at
            ELSE interval '0 seconds'
          END))) as avg_duration_sec
    FROM enrichment_jobs ej
    WHERE ej.user_id = user_id_param
      AND ej.created_at > now() - interval '24 hours'
      AND ej.parameters->>'platform_required' IS NOT NULL
    GROUP BY ej.parameters->>'platform_required';
END;
$$ LANGUAGE plpgsql;