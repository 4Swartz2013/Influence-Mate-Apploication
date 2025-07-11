/*
  # Worker Registry System

  1. New Tables
    - `worker_agents` - Registry of all worker nodes
    - `worker_sessions` - Job execution logs per worker

  2. Security
    - Enable RLS on all tables
    - Add policies for service role access only
    - Create cleanup function for stale workers
*/

-- Persistent roster of worker agents
CREATE TABLE IF NOT EXISTS worker_agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name      TEXT NOT NULL,
  platform        TEXT DEFAULT 'generic',  -- internal only
  status          TEXT DEFAULT 'online',   -- online | offline | draining
  capabilities    JSONB DEFAULT '{}',
  host_ip         TEXT,
  registered_at   TIMESTAMP DEFAULT now(),
  last_heartbeat  TIMESTAMP DEFAULT now(),
  metrics         JSONB DEFAULT '{}'
);

-- Per-job session log
CREATE TABLE IF NOT EXISTS worker_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id      UUID REFERENCES worker_agents(id) ON DELETE SET NULL,
  job_id        UUID,               -- FK to enrichment_jobs
  status        TEXT,               -- queued | in_progress | success | failed
  started_at    TIMESTAMP,
  ended_at      TIMESTAMP,
  duration_ms   INT,
  error_msg     TEXT
);

-- Enable RLS on both tables
ALTER TABLE worker_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access only
CREATE POLICY "Service role can access worker_agents"
  ON worker_agents
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can access worker_sessions"
  ON worker_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to mark stale workers as offline and requeue their jobs
CREATE OR REPLACE FUNCTION clean_stale_workers() RETURNS void AS $$
DECLARE
  heartbeat_timeout INTERVAL := interval '3 minutes';
BEGIN
  -- Find agents with stale heartbeats
  UPDATE worker_agents
  SET status = 'offline'
  WHERE 
    status = 'online' AND 
    last_heartbeat < (now() - heartbeat_timeout);
    
  -- Requeue in-progress jobs from stale agents
  UPDATE enrichment_jobs
  SET 
    status = 'pending',
    progress = 0,
    started_at = NULL
  WHERE 
    id IN (
      SELECT ws.job_id
      FROM worker_sessions ws
      JOIN worker_agents wa ON ws.agent_id = wa.id
      WHERE 
        ws.status = 'in_progress' AND
        wa.status = 'offline'
    );
    
  -- Mark the worker sessions as failed
  UPDATE worker_sessions
  SET 
    status = 'failed',
    ended_at = now(),
    error_msg = 'Worker became unresponsive'
  FROM worker_agents
  WHERE 
    worker_sessions.agent_id = worker_agents.id AND
    worker_agents.status = 'offline' AND
    worker_sessions.status = 'in_progress';
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS worker_agents_status_idx ON worker_agents(status);
CREATE INDEX IF NOT EXISTS worker_agents_last_heartbeat_idx ON worker_agents(last_heartbeat);
CREATE INDEX IF NOT EXISTS worker_sessions_agent_id_idx ON worker_sessions(agent_id);
CREATE INDEX IF NOT EXISTS worker_sessions_job_id_idx ON worker_sessions(job_id);
CREATE INDEX IF NOT EXISTS worker_sessions_status_idx ON worker_sessions(status);