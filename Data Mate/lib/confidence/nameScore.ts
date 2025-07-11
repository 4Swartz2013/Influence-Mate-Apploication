import levenshtein from 'fast-levenshtein';
import { ValidationResult } from './types';

/**
 * Score a name string based on various validation criteria
 * @param value Name string to score
 * @returns Confidence score between 0 and 1
 */
export function scoreName(value: string): number {
  if (!value) return 0;
  
  const result = validateName(value);
  return result.score;
}

/**
 * Validate a name string and return detailed results
 * @param name Name string to validate
 * @returns Validation result with score and details
 */
export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { isValid: false, score: 0 };
  }
  
  const normalizedName = name.trim();
  if (normalizedName.length < 2) {
    return { isValid: false, score: 0 };
  }
  
  let score = 0.4; // Base score for having content
  const details: Record<string, any> = {
    length: normalizedName.length,
    normalized: normalizedName
  };
  
  // Check for full name (first and last)
  const hasTwoParts = normalizedName.includes(' ');
  details.hasTwoParts = hasTwoParts;
  
  if (hasTwoParts) {
    score += 0.2; // Significant boost for having first and last name
    
    // Check word count
    const parts = normalizedName.split(/\s+/).filter(p => p.length > 0);
    details.partCount = parts.length;
    
    if (parts.length === 2) {
      score += 0.05; // Most common format: first + last
    } else if (parts.length === 3) {
      score += 0.1; // Could include middle name
    } else if (parts.length > 3) {
      score += 0.05; // Could be cultural with more names, still good
    }
  }
  
  // Check for proper capitalization
  const hasProperCapitalization = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(normalizedName);
  details.properCapitalization = hasProperCapitalization;
  
  if (hasProperCapitalization) {
    score += 0.1;
  }
  
  // Check for reasonable length
  if (normalizedName.length >= 4 && normalizedName.length <= 40) {
    score += 0.1;
  }
  
  // Check for numbers (unusual in real names)
  const hasNumbers = /\d/.test(normalizedName);
  details.hasNumbers = hasNumbers;
  
  if (hasNumbers) {
    score -= 0.2; // Significant penalty for numbers in name
  }
  
  // Check for special characters (unusual in most names)
  const hasSpecialChars = /[^a-zA-Z\s\-'.]/.test(normalizedName);
  details.hasSpecialChars = hasSpecialChars;
  
  if (hasSpecialChars) {
    score -= 0.1; // Penalty for special characters
  }
  
  // Check for valid name characters (allow hyphen and apostrophe)
  const isValidNameChars = /^[a-zA-Z\s\-'.]+$/.test(normalizedName);
  details.isValidNameChars = isValidNameChars;
  
  if (isValidNameChars) {
    score += 0.1;
  }
  
  // Check against common fake names
  const fakeNames = [
    'john doe', 'jane doe', 'test user', 'test name', 'admin',
    'user', 'fake name', 'anonymous', 'unknown', 'no name'
  ];
  
  const lowerName = normalizedName.toLowerCase();
  const isFakeName = fakeNames.some(fake => 
    levenshtein.get(lowerName, fake) <= 2 // Allow small typos
  );
  
  details.isFakeName = isFakeName;
  
  if (isFakeName) {
    score -= 0.3; // Severe penalty for fake names
  }
  
  // Final score clamping
  const finalScore = Math.max(0, Math.min(score, 1));
  
  return {
    isValid: finalScore >= 0.5,
    score: finalScore,
    details
  };
}