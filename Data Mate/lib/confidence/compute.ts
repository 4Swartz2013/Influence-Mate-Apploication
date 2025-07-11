import { scoreEmail } from './emailScore';
import { scoreLocation } from './locationScore';
import { scoreBio } from './bioScore';
import { scorePhone } from './phoneScore';
import { scoreName } from './nameScore';
import { scoreUsername } from './usernameScore';
import { mergeConfidence, getMergeStrategyForField } from './mergeStrategies';
import { supabase } from '@/lib/supabase';
import { ContactConfidence, FieldConfidence } from './types';

// Define supported fields
const CONFIDENCE_FIELDS = ['email', 'location', 'bio', 'phone', 'username', 'name'];

// Field weights for overall score
const FIELD_WEIGHTS = {
  email: 0.25,
  name: 0.20,
  location: 0.15,
  bio: 0.15,
  phone: 0.15,
  username: 0.10
};

// Confidence thresholds for re-enrichment
const CONFIDENCE_THRESHOLDS = {
  email: 0.5,
  name: 0.6,
  location: 0.4,
  bio: 0.5,
  phone: 0.6,
  username: 0.5,
  overall: 0.5
};

/**
 * Compute confidence scores for a contact record
 * @param record The contact record to score
 * @param sourceType Source of the data (e.g., 'scrape', 'import', 'manual')
 * @param userId User ID for logging
 * @returns The record with confidence scores added
 */
export async function computeConfidence(
  record: any,
  sourceType: string,
  userId: string
): Promise<any> {
  const scoredRecord = { ...record };
  const confidenceScores: Record<string, number> = {};
  
  // Score each available field
  await Promise.all(CONFIDENCE_FIELDS.map(async field => {
    if (record[field]) {
      let score: number;
      let method: string;
      
      // Calculate appropriate score based on field type
      switch (field) {
        case 'email':
          score = await scoreEmail(record[field]);
          method = 'email_validation';
          break;
        case 'location':
          score = await scoreLocation(record[field]);
          method = 'geo_validation';
          break;
        case 'bio':
          score = scoreBio(record[field]);
          method = 'content_analysis';
          break;
        case 'phone':
          score = scorePhone(record[field]);
          method = 'phone_validation';
          break;
        case 'name':
          score = scoreName(record[field]);
          method = 'name_validation';
          break;
        case 'username':
          score = scoreUsername(record[field]);
          method = 'username_validation';
          break;
        default:
          score = 0.5; // Default score
          method = 'basic_validation';
      }
      
      // Store in our map
      confidenceScores[field] = score;
      
      // Also add to direct field for DB storage
      const fieldConfidenceKey = `confidence_${field}`;
      scoredRecord[fieldConfidenceKey] = score;
      
      // Log confidence score to history
      await logFieldConfidence(record.id, field, score, method, userId);
    }
  }));
  
  // Calculate overall confidence as weighted average
  let totalWeight = 0;
  let weightedSum = 0;
  
  Object.entries(confidenceScores).forEach(([field, score]) => {
    const weight = FIELD_WEIGHTS[field as keyof typeof FIELD_WEIGHTS] || 0.1;
    weightedSum += score * weight;
    totalWeight += weight;
  });
  
  // Store overall confidence
  const overallConfidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
  scoredRecord.contact_score = overallConfidence;
  
  // Store all confidence scores in metadata
  if (!scoredRecord.metadata) scoredRecord.metadata = {};
  scoredRecord.metadata.confidence_scores = confidenceScores;
  scoredRecord.metadata.confidence_calculation = {
    timestamp: new Date().toISOString(),
    source: sourceType,
    overall: overallConfidence
  };
  
  // Check if re-enrichment is needed
  if (shouldTriggerReenrichment(confidenceScores, overallConfidence)) {
    await queueReenrichment(record.id, userId, confidenceScores, overallConfidence);
  }
  
  return scoredRecord;
}

/**
 * Log confidence score for a specific field
 */
async function logFieldConfidence(
  contactId: string,
  fieldName: string,
  confidence: number,
  calcMethod: string,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from('field_confidence_log')
      .insert({
        contact_id: contactId,
        field_name: fieldName,
        confidence,
        calc_method: calcMethod,
        user_id: userId
      });
      
    console.log(`Logged confidence score for ${fieldName}: ${confidence}`);
  } catch (error) {
    console.error('Error logging field confidence:', error);
  }
}

/**
 * Determine if re-enrichment should be triggered based on confidence scores
 */
function shouldTriggerReenrichment(
  scores: Record<string, number>,
  overallConfidence: number
): boolean {
  // Check if overall confidence is below threshold
  if (overallConfidence < CONFIDENCE_THRESHOLDS.overall) {
    return true;
  }
  
  // Check if any critical field is below threshold
  return Object.entries(scores).some(([field, score]) => {
    const threshold = CONFIDENCE_THRESHOLDS[field as keyof typeof CONFIDENCE_THRESHOLDS];
    return threshold && score < threshold;
  });
}

/**
 * Queue a job for re-enrichment
 */
async function queueReenrichment(
  contactId: string,
  userId: string,
  scores: Record<string, number>,
  overallConfidence: number
): Promise<void> {
  try {
    // Find fields that need re-enrichment
    const fieldsToEnrich = Object.entries(scores)
      .filter(([field, score]) => {
        const threshold = CONFIDENCE_THRESHOLDS[field as keyof typeof CONFIDENCE_THRESHOLDS] || 0.5;
        return score < threshold;
      })
      .map(([field]) => field);
    
    if (fieldsToEnrich.length === 0) return;
    
    // Create enrichment job
    await supabase
      .from('enrichment_jobs')
      .insert({
        user_id: userId,
        job_type: 'confidence_reenrichment',
        status: 'pending',
        target_table: 'contacts',
        target_id: contactId,
        parameters: {
          fields_to_enrich: fieldsToEnrich,
          current_scores: scores,
          overall_confidence: overallConfidence,
          trigger: 'low_confidence',
          priority: fieldsToEnrich.includes('email') ? 'high' : 'normal'
        },
        progress: 0
      });
      
    console.log(`Queued re-enrichment for contact ${contactId}, fields: ${fieldsToEnrich.join(', ')}`);
  } catch (error) {
    console.error('Error queueing re-enrichment:', error);
  }
}

/**
 * Get confidence level label from numerical score
 */
export function getConfidenceLevel(score: number): 'high' | 'moderate' | 'low' {
  if (score >= 0.9) return 'high';
  if (score >= 0.7) return 'moderate';
  return 'low';
}

/**
 * Get CSS class for confidence level
 */
export function getConfidenceColor(score: number): string {
  if (score >= 0.9) return 'text-green-600';
  if (score >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get badge background color class for confidence level
 */
export function getConfidenceBadgeColor(score: number): string {
  if (score >= 0.9) return 'bg-green-100 text-green-700';
  if (score >= 0.7) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

/**
 * Get CSS background-color class for confidence level
 */
export function getConfidenceBgColor(score: number): string {
  if (score >= 0.9) return 'bg-green-50';
  if (score >= 0.7) return 'bg-yellow-50';
  return 'bg-red-50';
}

/**
 * Get contact confidence scores from Supabase
 */
export async function getContactConfidence(contactId: string): Promise<ContactConfidence | null> {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        contact_score,
        confidence_email,
        confidence_location,
        confidence_bio,
        confidence_phone,
        confidence_username,
        confidence_name,
        metadata
      `)
      .eq('id', contactId)
      .single();
      
    if (error || !data) {
      console.error('Error fetching contact confidence:', error);
      return null;
    }
    
    // Get timestamp from metadata if available
    const timestamp = data.metadata?.confidence_calculation?.timestamp || 
                     data.metadata?.last_confidence_calculation || 
                     new Date().toISOString();
    
    // Get calculation method
    const method = data.metadata?.confidence_calculation?.source || 
                   data.metadata?.last_confidence_source || 
                   'unknown';
    
    // Build confidence object
    const confidence: ContactConfidence = {
      overall: {
        value: data.contact_score || 0,
        method,
        timestamp
      }
    };
    
    // Add field-specific confidence scores
    CONFIDENCE_FIELDS.forEach(field => {
      const confidenceField = `confidence_${field}` as keyof typeof data;
      if (data[confidenceField]) {
        (confidence as any)[field] = {
          value: data[confidenceField],
          method,
          timestamp
        };
      }
    });
    
    return confidence;
  } catch (error) {
    console.error('Error in getContactConfidence:', error);
    return null;
  }
}

/**
 * Get field confidence history from Supabase
 */
export async function getFieldConfidenceHistory(
  contactId: string,
  fieldName: string,
  limit: number = 10
): Promise<FieldConfidence[]> {
  try {
    const { data, error } = await supabase
      .from('field_confidence_log')
      .select('*')
      .eq('contact_id', contactId)
      .eq('field_name', fieldName)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching field confidence history:', error);
      return [];
    }
    
    return (data || []).map(record => ({
      field: record.field_name,
      value: record.confidence,
      method: record.calc_method,
      timestamp: record.created_at
    }));
  } catch (error) {
    console.error('Error in getFieldConfidenceHistory:', error);
    return [];
  }
}