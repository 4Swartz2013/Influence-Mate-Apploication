import { isEmail } from "validator";
import dns from "dns/promises";
import disposable from "disposable-email-domains";
import { ValidationResult } from './types';

/**
 * Score an email address based on various validation criteria
 * @param value Email address to score
 * @returns Confidence score between 0 and 1
 */
export async function scoreEmail(value: string): Promise<number> {
  if (!value) return 0;
  
  const result = await validateEmail(value);
  return result.score;
}

/**
 * Validate an email address and return detailed results
 * @param email Email address to validate
 * @returns Validation result with score and details
 */
export async function validateEmail(email: string): Promise<ValidationResult> {
  if (!email || typeof email !== 'string') {
    return { isValid: false, score: 0 };
  }
  
  // Basic format check
  if (!isEmail(email)) {
    return { isValid: false, score: 0 };
  }
  
  let score = 0.5; // Base score for valid format
  const details: Record<string, any> = {};
  
  // Extract domain
  const domain = email.split('@')[1].toLowerCase();
  details.domain = domain;
  
  // Check for disposable email
  const isDisposable = disposable.includes(domain);
  details.isDisposable = isDisposable;
  
  if (isDisposable) {
    score -= 0.3; // Heavy penalty for disposable emails
  }
  
  // Check for common domains (higher confidence)
  const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com'];
  const isCommonDomain = commonDomains.includes(domain);
  details.isCommonDomain = isCommonDomain;
  
  if (isCommonDomain) {
    score += 0.1; // Slight boost for common domains
  }
  
  // Check for business domains (higher confidence)
  const isBusinessEmail = !isCommonDomain && !isDisposable;
  details.isBusinessEmail = isBusinessEmail;
  
  if (isBusinessEmail) {
    score += 0.2; // Higher boost for business emails
  }
  
  // Check for MX records
  let hasMxRecords = false;
  try {
    const mxRecords = await dns.resolveMx(domain).catch(() => []);
    hasMxRecords = mxRecords.length > 0;
    details.hasMxRecords = hasMxRecords;
    
    if (hasMxRecords) {
      score += 0.2; // Significant boost for valid MX
    }
  } catch (error) {
    details.mxLookupFailed = true;
  }
  
  // Additional quality checks
  if (!email.includes('+')) score += 0.05; // Not using plus addressing
  if (!domain.includes('.test') && !domain.includes('.example')) score += 0.05;
  if (email.length < 50) score += 0.05; // Reasonable length
  
  // Format the username for analysis
  const username = email.split('@')[0].toLowerCase();
  details.username = username;
  
  // Username quality checks
  if (username.length >= 4) score += 0.05; // Reasonable username length
  if (/^[a-z0-9._-]+$/.test(username)) score += 0.05; // Clean format
  if (!/\d{4,}/.test(username)) score += 0.05; // Not too many digits
  
  // Final score clamping
  const finalScore = Math.max(0, Math.min(score, 1));
  
  return {
    isValid: finalScore >= 0.5,
    score: finalScore,
    details
  };
}