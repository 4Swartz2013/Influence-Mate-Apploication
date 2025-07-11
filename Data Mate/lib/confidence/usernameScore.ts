import { ValidationResult } from './types';

/**
 * Score a username based on various validation criteria
 * @param value Username to score
 * @returns Confidence score between 0 and 1
 */
export function scoreUsername(value: string): number {
  if (!value) return 0;
  
  const result = validateUsername(value);
  return result.score;
}

/**
 * Validate a username and return detailed results
 * @param username Username to validate
 * @returns Validation result with score and details
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || typeof username !== 'string') {
    return { isValid: false, score: 0 };
  }
  
  // Clean up the username - remove @ prefix if present
  const normalizedUsername = username.trim().replace(/^@+/, '');
  if (normalizedUsername.length < 2) {
    return { isValid: false, score: 0 };
  }
  
  let score = 0.4; // Base score for having content
  const details: Record<string, any> = {
    length: normalizedUsername.length,
    normalized: normalizedUsername
  };
  
  // Check length (typical usernames are 3-20 characters)
  if (normalizedUsername.length >= 3) score += 0.1;
  if (normalizedUsername.length <= 20) score += 0.05;
  
  // Check for valid username characters
  const validUsernameRegex = /^[a-zA-Z0-9._-]+$/;
  const hasValidChars = validUsernameRegex.test(normalizedUsername);
  details.hasValidChars = hasValidChars;
  
  if (hasValidChars) {
    score += 0.15;
  }
  
  // Check for spaces (unusual in usernames)
  const hasSpaces = /\s/.test(normalizedUsername);
  details.hasSpaces = hasSpaces;
  
  if (!hasSpaces) {
    score += 0.1;
  } else {
    score -= 0.2; // Significant penalty for spaces
  }
  
  // Check for common patterns found in legitimate usernames
  
  // Alphanumeric pattern common in many platforms
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(normalizedUsername);
  details.isAlphanumeric = isAlphanumeric;
  
  if (isAlphanumeric) score += 0.05;
  
  // Starts with letter (common in many platforms)
  const startsWithLetter = /^[a-zA-Z]/.test(normalizedUsername);
  details.startsWithLetter = startsWithLetter;
  
  if (startsWithLetter) score += 0.05;
  
  // Common separator patterns in usernames
  const hasSeparators = /[._-]/.test(normalizedUsername);
  details.hasSeparators = hasSeparators;
  
  // No penalty or bonus for separators
  
  // Check for excessive numbers (potential low quality)
  const numberRatio = (normalizedUsername.match(/\d/g) || []).length / normalizedUsername.length;
  details.numberRatio = numberRatio;
  
  if (numberRatio > 0.5) {
    score -= 0.1; // Penalty for too many numbers
  }
  
  // Check for common spam patterns
  const spamPatterns = [
    /^\d+$/, // All numbers
    /^admin/, // Starts with admin
    /^test/, // Starts with test
    /^user\d+$/, // user followed by numbers
    /^guest\d*$/, // guest followed by optional numbers
    /^bot\d*$/, // bot followed by optional numbers
  ];
  
  const matchesSpamPattern = spamPatterns.some(pattern => pattern.test(normalizedUsername.toLowerCase()));
  details.matchesSpamPattern = matchesSpamPattern;
  
  if (matchesSpamPattern) {
    score -= 0.2;
  }
  
  // Final score clamping
  const finalScore = Math.max(0, Math.min(score, 1));
  
  return {
    isValid: finalScore >= 0.5,
    score: finalScore,
    details
  };
}