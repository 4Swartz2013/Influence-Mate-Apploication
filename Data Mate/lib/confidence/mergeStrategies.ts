import { FieldData, MergeStrategy } from './types';

/**
 * Merges field data from multiple sources using the specified strategy
 * @param values Array of field data with confidence scores
 * @param strategy Merge strategy to use
 * @returns Merged field data
 */
export function mergeConfidence(
  values: FieldData[],
  strategy: MergeStrategy = 'max'
): FieldData {
  if (!values.length) throw new Error('No values to merge');
  if (values.length === 1) return values[0];
  
  // Sort by confidence (highest first)
  const sorted = [...values].sort((a, b) => b.confidence - a.confidence);
  
  switch (strategy) {
    case 'max':
      // Return highest confidence value
      return sorted[0];
      
    case 'weighted':
      // Weight by confidence and return weighted result
      const totalWeight = values.reduce((sum, v) => sum + v.confidence, 0);
      if (totalWeight === 0) return sorted[0]; // Fallback if all zero
      
      // For weighted, we still use highest confidence value but adjust its confidence score
      const weightedConfidence = values.reduce((sum, v) => sum + (v.confidence * v.confidence), 0) / totalWeight;
      
      return {
        ...sorted[0],
        confidence: weightedConfidence
      };
      
    case 'average':
      // Average confidence but use highest value
      const avgConfidence = values.reduce((sum, v) => sum + v.confidence, 0) / values.length;
      
      return {
        ...sorted[0],
        confidence: avgConfidence
      };
      
    case 'first':
      // First value chronologically
      return values
        .filter(v => v.timestamp)
        .sort((a, b) => 
          (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0)
        )[0] || sorted[0];
        
    case 'last':
      // Last value chronologically
      return values
        .filter(v => v.timestamp)
        .sort((a, b) => 
          (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
        )[0] || sorted[0];
        
    default:
      return sorted[0];
  }
}

/**
 * Determine the best merge strategy based on field type
 * @param fieldName Name of the field
 * @returns Appropriate merge strategy for the field
 */
export function getMergeStrategyForField(fieldName: string): MergeStrategy {
  switch (fieldName) {
    case 'email':
      return 'max';  // Emails are high-stakes, use highest confidence
      
    case 'name':
      return 'weighted';  // Names can vary, use weighted approach
      
    case 'bio':
      return 'last';  // Bios change over time, use most recent
      
    case 'location':
      return 'max';  // Locations need to be accurate
      
    case 'phone':
      return 'max';  // Phone numbers need to be accurate
      
    case 'username':
      return 'weighted';  // Usernames can have variations
      
    default:
      return 'max';  // Default to highest confidence
  }
}

/**
 * Determine whether to use a new value or keep the existing value
 * based on confidence scores
 * @param existingValue Current value
 * @param existingConfidence Confidence in current value
 * @param newValue New value
 * @param newConfidence Confidence in new value
 * @param strategy Optional override for merge strategy
 * @returns The value to use
 */
export function chooseValue(
  existingValue: string | null | undefined,
  existingConfidence: number,
  newValue: string,
  newConfidence: number,
  strategy: MergeStrategy = 'max'
): string {
  // If no existing value, use new value
  if (!existingValue) return newValue;
  
  // Strategy-specific logic
  switch (strategy) {
    case 'max':
      return newConfidence > existingConfidence ? newValue : existingValue;
      
    case 'weighted':
      // Use weighted decision with threshold
      const confidenceDiff = newConfidence - existingConfidence;
      // Only replace if new confidence is significantly better
      return confidenceDiff > 0.15 ? newValue : existingValue;
      
    case 'last':
      // Always use new value for 'last' strategy
      return newValue;
      
    case 'first':
      // Always keep existing value for 'first' strategy
      return existingValue;
      
    case 'average':
      // Use higher confidence unless very close
      return Math.abs(newConfidence - existingConfidence) < 0.1 ? 
        existingValue : // Keep existing if very similar confidence
        (newConfidence > existingConfidence ? newValue : existingValue);
      
    default:
      return newConfidence > existingConfidence ? newValue : existingValue;
  }
}