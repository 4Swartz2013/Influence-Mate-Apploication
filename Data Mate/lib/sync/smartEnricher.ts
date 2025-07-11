import { supabase } from '@/lib/supabase'
import { SyncableField, SyncChangeLog, FieldEnrichmentHistory } from './types'

export class SmartEnricher {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Create scoped enrichment jobs for specific field changes
   */
  async createScopedEnrichmentJob(
    changes: SyncChangeLog[],
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    try {
      // Group changes by contact and field
      const changesByContact = this.groupChangesByContact(changes)
      
      // Determine enrichment scope and method
      const enrichmentScope = this.determineEnrichmentScope(changes)

      // Create enrichment job
      const { data: job, error } = await supabase
        .from('enrichment_jobs')
        .insert({
          user_id: this.userId,
          job_type: 'selective_field_enrichment',
          status: 'pending',
          target_table: 'contacts',
          parameters: {
            changes: changesByContact,
            scope: enrichmentScope,
            priority,
            selective_fields: Array.from(new Set(changes.map(c => c.field_name))),
            trigger: 'sync_change_detection'
          },
          progress: 0
        })
        .select()
        .single()

      if (error) throw error

      // Mark changes as processing
      await this.markChangesProcessing(changes.map(c => c.id), job.id)

      return job.id

    } catch (error) {
      console.error('Error creating scoped enrichment job:', error)
      throw error
    }
  }

  /**
   * Process field-specific enrichment
   */
  async processFieldEnrichment(
    contactId: string,
    field: SyncableField,
    newValue: string
  ): Promise<FieldEnrichmentHistory> {
    try {
      let enrichmentResult: any = {}
      let enrichmentMethod = ''
      let dataSource = ''

      // Apply field-specific enrichment logic
      switch (field) {
        case 'bio':
          enrichmentResult = await this.enrichBio(newValue)
          enrichmentMethod = 'ai_bio_analysis'
          dataSource = 'gemini_ai'
          break

        case 'username':
          enrichmentResult = await this.enrichUsername(contactId, newValue)
          enrichmentMethod = 'profile_rescan'
          dataSource = 'social_scraping'
          break

        case 'location':
          enrichmentResult = await this.enrichLocation(newValue)
          enrichmentMethod = 'geo_enrichment'
          dataSource = 'geocoding_api'
          break

        case 'email':
          enrichmentResult = await this.enrichEmail(contactId, newValue)
          enrichmentMethod = 'email_validation'
          dataSource = 'email_api'
          break

        default:
          enrichmentResult = { value: newValue, confidence: 0.7 }
          enrichmentMethod = 'basic_validation'
          dataSource = 'internal'
      }

      // Store enrichment history
      const { data: history, error } = await supabase
        .from('field_enrichment_history')
        .insert({
          user_id: this.userId,
          contact_id: contactId,
          field_name: field,
          enrichment_method: enrichmentMethod,
          confidence_score: enrichmentResult.confidence || 0.7,
          data_source: dataSource,
          enriched_value: enrichmentResult.value || newValue,
          enriched_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update contact with enriched data
      await this.updateContactField(contactId, field, enrichmentResult)

      return history

    } catch (error) {
      console.error(`Error processing field enrichment for ${field}:`, error)
      throw error
    }
  }

  /**
   * Bio-specific enrichment using AI analysis
   */
  private async enrichBio(bio: string): Promise<any> {
    try {
      // Extract topics, sentiment, and persona indicators from bio
      const topics = this.extractTopics(bio)
      const sentiment = this.analyzeSentiment(bio)
      const personaIndicators = this.extractPersonaIndicators(bio)

      return {
        value: bio,
        confidence: 0.8,
        metadata: {
          topics,
          sentiment,
          persona_indicators: personaIndicators,
          word_count: bio.split(' ').length
        }
      }
    } catch (error) {
      console.error('Error enriching bio:', error)
      return { value: bio, confidence: 0.5 }
    }
  }

  /**
   * Username-specific enrichment with profile rescanning
   */
  private async enrichUsername(contactId: string, username: string): Promise<any> {
    try {
      // Get contact's platform information
      const { data: contact } = await supabase
        .from('contacts')
        .select('platform')
        .eq('id', contactId)
        .single()

      if (!contact?.platform) {
        return { value: username, confidence: 0.6 }
      }

      // Simulate profile scanning (in real implementation, this would call actual APIs)
      const profileData = await this.scanProfile(username, contact.platform)

      return {
        value: username,
        confidence: 0.9,
        metadata: profileData
      }
    } catch (error) {
      console.error('Error enriching username:', error)
      return { value: username, confidence: 0.5 }
    }
  }

  /**
   * Location-specific enrichment with geocoding
   */
  private async enrichLocation(location: string): Promise<any> {
    try {
      // Normalize and geocode location
      const normalizedLocation = location.trim()
      const geoData = await this.geocodeLocation(normalizedLocation)

      return {
        value: normalizedLocation,
        confidence: geoData ? 0.9 : 0.6,
        metadata: geoData
      }
    } catch (error) {
      console.error('Error enriching location:', error)
      return { value: location, confidence: 0.5 }
    }
  }

  /**
   * Email-specific enrichment with validation
   */
  private async enrichEmail(contactId: string, email: string): Promise<any> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValid = emailRegex.test(email)
      
      let confidence = isValid ? 0.8 : 0.3
      let metadata: any = { is_valid: isValid }

      if (isValid) {
        // Extract domain information
        const domain = email.split('@')[1]
        metadata.domain = domain
        metadata.is_business_email = !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)
        
        if (metadata.is_business_email) {
          confidence = 0.9
        }
      }

      return {
        value: email,
        confidence,
        metadata
      }
    } catch (error) {
      console.error('Error enriching email:', error)
      return { value: email, confidence: 0.5 }
    }
  }

  /**
   * Group changes by contact for batch processing
   */
  private groupChangesByContact(changes: SyncChangeLog[]): Record<string, SyncChangeLog[]> {
    return changes.reduce((groups, change) => {
      if (!groups[change.contact_id]) {
        groups[change.contact_id] = []
      }
      groups[change.contact_id].push(change)
      return groups
    }, {} as Record<string, SyncChangeLog[]>)
  }

  /**
   * Determine the scope of enrichment needed
   */
  private determineEnrichmentScope(changes: SyncChangeLog[]): string[] {
    const fieldMap: Record<SyncableField, string[]> = {
      bio: ['persona_analysis', 'topic_extraction'],
      username: ['profile_scan', 'social_verification'],
      location: ['geocoding', 'timezone_detection'],
      email: ['email_validation', 'domain_analysis'],
      name: ['name_validation', 'cultural_analysis'],
      phone: ['phone_validation', 'carrier_lookup'],
      profile_url: ['url_validation', 'profile_extraction']
    }

    const scope = new Set<string>()
    changes.forEach(change => {
      const fieldScope = fieldMap[change.field_name] || []
      fieldScope.forEach(s => scope.add(s))
    })

    return Array.from(scope)
  }

  /**
   * Mark changes as processing
   */
  private async markChangesProcessing(changeIds: string[], jobId: string) {
    try {
      const { error } = await supabase
        .from('sync_change_log')
        .update({
          sync_status: 'processing',
          enrichment_job_id: jobId
        })
        .in('id', changeIds)

      if (error) throw error
    } catch (error) {
      console.error('Error marking changes as processing:', error)
    }
  }

  /**
   * Update contact field with enriched data
   */
  private async updateContactField(
    contactId: string,
    field: SyncableField,
    enrichmentResult: any
  ) {
    try {
      // Get current contact metadata
      const { data: contact } = await supabase
        .from('contacts')
        .select('metadata, outdated_fields')
        .eq('id', contactId)
        .single()

      if (!contact) return

      // Update metadata with new confidence scores
      const metadata = contact.metadata || {}
      if (!metadata.confidence_scores) {
        metadata.confidence_scores = {}
      }
      metadata.confidence_scores[field] = enrichmentResult.confidence

      if (enrichmentResult.metadata) {
        if (!metadata.field_metadata) {
          metadata.field_metadata = {}
        }
        metadata.field_metadata[field] = enrichmentResult.metadata
      }

      // Remove field from outdated_fields
      const outdatedFields = (contact.outdated_fields || []).filter(f => f !== field)

      // Update contact
      const updateData: any = {
        metadata,
        outdated_fields: outdatedFields,
        sync_status: outdatedFields.length > 0 ? 'partial' : 'synced'
      }

      // Update the actual field value if different
      updateData[field] = enrichmentResult.value

      const { error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', contactId)

      if (error) throw error

    } catch (error) {
      console.error('Error updating contact field:', error)
    }
  }

  // Helper methods for enrichment (simplified implementations)
  private extractTopics(bio: string): string[] {
    const topics = []
    const keywords = bio.toLowerCase()
    
    if (keywords.includes('entrepreneur') || keywords.includes('founder')) topics.push('entrepreneur')
    if (keywords.includes('teacher') || keywords.includes('educator')) topics.push('education')
    if (keywords.includes('developer') || keywords.includes('programmer')) topics.push('tech')
    if (keywords.includes('influencer') || keywords.includes('creator')) topics.push('content')
    
    return topics
  }

  private analyzeSentiment(bio: string): string {
    const positive = ['love', 'passionate', 'excited', 'amazing', 'great']
    const negative = ['hate', 'frustrated', 'tired', 'difficult']
    
    const text = bio.toLowerCase()
    const positiveCount = positive.filter(word => text.includes(word)).length
    const negativeCount = negative.filter(word => text.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private extractPersonaIndicators(bio: string): string[] {
    const indicators = []
    const text = bio.toLowerCase()
    
    if (text.includes('mom') || text.includes('mother')) indicators.push('parent')
    if (text.includes('ceo') || text.includes('founder')) indicators.push('executive')
    if (text.includes('artist') || text.includes('creative')) indicators.push('creative')
    
    return indicators
  }

  private async scanProfile(username: string, platform: string): Promise<any> {
    // Simulate profile scanning - in real implementation, this would call platform APIs
    return {
      verified: Math.random() > 0.7,
      follower_count: Math.floor(Math.random() * 10000),
      post_count: Math.floor(Math.random() * 500),
      last_active: new Date().toISOString()
    }
  }

  private async geocodeLocation(location: string): Promise<any> {
    // Simulate geocoding - in real implementation, this would call a geocoding API
    const commonLocations: Record<string, any> = {
      'new york': { lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
      'london': { lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
      'san francisco': { lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles' }
    }

    const normalized = location.toLowerCase()
    for (const [city, data] of Object.entries(commonLocations)) {
      if (normalized.includes(city)) {
        return data
      }
    }

    return null
  }
}