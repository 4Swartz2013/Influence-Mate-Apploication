import { supabase } from '@/lib/supabase'
import { SyncableField, SyncChangeLog } from './types'

export class ChangeDetector {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Monitor contacts modified within the specified timeframe
   */
  async detectChanges(daysBack: number = 30): Promise<SyncChangeLog[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    try {
      // Get contacts that have been modified recently but haven't been synced
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('id, updated_at, last_sync_at, sync_status')
        .eq('user_id', this.userId)
        .gte('updated_at', cutoffDate.toISOString())
        .or('last_sync_at.is.null,last_sync_at.lt.updated_at')

      if (error) throw error

      const changePromises = contacts.map(contact => 
        this.detectContactChanges(contact.id)
      )

      const allChanges = await Promise.all(changePromises)
      return allChanges.flat()

    } catch (error) {
      console.error('Error detecting changes:', error)
      throw error
    }
  }

  /**
   * Detect changes for a specific contact
   */
  async detectContactChanges(contactId: string): Promise<SyncChangeLog[]> {
    try {
      const { data: changes, error } = await supabase
        .from('sync_change_log')
        .select('*')
        .eq('contact_id', contactId)
        .eq('sync_status', 'pending')
        .order('detected_at', { ascending: false })

      if (error) throw error
      return changes || []

    } catch (error) {
      console.error('Error detecting contact changes:', error)
      throw error
    }
  }

  /**
   * Compare field values and create change log entries
   */
  async compareAndLogChanges(
    contactId: string,
    currentData: Record<string, any>,
    newData: Record<string, any>,
    source: 'scrape' | 'import' | 'webhook' | 'manual'
  ): Promise<SyncChangeLog[]> {
    const syncableFields: SyncableField[] = [
      'username', 'bio', 'location', 'profile_url', 'email', 'name', 'phone'
    ]

    const changes: SyncChangeLog[] = []

    for (const field of syncableFields) {
      const oldValue = currentData[field]
      const newValue = newData[field]

      // Skip if values are the same or both are null/undefined
      if (oldValue === newValue || (!oldValue && !newValue)) {
        continue
      }

      // Calculate confidence score from metadata
      const confidenceBefore = currentData.metadata?.confidence_scores?.[field] || 0.5

      try {
        const { data: changeLog, error } = await supabase
          .from('sync_change_log')
          .insert({
            user_id: this.userId,
            contact_id: contactId,
            field_name: field,
            old_value: oldValue,
            new_value: newValue,
            confidence_before: confidenceBefore,
            change_source: source,
            sync_status: 'pending'
          })
          .select()
          .single()

        if (error) throw error
        changes.push(changeLog)

        // Update contact to mark as outdated
        await this.markContactOutdated(contactId, field)

      } catch (error) {
        console.error(`Error logging change for field ${field}:`, error)
      }
    }

    return changes
  }

  /**
   * Mark a contact as having outdated fields
   */
  private async markContactOutdated(contactId: string, field: SyncableField) {
    try {
      // Get current contact data
      const { data: contact, error: fetchError } = await supabase
        .from('contacts')
        .select('outdated_fields, sync_status')
        .eq('id', contactId)
        .single()

      if (fetchError) throw fetchError

      const outdatedFields = contact.outdated_fields || []
      if (!outdatedFields.includes(field)) {
        outdatedFields.push(field)
      }

      // Update contact status
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          sync_status: 'outdated',
          outdated_fields: outdatedFields,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', contactId)

      if (updateError) throw updateError

    } catch (error) {
      console.error('Error marking contact as outdated:', error)
    }
  }

  /**
   * Get pending changes for processing
   */
  async getPendingChanges(limit: number = 100): Promise<SyncChangeLog[]> {
    try {
      const { data: changes, error } = await supabase
        .from('sync_change_log')
        .select('*')
        .eq('user_id', this.userId)
        .eq('sync_status', 'pending')
        .order('detected_at', { ascending: true })
        .limit(limit)

      if (error) throw error
      return changes || []

    } catch (error) {
      console.error('Error getting pending changes:', error)
      throw error
    }
  }

  /**
   * Mark changes as processed
   */
  async markChangesProcessed(changeIds: string[], enrichmentJobId?: string) {
    try {
      const { error } = await supabase
        .from('sync_change_log')
        .update({
          sync_status: 'completed',
          processed_at: new Date().toISOString(),
          enrichment_job_id: enrichmentJobId
        })
        .in('id', changeIds)

      if (error) throw error

    } catch (error) {
      console.error('Error marking changes as processed:', error)
      throw error
    }
  }
}