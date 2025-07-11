import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ValidationResult } from './types';

/**
 * Score a phone number based on various validation criteria
 * @param value Phone number to score
 * @returns Confidence score between 0 and 1
 */
export function scorePhone(value: string): number {
  if (!value) return 0;
  
  const result = validatePhone(value);
  return result.score;
}

/**
 * Validate a phone number and return detailed results
 * @param phone Phone number to validate
 * @returns Validation result with score and details
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, score: 0 };
  }
  
  let score = 0.3; // Base score for having content
  const details: Record<string, any> = { original: phone };
  
  // Parse with libphonenumber-js
  const phoneNumber = parsePhoneNumberFromString(phone);
  
  if (!phoneNumber) {
    return { 
      isValid: false, 
      score: Math.max(0, Math.min(score, 1)),
      details: { ...details, parseError: true }
    };
  }
  
  // Store parsed details
  details.parsed = {
    countryCode: phoneNumber.country,
    nationalNumber: phoneNumber.nationalNumber,
    formatNational: phoneNumber.formatNational(),
    formatInternational: phoneNumber.formatInternational()
  };
  
  // Check if phone number is valid
  const isValid = phoneNumber.isValid();
  details.isValid = isValid;
  
  if (isValid) {
    score += 0.3; // Significant boost for valid number
  } else {
    return { 
      isValid: false, 
      score: Math.max(0, Math.min(score, 1)), 
      details 
    };
  }
  
  // Check if it has proper country code
  if (phoneNumber.countryCallingCode) {
    score += 0.1;
    details.hasCountryCode = true;
  }
  
  // Check if number is possible
  if (phoneNumber.isPossible()) {
    score += 0.1;
    details.isPossible = true;
  }
  
  // Check for toll-free numbers (could be spam or business)
  const tollFreePatterns = /^(800|844|855|866|877|888)/;
  const isTollFree = tollFreePatterns.test(phoneNumber.nationalNumber.toString());
  details.isTollFree = isTollFree;
  
  // Toll-free could be legitimate business or spam, so no score adjustment
  
  // Check for bogus prefixes like 555 (often used in fake numbers)
  const hasBogusPrefix = phoneNumber.nationalNumber.toString().startsWith('555');
  details.hasBogusPrefix = hasBogusPrefix;
  
  if (hasBogusPrefix) {
    score -= 0.2; // Penalty for bogus prefix
  }
  
  // Final score clamping
  const finalScore = Math.max(0, Math.min(score, 1));
  
  return {
    isValid: finalScore >= 0.5,
    score: finalScore,
    details
  };
}