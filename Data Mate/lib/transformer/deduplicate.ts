import { supabase } from '@/lib/supabase'

interface DeduplicationResult {
  isDuplicate: boolean
  existingContactId?: string
  similarityScore?: number
  matchType?: 'email' | 'username_platform' | 'name_bio' | 'phone'
}

export async function deduplicate(
  cleanedData: any,
  userId: string
): Promise<DeduplicationResult> {
  
  // Strategy 1: Exact email match (highest priority)
  if (cleanedData.email) {
    const { data: emailMatch } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('email', cleanedData.email)
      .limit(1)
      .single()

    if (emailMatch) {
      return {
        isDuplicate: true,
        existingContactId: emailMatch.id,
        similarityScore: 1.0,
        matchType: 'email'
      }
    }
  }

  // Strategy 2: Username + Platform combination
  if (cleanedData.username && cleanedData.platform) {
    const { data: usernameMatch } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('username', cleanedData.username)
      .eq('platform', cleanedData.platform)
      .limit(1)
      .single()

    if (usernameMatch) {
      return {
        isDuplicate: true,
        existingContactId: usernameMatch.id,
        similarityScore: 0.95,
        matchType: 'username_platform'
      }
    }
  }

  // Strategy 3: Phone number match
  if (cleanedData.phone) {
    const { data: phoneMatch } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('phone', cleanedData.phone)
      .limit(1)
      .single()

    if (phoneMatch) {
      return {
        isDuplicate: true,
        existingContactId: phoneMatch.id,
        similarityScore: 0.9,
        matchType: 'phone'
      }
    }
  }

  // Strategy 4: Fuzzy name + bio similarity (for contacts without unique identifiers)
  if (cleanedData.name && cleanedData.bio) {
    const similarityResult = await findSimilarContacts(cleanedData, userId)
    if (similarityResult.isDuplicate) {
      return similarityResult
    }
  }

  return { isDuplicate: false }
}

async function findSimilarContacts(
  cleanedData: any,
  userId: string
): Promise<DeduplicationResult> {
  
  // Get all contacts for this user with names and bios
  const { data: existingContacts } = await supabase
    .from('contacts')
    .select('id, name, bio')
    .eq('user_id', userId)
    .not('name', 'is', null)
    .not('bio', 'is', null)

  if (!existingContacts || existingContacts.length === 0) {
    return { isDuplicate: false }
  }

  let bestMatch: { id: string; score: number } | null = null

  for (const contact of existingContacts) {
    const nameScore = calculateStringSimilarity(cleanedData.name, contact.name)
    const bioScore = calculateStringSimilarity(cleanedData.bio, contact.bio)
    
    // Weighted average: name is more important than bio
    const overallScore = (nameScore * 0.7) + (bioScore * 0.3)
    
    if (overallScore > 0.85 && (!bestMatch || overallScore > bestMatch.score)) {
      bestMatch = { id: contact.id, score: overallScore }
    }
  }

  if (bestMatch && bestMatch.score > 0.85) {
    return {
      isDuplicate: true,
      existingContactId: bestMatch.id,
      similarityScore: bestMatch.score,
      matchType: 'name_bio'
    }
  }

  return { isDuplicate: false }
}

function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  
  // Normalize strings
  const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ')
  const s1 = normalize(str1)
  const s2 = normalize(str2)
  
  if (s1 === s2) return 1
  
  // Use Levenshtein distance for similarity
  const distance = levenshteinDistance(s1, s2)
  const maxLength = Math.max(s1.length, s2.length)
  
  return maxLength === 0 ? 1 : 1 - (distance / maxLength)
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}