import { getFieldValue } from './mapSchema'

interface CleanedContact {
  name?: string
  email?: string
  username?: string
  phone?: string
  bio?: string
  profile_url?: string
  platform?: string
  location?: string
}

export async function cleanFields(
  rawInput: any,
  fieldMappings: Record<string, string>
): Promise<CleanedContact> {
  const cleaned: CleanedContact = {}

  // Clean name
  const rawName = getFieldValue(rawInput.raw_record, fieldMappings, 'name') || rawInput.name
  if (rawName) {
    cleaned.name = cleanName(rawName)
  }

  // Clean email
  const rawEmail = getFieldValue(rawInput.raw_record, fieldMappings, 'email') || rawInput.email
  if (rawEmail) {
    cleaned.email = cleanEmail(rawEmail)
  }

  // Clean username
  const rawUsername = getFieldValue(rawInput.raw_record, fieldMappings, 'username') || rawInput.username
  if (rawUsername) {
    cleaned.username = cleanUsername(rawUsername)
  }

  // Clean phone
  const rawPhone = getFieldValue(rawInput.raw_record, fieldMappings, 'phone') || rawInput.phone
  if (rawPhone) {
    cleaned.phone = cleanPhone(rawPhone)
  }

  // Clean bio
  const rawBio = getFieldValue(rawInput.raw_record, fieldMappings, 'bio') || rawInput.bio
  if (rawBio) {
    cleaned.bio = cleanBio(rawBio)
  }

  // Clean profile URL
  const rawProfileUrl = getFieldValue(rawInput.raw_record, fieldMappings, 'profile_url') || rawInput.profile_url
  if (rawProfileUrl) {
    cleaned.profile_url = cleanUrl(rawProfileUrl)
  }

  // Clean platform
  const rawPlatform = getFieldValue(rawInput.raw_record, fieldMappings, 'platform') || rawInput.platform
  if (rawPlatform) {
    cleaned.platform = cleanPlatform(rawPlatform)
  }

  // Clean location
  const rawLocation = getFieldValue(rawInput.raw_record, fieldMappings, 'location') || rawInput.location
  if (rawLocation) {
    cleaned.location = cleanLocation(rawLocation)
  }

  return cleaned
}

function cleanName(name: string): string {
  if (!name || typeof name !== 'string') return ''
  
  return name
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[^\w\s\-'\.]/g, '') // Remove special chars except common name chars
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function cleanEmail(email: string): string | undefined {
  if (!email || typeof email !== 'string') return undefined
  
  const cleaned = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(cleaned) ? cleaned : undefined
}

function cleanUsername(username: string): string {
  if (!username || typeof username !== 'string') return ''
  
  return username
    .trim()
    .toLowerCase()
    .replace(/^@+/, '') // Remove leading @
    .replace(/\/+$/, '') // Remove trailing slashes
    .replace(/[^\w\-\.]/g, '') // Keep only alphanumeric, hyphens, dots
}

function cleanPhone(phone: string): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined
  
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '')
  
  // Basic validation - should have at least 10 digits
  if (digits.length < 10) return undefined
  
  // Format as international if it looks like US number
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  return `+${digits}`
}

function cleanBio(bio: string): string {
  if (!bio || typeof bio !== 'string') return ''
  
  return bio
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[\r\n]+/g, ' ') // Line breaks to spaces
    .replace(/[^\w\s\-'\".,!?@#$%&*()]/g, '') // Remove most special chars but keep common punctuation
    .substring(0, 500) // Limit length
}

function cleanUrl(url: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined
  
  try {
    let cleanUrl = url.trim()
    
    // Add protocol if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl
    }
    
    const urlObj = new URL(cleanUrl)
    
    // Remove UTM parameters and tracking
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
    return urlObj.toString()
  } catch {
    return undefined
  }
}

function cleanPlatform(platform: string): string {
  if (!platform || typeof platform !== 'string') return ''
  
  const normalized = platform.toLowerCase().trim()
  
  // Normalize common platform names
  const platformMap: Record<string, string> = {
    'ig': 'instagram',
    'insta': 'instagram',
    'fb': 'facebook',
    'tw': 'twitter',
    'x': 'twitter',
    'yt': 'youtube',
    'li': 'linkedin',
    'tk': 'tiktok',
    'tik tok': 'tiktok'
  }
  
  return platformMap[normalized] || normalized
}

function cleanLocation(location: string): string {
  if (!location || typeof location !== 'string') return ''
  
  return location
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .substring(0, 100) // Limit length
}