interface ConfidenceScores {
  name: number
  email: number
  username: number
  phone: number
  bio: number
  profile_url: number
  platform: number
  location: number
  overall: number
}

export async function scoreConfidence(
  cleanedData: any,
  externalSource?: string
): Promise<ConfidenceScores> {
  
  const scores: Partial<ConfidenceScores> = {}
  
  // Score each field based on data quality and source reliability
  scores.name = scoreNameConfidence(cleanedData.name, externalSource)
  scores.email = scoreEmailConfidence(cleanedData.email, externalSource)
  scores.username = scoreUsernameConfidence(cleanedData.username, externalSource)
  scores.phone = scorePhoneConfidence(cleanedData.phone, externalSource)
  scores.bio = scoreBioConfidence(cleanedData.bio, externalSource)
  scores.profile_url = scoreUrlConfidence(cleanedData.profile_url, externalSource)
  scores.platform = scorePlatformConfidence(cleanedData.platform, externalSource)
  scores.location = scoreLocationConfidence(cleanedData.location, externalSource)
  
  // Calculate overall confidence as weighted average
  const weights = {
    name: 0.2,
    email: 0.25,
    username: 0.15,
    phone: 0.1,
    bio: 0.1,
    profile_url: 0.05,
    platform: 0.1,
    location: 0.05
  }
  
  let weightedSum = 0
  let totalWeight = 0
  
  Object.entries(weights).forEach(([field, weight]) => {
    const score = scores[field as keyof ConfidenceScores]
    if (score !== undefined && score > 0) {
      weightedSum += score * weight
      totalWeight += weight
    }
  })
  
  scores.overall = totalWeight > 0 ? weightedSum / totalWeight : 0
  
  return scores as ConfidenceScores
}

function getSourceReliability(source?: string): number {
  const reliabilityMap: Record<string, number> = {
    'crm_export': 0.95,
    'manual_entry': 0.9,
    'api_integration': 0.85,
    'scraped_profile': 0.7,
    'uploaded_csv': 0.6,
    'bulk_import': 0.5,
    'unknown': 0.3
  }
  
  return reliabilityMap[source || 'unknown'] || 0.3
}

function scoreNameConfidence(name?: string, source?: string): number {
  if (!name) return 0
  
  let score = 0.5 // Base score
  
  // Quality indicators
  if (name.includes(' ')) score += 0.2 // Has first and last name
  if (name.length >= 3) score += 0.1 // Reasonable length
  if (name.length <= 50) score += 0.1 // Not too long
  if (!/\d/.test(name)) score += 0.1 // No numbers
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scoreEmailConfidence(email?: string, source?: string): number {
  if (!email) return 0
  
  let score = 0.6 // Base score for valid email format
  
  // Quality indicators
  if (!email.includes('+')) score += 0.1 // Not a plus-aliased email
  if (!email.includes('noreply') && !email.includes('donotreply')) score += 0.1
  if (email.split('@')[1]?.includes('.')) score += 0.1 // Valid domain
  if (!email.includes('test') && !email.includes('example')) score += 0.1
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scoreUsernameConfidence(username?: string, source?: string): number {
  if (!username) return 0
  
  let score = 0.5 // Base score
  
  // Quality indicators
  if (username.length >= 3) score += 0.1
  if (username.length <= 30) score += 0.1
  if (!/\s/.test(username)) score += 0.1 // No spaces
  if (!/^[0-9]+$/.test(username)) score += 0.1 // Not all numbers
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scorePhoneConfidence(phone?: string, source?: string): number {
  if (!phone) return 0
  
  let score = 0.5 // Base score
  
  // Quality indicators
  if (phone.startsWith('+')) score += 0.2 // International format
  if (phone.replace(/\D/g, '').length >= 10) score += 0.2 // Sufficient digits
  if (!phone.includes('555')) score += 0.1 // Not a fake number
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scoreBioConfidence(bio?: string, source?: string): number {
  if (!bio) return 0
  
  let score = 0.3 // Base score
  
  // Quality indicators
  if (bio.length >= 20) score += 0.2 // Substantial content
  if (bio.length <= 500) score += 0.1 // Not too long
  if (bio.includes('http')) score += 0.1 // Contains links
  if (!/lorem ipsum/i.test(bio)) score += 0.1 // Not placeholder text
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scoreUrlConfidence(url?: string, source?: string): number {
  if (!url) return 0
  
  let score = 0.4 // Base score
  
  // Quality indicators
  if (url.startsWith('https://')) score += 0.2 // Secure
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) score += 0.2
  if (url.includes('instagram.com') || url.includes('twitter.com') || url.includes('linkedin.com')) score += 0.2
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scorePlatformConfidence(platform?: string, source?: string): number {
  if (!platform) return 0
  
  let score = 0.5 // Base score
  
  // Quality indicators
  const knownPlatforms = ['instagram', 'twitter', 'facebook', 'linkedin', 'youtube', 'tiktok']
  if (knownPlatforms.includes(platform.toLowerCase())) score += 0.3
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}

function scoreLocationConfidence(location?: string, source?: string): number {
  if (!location) return 0
  
  let score = 0.3 // Base score
  
  // Quality indicators
  if (location.length >= 3) score += 0.2
  if (location.includes(',')) score += 0.2 // City, State format
  if (!/\d/.test(location)) score += 0.1 // No numbers (not an address)
  
  // Source reliability
  score *= getSourceReliability(source)
  
  return Math.min(score, 1)
}