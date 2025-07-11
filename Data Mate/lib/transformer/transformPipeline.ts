import { supabase } from '@/lib/supabase'
import { cleanFields } from './cleanFields'
import { deduplicate } from './deduplicate'
import { mapSchema } from './mapSchema'
import { scoreConfidence } from './scoreConfidence'

export interface RawContactInput {
  name?: string
  username?: string
  email?: string
  phone?: string
  bio?: string
  profile_url?: string
  platform?: string
  location?: string
  external_source?: string // e.g., uploaded_csv, scraped_ig, pipedrive
  raw_record: any
  user_id: string
}

export interface TransformResult {
  success: boolean
  contact_id?: string
  is_duplicate: boolean
  duplicate_of?: string
  confidence_scores: Record<string, number>
  field_mappings: Record<string, string>
  errors?: string[]
}

export async function transformPipeline(
  rawInput: RawContactInput
): Promise<TransformResult> {
  try {
    const errors: string[] = []

    // Step 1: Schema Detection & Mapping
    const fieldMappings = await mapSchema(rawInput)
    
    // Step 2: Field Cleaning
    const cleanedData = await cleanFields(rawInput, fieldMappings)
    
    // Step 3: Confidence Scoring
    const confidenceScores = await scoreConfidence(cleanedData, rawInput.external_source)
    
    // Step 4: Deduplication Check
    const duplicateResult = await deduplicate(cleanedData, rawInput.user_id)
    
    if (duplicateResult.isDuplicate && duplicateResult.existingContactId) {
      // Merge with existing contact
      const mergedContact = await mergeContactData(
        duplicateResult.existingContactId,
        cleanedData,
        confidenceScores,
        rawInput
      )
      
      return {
        success: true,
        contact_id: duplicateResult.existingContactId,
        is_duplicate: true,
        duplicate_of: duplicateResult.existingContactId,
        confidence_scores: confidenceScores,
        field_mappings: fieldMappings,
      }
    }

    // Step 5: Store Raw Data
    const { data: rawDataRecord, error: rawError } = await supabase
      .from('raw_contact_data')
      .insert({
        user_id: rawInput.user_id,
        external_source: rawInput.external_source || 'unknown',
        raw_data: rawInput.raw_record,
        field_mappings: fieldMappings,
        processed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (rawError) {
      errors.push(`Failed to store raw data: ${rawError.message}`)
    }

    // Step 6: Store Clean Contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        user_id: rawInput.user_id,
        name: cleanedData.name || 'Unknown Contact',
        email: cleanedData.email,
        username: cleanedData.username,
        platform: cleanedData.platform,
        bio: cleanedData.bio,
        location: cleanedData.location,
        contact_score: confidenceScores.overall,
        metadata: {
          external_source: rawInput.external_source,
          confidence_scores: confidenceScores,
          raw_data_id: rawDataRecord?.id,
          field_mappings: fieldMappings
        }
      })
      .select()
      .single()

    if (contactError) {
      throw new Error(`Failed to create contact: ${contactError.message}`)
    }

    // Step 7: Log Field Mappings
    await supabase
      .from('field_mapping_logs')
      .insert({
        user_id: rawInput.user_id,
        contact_id: contact.id,
        external_source: rawInput.external_source || 'unknown',
        field_mappings: fieldMappings,
        confidence_scores: confidenceScores,
        created_at: new Date().toISOString()
      })

    // Step 8: Trigger Enrichment Job
    await triggerEnrichmentJob(contact.id, rawInput.user_id)

    return {
      success: true,
      contact_id: contact.id,
      is_duplicate: false,
      confidence_scores: confidenceScores,
      field_mappings: fieldMappings,
      errors: errors.length > 0 ? errors : undefined
    }

  } catch (error) {
    console.error('Transform pipeline error:', error)
    return {
      success: false,
      is_duplicate: false,
      confidence_scores: {},
      field_mappings: {},
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

async function mergeContactData(
  existingContactId: string,
  cleanedData: any,
  confidenceScores: Record<string, number>,
  rawInput: RawContactInput
) {
  // Get existing contact
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', existingContactId)
    .single()

  if (!existingContact) return

  // Merge logic: use higher confidence scores to determine which data to keep
  const existingScores = existingContact.metadata?.confidence_scores || {}
  const mergedData: any = { ...existingContact }

  // Compare and merge each field based on confidence
  Object.keys(cleanedData).forEach(field => {
    const newScore = confidenceScores[field] || 0
    const existingScore = existingScores[field] || 0
    
    if (newScore > existingScore && cleanedData[field]) {
      mergedData[field] = cleanedData[field]
    }
  })

  // Update metadata with new source information
  mergedData.metadata = {
    ...mergedData.metadata,
    sources: [
      ...(mergedData.metadata?.sources || []),
      {
        external_source: rawInput.external_source,
        added_at: new Date().toISOString(),
        confidence_scores: confidenceScores
      }
    ],
    confidence_scores: {
      ...existingScores,
      ...confidenceScores
    }
  }

  // Update the contact
  await supabase
    .from('contacts')
    .update(mergedData)
    .eq('id', existingContactId)

  return mergedData
}

async function triggerEnrichmentJob(contactId: string, userId: string) {
  await supabase
    .from('enrichment_jobs')
    .insert({
      user_id: userId,
      job_type: 'contact_enrichment',
      status: 'pending',
      target_table: 'contacts',
      target_id: contactId,
      parameters: {
        trigger: 'new_contact_import',
        priority: 'normal'
      },
      progress: 0
    })
}