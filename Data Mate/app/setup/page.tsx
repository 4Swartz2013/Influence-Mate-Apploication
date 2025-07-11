'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  AlertTriangle,
  Play,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

const migrations = [
  {
    id: 'core-tables',
    title: 'Migration 1: Core Tables',
    description: 'Creates the foundational tables for contacts, comments, transcripts, campaigns, and AI insights',
    sql: `/*
  # Initial schema for Influence Mate Data Intelligence Platform

  1. New Tables
    - \`contacts\` - Enriched influencer/contact profiles
    - \`comments\` - Scraped comments and analysis data
    - \`transcripts\` - Video/audio transcripts and AI summaries
    - \`ai_insights\` - AI-generated insights and predictions
    - \`campaigns\` - Marketing campaigns and tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create custom types
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE insight_type AS ENUM ('conversion_prediction', 'persona_conflict', 'audience_clustering', 'outreach_suggestion', 'causal_analysis');

-- Contacts table - enriched influencer profiles
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Unknown Contact',
  email text,
  phone text,
  platform text,
  username text,
  bio text,
  follower_count integer DEFAULT 0,
  engagement_rate decimal(5,4),
  location text,
  tags text[] DEFAULT '{}',
  contact_score decimal(3,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table - scraped comments and sentiment analysis
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  content text NOT NULL,
  platform text NOT NULL,
  post_url text,
  sentiment_score decimal(3,2),
  intent_labels text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcripts table - video/audio transcripts and AI analysis
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  content_url text NOT NULL,
  raw_transcript text NOT NULL,
  ai_summary text,
  topics text[] DEFAULT '{}',
  sentiment text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Insights table - AI-generated insights and predictions
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  insight_type insight_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score decimal(3,2),
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table - marketing campaigns and tracking
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status campaign_status DEFAULT 'draft',
  start_date timestamptz,
  end_date timestamptz,
  budget decimal(12,2),
  target_contacts text[] DEFAULT '{}',
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_updated_at_idx ON contacts(updated_at DESC);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_contact_id_idx ON comments(contact_id);
CREATE INDEX IF NOT EXISTS comments_updated_at_idx ON comments(updated_at DESC);
CREATE INDEX IF NOT EXISTS transcripts_user_id_idx ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS transcripts_contact_id_idx ON transcripts(contact_id);
CREATE INDEX IF NOT EXISTS transcripts_updated_at_idx ON transcripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_contact_id_idx ON ai_insights(contact_id);
CREATE INDEX IF NOT EXISTS ai_insights_updated_at_idx ON ai_insights(updated_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_updated_at_idx ON campaigns(updated_at DESC);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transcripts"
  ON transcripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ai_insights"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transcripts_updated_at BEFORE UPDATE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
  },
  {
    id: 'audience-intelligence',
    title: 'Migration 2: Audience Intelligence System',
    description: 'Creates audience segments, member relationships, enrichment jobs, and audience-specific insights',
    sql: `/*
  # Audience Intelligence System

  1. New Tables
    - \`audience_segments\` - AI-generated audience clusters
    - \`audience_members\` - Join table linking contacts to segments
    - \`enrichment_jobs\` - Background processing jobs
    - \`audience_insights\` - AI insights specific to audiences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create audience segment table
CREATE TABLE IF NOT EXISTS audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  primary_traits jsonb DEFAULT '{}',
  cluster_criteria jsonb DEFAULT '{}',
  ai_persona_label text,
  total_contacts integer DEFAULT 0,
  engagement_score decimal(3,2),
  outreach_readiness_score decimal(3,2),
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audience members join table
CREATE TABLE IF NOT EXISTS audience_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audience_segment_id uuid REFERENCES audience_segments(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  similarity_score decimal(3,2),
  added_at timestamptz DEFAULT now(),
  UNIQUE(audience_segment_id, contact_id)
);

-- Create enrichment jobs table
CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_type text NOT NULL,
  status text DEFAULT 'pending',
  target_table text,
  target_id uuid,
  parameters jsonb DEFAULT '{}',
  progress integer DEFAULT 0,
  results jsonb DEFAULT '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create audience-specific insights table
CREATE TABLE IF NOT EXISTS audience_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  audience_segment_id uuid REFERENCES audience_segments(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score decimal(3,2),
  actionable_recommendations text[],
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS audience_segments_user_id_idx ON audience_segments(user_id);
CREATE INDEX IF NOT EXISTS audience_segments_updated_at_idx ON audience_segments(updated_at DESC);
CREATE INDEX IF NOT EXISTS audience_members_segment_id_idx ON audience_members(audience_segment_id);
CREATE INDEX IF NOT EXISTS audience_members_contact_id_idx ON audience_members(contact_id);
CREATE INDEX IF NOT EXISTS enrichment_jobs_user_id_idx ON enrichment_jobs(user_id);
CREATE INDEX IF NOT EXISTS enrichment_jobs_status_idx ON enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS audience_insights_segment_id_idx ON audience_insights(audience_segment_id);
CREATE INDEX IF NOT EXISTS audience_insights_user_id_idx ON audience_insights(user_id);

-- Enable RLS
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own audience segments"
  ON audience_segments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage audience members for their segments"
  ON audience_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audience_segments 
      WHERE id = audience_members.audience_segment_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own enrichment jobs"
  ON enrichment_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage insights for their audience segments"
  ON audience_insights
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_audience_segments_updated_at BEFORE UPDATE ON audience_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audience_insights_updated_at BEFORE UPDATE ON audience_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update audience segment contact count
CREATE OR REPLACE FUNCTION update_audience_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE audience_segments 
    SET total_contacts = (
      SELECT COUNT(*) FROM audience_members 
      WHERE audience_segment_id = NEW.audience_segment_id
    )
    WHERE id = NEW.audience_segment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE audience_segments 
    SET total_contacts = (
      SELECT COUNT(*) FROM audience_members 
      WHERE audience_segment_id = OLD.audience_segment_id
    )
    WHERE id = OLD.audience_segment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to maintain contact counts
CREATE TRIGGER update_audience_contact_count_trigger
  AFTER INSERT OR DELETE ON audience_members
  FOR EACH ROW EXECUTE FUNCTION update_audience_contact_count();`
  },
  {
    id: 'data-transformer',
    title: 'Migration 3: Data Transformer Tables',
    description: 'Creates tables for raw data storage and field mapping logs for ML learning',
    sql: `/*
  # Data Transformer Tables

  1. New Tables
    - \`raw_contact_data\` - Stores original unprocessed contact data
    - \`field_mapping_logs\` - Logs field mappings for ML learning

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
  WITH CHECK (auth.uid() = user_id);`
  }
]

export default function SetupPage() {
  const [copiedMigrations, setCopiedMigrations] = useState<string[]>([])
  const [migrationsRun, setMigrationsRun] = useState<string[]>([])

  const copyToClipboard = async (migrationId: string, sql: string) => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopiedMigrations(prev => [...prev, migrationId])
      toast.success('SQL copied to clipboard!')
      
      // Remove the copied status after 3 seconds
      setTimeout(() => {
        setCopiedMigrations(prev => prev.filter(id => id !== migrationId))
      }, 3000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const markAsDone = (migrationId: string) => {
    setMigrationsRun(prev => [...prev, migrationId])
    toast.success(`Migration ${migrationId} marked as complete`)
  }

  const openSupabaseDashboard = () => {
    window.open('https://commoobkjixscnlhyamb.supabase.co/project/default/sql/new', '_blank')
  }

  const allMigrationsRun = migrationsRun.length === migrations.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Database Setup Required</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Your Influence Mate application needs database tables to function properly. 
            Follow these steps to set up your Supabase database schema.
          </p>
        </div>

        {/* Setup Steps */}
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong className="font-bold">Database Error Detected:</strong> Your application is missing required tables and columns. You need to run these SQL migrations in your Supabase dashboard to fix the database errors.
          </AlertDescription>
        </Alert>

        {/* Quick Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Quick Setup</span>
            </CardTitle>
            <CardDescription>
              Open your Supabase SQL Editor and run the migrations below in order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openSupabaseDashboard} className="w-full" size="lg">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase SQL Editor
            </Button>
          </CardContent>
        </Card>

        {/* Migrations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Database Migrations</h2>
          <p className="text-slate-600">
            Copy and paste each migration into your Supabase SQL Editor and run them in order.
          </p>

          {migrations.map((migration, index) => (
            <motion.div
              key={migration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={migrationsRun.includes(migration.id) ? "border-green-300 bg-green-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        <span>{migration.title}</span>
                        {migrationsRun.includes(migration.id) && (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {migration.description}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => copyToClipboard(migration.id, migration.sql)}
                        variant={copiedMigrations.includes(migration.id) ? "default" : "outline"}
                        size="sm"
                      >
                        {copiedMigrations.includes(migration.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy SQL
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markAsDone(migration.id)}
                        className={migrationsRun.includes(migration.id) ? "bg-green-100" : ""}
                      >
                        {migrationsRun.includes(migration.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Done
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-200 whitespace-pre-wrap">
                      {migration.sql}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Apply Migrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Open Supabase SQL Editor</p>
                  <p className="text-sm text-slate-600">Click the button above to open your Supabase SQL Editor</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Copy Migration SQL</p>
                  <p className="text-sm text-slate-600">Copy the SQL from Migration 1 above</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Paste and Run</p>
                  <p className="text-sm text-slate-600">Paste the SQL into the editor and click "Run"</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Repeat for All Migrations</p>
                  <p className="text-sm text-slate-600">Run each migration in order (1, 2, 3)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Return to Application</p>
                  <p className="text-sm text-slate-600">Once all migrations are complete, go back to the main application</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to App */}
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            disabled={!allMigrationsRun}
            className={allMigrationsRun ? "bg-green-50 border-green-300 hover:bg-green-100" : ""}
          >
            {allMigrationsRun ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Back to Application
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Back to Application
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}