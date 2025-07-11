import { supabase } from '@/lib/supabase'
import { ChangeDetector } from './changeDetector'
import { SmartEnricher } from './smartEnricher'
import { SyncJob, SyncStats, SyncChangeLog } from './types'

export class SyncManager {
  private userId: string
  private changeDetector: ChangeDetector
  private smartEnricher: SmartEnricher

  constructor(userId: string) {
    this.userId = userId
    this.changeDetector = new ChangeDetector(userId)
    this.smartEnricher = new SmartEnricher(userId)
  }

  /**
   * Run the complete sync process
   */
  async runSync(jobId?: string): Promise<SyncStats> {
    const startTime = Date.now()
    
    try {
      console.log('Starting sync process...')

      // Step 1: Detect changes
      const changes = await this.changeDetector.detectChanges(30)
      console.log(`Detected ${changes.length} changes`)

      if (changes.length === 0) {
        return this.generateStats(0, 0, 0, 0)
      }

      // Step 2: Group changes by priority
      const prioritizedChanges = this.prioritizeChanges(changes)

      // Step 3: Process high-priority changes first
      let totalProcessed = 0
      let totalFailed = 0

      for (const [priority, priorityChanges] of prioritizedChanges) {
        if (priorityChanges.length === 0) continue

        try {
          console.log(`Processing ${priorityChanges.length} ${priority} priority changes`)
          
          // Create scoped enrichment job
          const enrichmentJobId = await this.smartEnricher.createScopedEnrichmentJob(
            priorityChanges,
            priority as 'low' | 'normal' | 'high'
          )

          // Process each change
          const processPromises = priorityChanges.map(change => 
            this.processChange(change, enrichmentJobId)
          )

          const results = await Promise.allSettled(processPromises)
          
          const successful = results.filter(r => r.status === 'fulfilled').length
          const failed = results.length - successful

          totalProcessed += successful
          totalFailed += failed

          // Mark changes as completed
          const successfulChanges = priorityChanges.filter((_, index) => 
            results[index].status === 'fulfilled'
          )
          
          if (successfulChanges.length > 0) {
            await this.changeDetector.markChangesProcessed(
              successfulChanges.map(c => c.id),
              enrichmentJobId
            )
          }

          // Update enrichment job status
          await this.updateEnrichmentJobStatus(enrichmentJobId, failed === 0 ? 'completed' : 'partial')

        } catch (error) {
          console.error(`Error processing ${priority} priority changes:`, error)
          totalFailed += priorityChanges.length
        }
      }

      // Step 4: Update sync job stats if provided
      if (jobId) {
        await this.updateSyncJobStats(jobId, startTime, totalProcessed, totalFailed)
      }

      console.log(`Sync completed: ${totalProcessed} processed, ${totalFailed} failed`)
      
      return this.generateStats(changes.length, totalProcessed, totalFailed, 0)

    } catch (error) {
      console.error('Sync process failed:', error)
      throw error
    }
  }

  /**
   * Process a single change
   */
  private async processChange(change: SyncChangeLog, enrichmentJobId: string): Promise<void> {
    try {
      // Process field-specific enrichment
      await this.smartEnricher.processFieldEnrichment(
        change.contact_id,
        change.field_name,
        change.new_value || ''
      )

      console.log(`Processed change for field ${change.field_name} on contact ${change.contact_id}`)

    } catch (error) {
      console.error(`Error processing change ${change.id}:`, error)
      
      // Mark change as failed
      await supabase
        .from('sync_change_log')
        .update({
          sync_status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', change.id)

      throw error
    }
  }

  /**
   * Prioritize changes based on field importance and confidence impact
   */
  private prioritizeChanges(changes: SyncChangeLog[]): Map<string, SyncChangeLog[]> {
    const priorities = new Map<string, SyncChangeLog[]>([
      ['high', []],
      ['normal', []],
      ['low', []]
    ])

    changes.forEach(change => {
      let priority = 'normal'

      // High priority: email, username changes with good confidence
      if (['email', 'username'].includes(change.field_name) && 
          (change.confidence_before || 0) > 0.7) {
        priority = 'high'
      }
      // Low priority: bio, location changes with low confidence
      else if (['bio', 'location'].includes(change.field_name) && 
               (change.confidence_before || 0) < 0.5) {
        priority = 'low'
      }

      priorities.get(priority)!.push(change)
    })

    return priorities
  }

  /**
   * Update enrichment job status
   */
  private async updateEnrichmentJobStatus(jobId: string, status: string) {
    try {
      const { error } = await supabase
        .from('enrichment_jobs')
        .update({
          status,
          completed_at: new Date().toISOString(),
          progress: 100
        })
        .eq('id', jobId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating enrichment job status:', error)
    }
  }

  /**
   * Update sync job statistics
   */
  private async updateSyncJobStats(
    jobId: string, 
    startTime: number, 
    processed: number, 
    failed: number
  ) {
    try {
      const duration = Date.now() - startTime

      // Get current stats
      const { data: job } = await supabase
        .from('sync_jobs')
        .select('stats')
        .eq('id', jobId)
        .single()

      const currentStats = job?.stats || {}
      const totalRuns = (currentStats.total_runs || 0) + 1
      const successfulRuns = (currentStats.successful_runs || 0) + (failed === 0 ? 1 : 0)
      const failedRuns = (currentStats.failed_runs || 0) + (failed > 0 ? 1 : 0)
      
      // Calculate average duration
      const avgDuration = currentStats.avg_duration_ms 
        ? (currentStats.avg_duration_ms * (totalRuns - 1) + duration) / totalRuns
        : duration

      const updatedStats = {
        total_runs: totalRuns,
        successful_runs: successfulRuns,
        failed_runs: failedRuns,
        avg_duration_ms: Math.round(avgDuration),
        last_processed: processed,
        last_failed: failed,
        last_run_duration_ms: duration
      }

      const { error } = await supabase
        .from('sync_jobs')
        .update({
          stats: updatedStats,
          last_run_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) throw error

    } catch (error) {
      console.error('Error updating sync job stats:', error)
    }
  }

  /**
   * Generate sync statistics
   */
  private async generateStats(
    totalChanges: number,
    processed: number,
    failed: number,
    pending: number
  ): Promise<SyncStats> {
    try {
      // Get outdated contacts count
      const { count: outdatedCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('sync_status', 'outdated')

      // Get next sync run time
      const { data: nextJob } = await supabase
        .from('sync_jobs')
        .select('next_run_at')
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .not('next_run_at', 'is', null)
        .order('next_run_at', { ascending: true })
        .limit(1)
        .single()

      return {
        total_changes: totalChanges,
        pending_changes: pending,
        completed_changes: processed,
        failed_changes: failed,
        outdated_contacts: outdatedCount || 0,
        last_sync_run: new Date().toISOString(),
        next_sync_run: nextJob?.next_run_at
      }

    } catch (error) {
      console.error('Error generating sync stats:', error)
      return {
        total_changes: totalChanges,
        pending_changes: pending,
        completed_changes: processed,
        failed_changes: failed,
        outdated_contacts: 0
      }
    }
  }

  /**
   * Create or update a sync job
   */
  async createSyncJob(
    jobName: string,
    syncType: 'cron' | 'event_triggered' | 'manual',
    scheduleExpression?: string
  ): Promise<string> {
    try {
      const { data: job, error } = await supabase
        .from('sync_jobs')
        .insert({
          user_id: this.userId,
          job_name: jobName,
          sync_type: syncType,
          schedule_expression: scheduleExpression,
          next_run_at: syncType === 'cron' ? this.calculateNextRun(scheduleExpression!) : null,
          status: 'active',
          config: {},
          stats: {}
        })
        .select()
        .single()

      if (error) throw error
      return job.id

    } catch (error) {
      console.error('Error creating sync job:', error)
      throw error
    }
  }

  /**
   * Calculate next run time for cron jobs
   */
  private calculateNextRun(cronExpression: string): string {
    // Simplified cron calculation - in production, use a proper cron library
    const now = new Date()
    
    if (cronExpression === '0 0 * * *') { // Daily at midnight
      const nextRun = new Date(now)
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(0, 0, 0, 0)
      return nextRun.toISOString()
    }
    
    if (cronExpression === '0 */6 * * *') { // Every 6 hours
      const nextRun = new Date(now)
      nextRun.setHours(nextRun.getHours() + 6, 0, 0, 0)
      return nextRun.toISOString()
    }
    
    // Default to 24 hours from now
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return nextRun.toISOString()
  }

  /**
   * Get sync statistics for dashboard
   */
  async getSyncStats(): Promise<SyncStats> {
    try {
      // Get pending changes
      const { count: pendingCount } = await supabase
        .from('sync_change_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('sync_status', 'pending')

      // Get completed changes (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: completedCount } = await supabase
        .from('sync_change_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('sync_status', 'completed')
        .gte('processed_at', thirtyDaysAgo.toISOString())

      // Get failed changes (last 30 days)
      const { count: failedCount } = await supabase
        .from('sync_change_log')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('sync_status', 'failed')
        .gte('detected_at', thirtyDaysAgo.toISOString())

      return this.generateStats(
        (pendingCount || 0) + (completedCount || 0) + (failedCount || 0),
        completedCount || 0,
        failedCount || 0,
        pendingCount || 0
      )

    } catch (error) {
      console.error('Error getting sync stats:', error)
      throw error
    }
  }
}