import { Client } from "@googlemaps/google-maps-services-js";
import { ValidationResult } from './types';

// Create Google Maps client
const geocodingClient = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Cache for geocoding results to minimize API calls
const geocodingCache = new Map<string, any>();

/**
 * Score a location string based on various validation criteria
 * @param value Location string to score
 * @returns Confidence score between 0 and 1
 */
export async function scoreLocation(value: string): Promise<number> {
  if (!value) return 0;
  
  const result = await validateLocation(value);
  return result.score;
}

/**
 * Validate a location string and return detailed results
 * @param location Location string to validate
 * @returns Validation result with score and details
 */
export async function validateLocation(location: string): Promise<ValidationResult> {
  if (!location || typeof location !== 'string') {
    return { isValid: false, score: 0 };
  }
  
  const normalizedLocation = location.trim();
  if (normalizedLocation.length < 3) {
    return { isValid: false, score: 0 };
  }
  
  let score = 0.4; // Base score for having non-empty content
  const details: Record<string, any> = { normalized: normalizedLocation };
  
  // Format checks
  if (normalizedLocation.includes(',')) {
    score += 0.1; // Comma suggests city,state or city,country format
    details.hasComma = true;
  }
  
  // Check for proper capitalization
  const hasProperCapitalization = /[A-Z][a-z]+/.test(normalizedLocation);
  details.properCapitalization = hasProperCapitalization;
  if (hasProperCapitalization) score += 0.1;
  
  // Check for numbers (less common in legitimate locations)
  const hasNumbers = /\d/.test(normalizedLocation);
  details.hasNumbers = hasNumbers;
  if (!hasNumbers) score += 0.05;
  
  // Common place names detection (basic)
  const commonPlaceIndicators = [
    'street', 'avenue', 'road', 'blvd', 'city', 'town', 'village', 
    'district', 'county', 'state', 'province', 'country', 'region'
  ];
  
  const lowerLocation = normalizedLocation.toLowerCase();
  const hasPlaceIndicator = commonPlaceIndicators.some(indicator => 
    lowerLocation.includes(indicator)
  );
  
  details.hasPlaceIndicator = hasPlaceIndicator;
  if (hasPlaceIndicator) score += 0.05;
  
  // Check if this is a known major city or country
  const majorLocations = [
    'new york', 'london', 'tokyo', 'paris', 'berlin', 'sydney', 
    'los angeles', 'chicago', 'beijing', 'moscow', 'toronto', 'dubai',
    'usa', 'uk', 'canada', 'australia', 'germany', 'france', 'japan', 'china'
  ];
  
  const isMajorLocation = majorLocations.some(major => 
    lowerLocation.includes(major)
  );
  
  details.isMajorLocation = isMajorLocation;
  if (isMajorLocation) score += 0.1;
  
  // Geocoding validation (only if API key is available and score is promising)
  if (API_KEY && score >= 0.6) {
    try {
      // Check cache first
      let geocodingResult;
      if (geocodingCache.has(normalizedLocation)) {
        geocodingResult = geocodingCache.get(normalizedLocation);
      } else {
        // Make API call
        const response = await geocodingClient.geocode({
          params: {
            address: normalizedLocation,
            key: API_KEY
          }
        });
        
        geocodingResult = response.data;
        // Cache the result
        geocodingCache.set(normalizedLocation, geocodingResult);
      }
      
      if (geocodingResult.results.length > 0) {
        const result = geocodingResult.results[0];
        details.geocoding = {
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          locationType: result.geometry.location_type,
          types: result.types
        };
        
        // Add confidence based on result type
        if (result.geometry.location_type === 'ROOFTOP') {
          score += 0.3; // Exact match
        } else if (result.geometry.location_type === 'RANGE_INTERPOLATED') {
          score += 0.2; // Close match
        } else if (result.geometry.location_type === 'GEOMETRIC_CENTER') {
          score += 0.15; // Area center
        } else {
          score += 0.1; // Approximate
        }
      }
    } catch (error) {
      details.geocodingError = true;
      // Don't penalize for API errors
    }
  }
  
  // Final score clamping
  const finalScore = Math.max(0, Math.min(score, 1));
  
  return {
    isValid: finalScore >= 0.5,
    score: finalScore,
    details
  };
}