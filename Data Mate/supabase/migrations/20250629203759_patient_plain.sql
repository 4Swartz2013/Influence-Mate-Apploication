/*
  # Web Scraper Storage Schema for ScraperCore

  1. New Tables
    - `raw_scrape_results` - Stores web scraping results and metadata
    - `scraper_jobs` - Tracks scraping job status and assignments
    - `proxy_servers` - Manages proxy rotation and stats

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create raw scrape results table
CREATE TABLE IF NOT EXISTS raw_scrape_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  engine text NOT NULL, -- 'google', 'bing', 'ddg'
  result_rank integer,
  target_url text NOT NULL,
  final_url text,
  status_code integer,
  html text,
  scraped_at timestamptz DEFAULT now(),
  scrape_job_id uuid REFERENCES enrichment_jobs(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  proxy_id text,
  fingerprints jsonb DEFAULT '{}',
  duration_ms integer,
  error_msg text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scraper jobs table for tracking
CREATE TABLE IF NOT EXISTS scraper_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrichment_job_id uuid REFERENCES enrichment_jobs(id) ON DELETE CASCADE,
  query text NOT NULL,
  max_results integer DEFAULT 10,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  engines text[] DEFAULT '{"google", "bing", "ddg"}',
  current_engine text,
  results_found integer DEFAULT 0,
  start_time timestamptz,
  end_time timestamptz,
  error_msg text,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proxy servers table
CREATE TABLE IF NOT EXISTS proxy_servers (
  id text PRIMARY KEY, -- unique identifier or IP:port
  url text NOT NULL, -- proxy URL with auth if needed
  type text NOT NULL, -- 'http', 'https', 'socks5'
  country text,
  provider text,
  is_active boolean DEFAULT true,
  total_requests integer DEFAULT 0,
  successful_requests integer DEFAULT 0,
  failed_requests integer DEFAULT 0,
  last_used_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  cooldown_until timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crawler error logs
CREATE TABLE IF NOT EXISTS crawler_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scrape_job_id uuid REFERENCES scraper_jobs(id) ON DELETE CASCADE,
  engine text,
  url text,
  error_type text NOT NULL, -- 'captcha', 'proxy_failure', 'timeout', 'network', etc.
  error_message text,
  proxy_id text,
  status_code integer,
  fingerprint text,
  stack_trace text,
  context jsonb DEFAULT '{}',
  occurred_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS raw_scrape_results_job_id_idx ON raw_scrape_results(scrape_job_id);
CREATE INDEX IF NOT EXISTS raw_scrape_results_user_id_idx ON raw_scrape_results(user_id);
CREATE INDEX IF NOT EXISTS raw_scrape_results_query_idx ON raw_scrape_results(query);
CREATE INDEX IF NOT EXISTS raw_scrape_results_target_url_idx ON raw_scrape_results(target_url);
CREATE INDEX IF NOT EXISTS scraper_jobs_user_id_idx ON scraper_jobs(user_id);
CREATE INDEX IF NOT EXISTS scraper_jobs_enrichment_job_id_idx ON scraper_jobs(enrichment_job_id);
CREATE INDEX IF NOT EXISTS scraper_jobs_status_idx ON scraper_jobs(status);
CREATE INDEX IF NOT EXISTS proxy_servers_is_active_idx ON proxy_servers(is_active);
CREATE INDEX IF NOT EXISTS proxy_servers_cooldown_idx ON proxy_servers(cooldown_until);
CREATE INDEX IF NOT EXISTS crawler_error_logs_job_id_idx ON crawler_error_logs(scrape_job_id);
CREATE INDEX IF NOT EXISTS crawler_error_logs_error_type_idx ON crawler_error_logs(error_type);

-- Enable RLS
ALTER TABLE raw_scrape_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxy_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_error_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own raw scrape results"
  ON raw_scrape_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scraper jobs"
  ON scraper_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage proxy servers"
  ON proxy_servers
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Users can view all proxy servers"
  ON proxy_servers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own crawler error logs"
  ON crawler_error_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create functions to update updated_at
CREATE TRIGGER update_raw_scrape_results_updated_at BEFORE UPDATE ON raw_scrape_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_jobs_updated_at BEFORE UPDATE ON scraper_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proxy_servers_updated_at BEFORE UPDATE ON proxy_servers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add link to enrichment_jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enrichment_jobs' AND column_name = 'scrape_job_id'
  ) THEN
    ALTER TABLE enrichment_jobs ADD COLUMN scrape_job_id uuid REFERENCES scraper_jobs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create function to get least used proxy
CREATE OR REPLACE FUNCTION get_least_used_proxy()
RETURNS TABLE (
  proxy_id text,
  proxy_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    url
  FROM
    proxy_servers
  WHERE
    is_active = true AND
    (cooldown_until IS NULL OR cooldown_until < now())
  ORDER BY
    COALESCE(last_used_at, '1970-01-01'::timestamptz) ASC,
    total_requests ASC
  LIMIT 1;
END;
$$;

-- Create function to update proxy usage stats
CREATE OR REPLACE FUNCTION update_proxy_usage(
  p_proxy_id text,
  p_success boolean,
  p_cooldown_minutes integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  cooldown_time timestamptz;
BEGIN
  -- Calculate cooldown time if provided
  IF p_cooldown_minutes IS NOT NULL THEN
    cooldown_time := now() + (p_cooldown_minutes * interval '1 minute');
  END IF;

  -- Update the proxy stats
  UPDATE proxy_servers
  SET
    total_requests = total_requests + 1,
    successful_requests = CASE WHEN p_success THEN successful_requests + 1 ELSE successful_requests END,
    failed_requests = CASE WHEN NOT p_success THEN failed_requests + 1 ELSE failed_requests END,
    last_used_at = now(),
    last_success_at = CASE WHEN p_success THEN now() ELSE last_success_at END,
    last_failure_at = CASE WHEN NOT p_success THEN now() ELSE last_failure_at END,
    cooldown_until = cooldown_time
  WHERE
    id = p_proxy_id;
END;
$$;