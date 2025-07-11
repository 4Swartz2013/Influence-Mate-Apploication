import linkifyIt from 'linkify-it';
import { ValidationResult } from './types';
const linkify = linkifyIt();

/**
 * Score a bio string based on various quality criteria
 * @param value Bio string to score
 * @returns Confidence score between 0 and 1
 */
export function scoreBio(value: string): number {
  if (!value) return 0;
  
  const result = validateBio(value);
  return result.score;
}

/**
 * Validate a bio string and return detailed results
 * @param bio Bio string to validate
 * @returns Validation result with score and details
 */
export function validateBio(bio: string): ValidationResult {
  if (!bio || typeof bio !== 'string') {
    return { isValid: false, score: 0 };
  }
  
  const normalizedBio = bio.trim();
  if (normalizedBio.length < 10) {
    return { isValid: false, score: 0 };
  }
  
  let score = 0.4; // Base score for having non-empty content
  const details: Record<string, any> = {
    length: normalizedBio.length,
    normalized: normalizedBio
  };
  
  // Check content length (quality indicator)
  const wordCount = normalizedBio.split(/\s+/).length;
  details.wordCount = wordCount;
  
  if (wordCount >= 5) score += 0.05;
  if (wordCount >= 10) score += 0.05;
  if (wordCount >= 20) score += 0.1;
  if (wordCount > 100) score -= 0.05; // Penalize extremely long bios
  
  // Check for links (good for credibility)
  const links = linkify.match(normalizedBio) || [];
  details.linkCount = links.length;
  
  if (links.length > 0) score += 0.1;
  if (links.length > 3) score -= 0.05; // Penalize too many links (spam indicator)
  
  // Check for professional terms
  const professionalTerms = [
    'professional', 'specialist', 'expert', 'founder',
    'CEO', 'manager', 'director', 'graduate', 'PhD', 
    'award', 'certified', 'licensed', 'author'
  ];
  
  const lowerBio = normalizedBio.toLowerCase();
  const professionalMatches = professionalTerms.filter(term => 
    lowerBio.includes(term.toLowerCase())
  );
  
  details.professionalTerms = professionalMatches.length > 0 ? professionalMatches : undefined;
  
  if (professionalMatches.length > 0) {
    score += Math.min(0.15, professionalMatches.length * 0.05);
  }
  
  // Check for spam indicators
  const spamIndicators = [
    'lorem ipsum', 'click here', 'buy now', 'free', 'discount', 
    'sale', 'best price', 'earn money', 'make money',
    'contact me for', 'bio goes here', 'test bio'
  ];
  
  const spamMatches = spamIndicators.filter(term =>
    lowerBio.includes(term.toLowerCase())
  );
  
  details.spamIndicators = spamMatches.length > 0 ? spamMatches : undefined;
  
  if (spamMatches.length > 0) {
    score -= Math.min(0.3, spamMatches.length * 0.1);
  }
  
  // Check for emoji density (potential indicator of spam or non-professional content)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiMatches = normalizedBio.match(emojiRegex) || [];
  const emojiDensity = emojiMatches.length / normalizedBio.length;
  
  details.emojiCount = emojiMatches.length;
  details.emojiDensity = emojiDensity;
  
  // Some emojis are okay, but too many is a negative
  if (emojiMatches.length > 0 && emojiMatches.length <= 3) {
    score += 0.05; // A few emojis are fine
  } else if (emojiDensity > 0.1) {
    score -= Math.min(0.2, emojiDensity); // Too many emojis
  }
  
  // Check sentence structure
  const sentences = normalizedBio
    .replace(/([.!?])\s*(?=[A-Za-z])/g, "$1|")
    .split("|");
  
  details.sentenceCount = sentences.length;
  
  if (sentences.length >= 2) {
    score += 0.1; // Multiple sentences suggest real content
  }
  
  // Check for first-person narrative (typical for real bios)
  const firstPersonIndicators = ['i am', 'i\'m', 'my', 'i have', 'i work', 'i create', 'i love', 'i enjoy'];
  const firstPersonMatches = firstPersonIndicators.filter(term =>
    lowerBio.includes(term.toLowerCase())
  );
  
  details.firstPersonIndicators = firstPersonMatches.length > 0 ? firstPersonMatches : undefined;
  
  if (firstPersonMatches.length > 0) {
    score += 0.1;
  }
  
  // Final score clamping
  const finalScore = Math.max(0, Math.min(score, 1));
  
  return {
    isValid: finalScore >= 0.5,
    score: finalScore,
    details
  };
}