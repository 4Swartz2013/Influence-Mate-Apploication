export type SyncableField = 'username' | 'bio' | 'location' | 'profile_url' | 'email' | 'name' | 'phone'

export interface SyncCheck {
  contact_id: string
  old_value: string
  new_value: string
  field: SyncableField
  changed_at: Date
  confidence_before: number
  confidence_after?: number
}

export interface SyncChangeLog {
  id: string
  user_id: string
  contact_id: string
  field_name: SyncableField
  old_value?: string
  new_value?: string
  confidence_before?: number
  confidence_after?: number
  change_source: 'scrape' | 'import' | 'webhook' | 'manual'
  sync_status: 'pending' | 'processing' | 'completed' | 'failed'
  enrichment_job_id?: string
  detected_at: string
  processed_at?: string
  created_at: string
}

export interface SyncJob {
  id: string
  user_id: string
  job_name: string
  sync_type: 'cron' | 'event_triggered' | 'manual'
  schedule_expression?: string
  last_run_at?: string
  next_run_at?: string
  status: 'active' | 'paused' | 'disabled'
  config: Record<string, any>
  stats: {
    total_runs?: number
    successful_runs?: number
    failed_runs?: number
    avg_duration_ms?: number
    last_error?: string
  }
  created_at: string
  updated_at: string
}

export interface FieldEnrichmentHistory {
  id: string
  user_id: string
  contact_id: string
  field_name: SyncableField
  enrichment_method: string
  confidence_score?: number
  data_source?: string
  enriched_value?: string
  enrichment_job_id?: string
  enriched_at: string
}

export interface SyncStats {
  total_changes: number
  pending_changes: number
  completed_changes: number
  failed_changes: number
  outdated_contacts: number
  last_sync_run?: string
  next_sync_run?: string
}