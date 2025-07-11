import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  platform?: string
  username?: string
  bio?: string
  follower_count?: number
  engagement_rate?: number
  location?: string
  tags?: string[]
  contact_score?: number
  phone?: string
  last_sync_at?: string
  sync_status?: string
  outdated_fields?: string[]
  metadata?: any
  created_at: string
  updated_at: string
  role?: string
}

export interface Comment {
  id: string
  user_id: string
  contact_id?: string
  content: string
  platform: string
  post_url?: string
  sentiment_score?: number
  intent_labels?: string[]
  created_at: string
  updated_at: string
}

export interface Transcript {
  id: string
  user_id: string
  contact_id?: string
  content_url: string
  raw_transcript: string
  ai_summary?: string
  topics?: string[]
  sentiment?: string
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  contact_id?: string
  insight_type: string
  title: string
  description: string
  confidence_score?: number
  data?: any
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  description?: string
  status: string
  start_date?: string
  end_date?: string
  budget?: number
  target_contacts?: string[]
  metrics?: any
  created_at: string
  updated_at: string
}

export interface AudienceSegment {
  id: string
  user_id: string
  name: string
  description?: string
  primary_traits?: any
  cluster_criteria?: any
  ai_persona_label?: string
  total_contacts: number
  engagement_score?: number
  outreach_readiness_score?: number
  status: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface AudienceMember {
  id: string
  audience_segment_id: string
  contact_id: string
  similarity_score?: number
  added_at: string
}

export interface EnrichmentJob {
  id: string
  user_id: string
  job_type: string
  status: string
  target_table?: string
  target_id?: string
  parameters?: any
  progress: number
  results?: any
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface AudienceInsight {
  id: string
  user_id: string
  audience_segment_id: string
  insight_type: string
  title: string
  description: string
  confidence_score?: number
  actionable_recommendations?: string[]
  data?: any
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  access_token?: string
  created_at: string
  role?: string
}