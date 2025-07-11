import { RawContactInput } from './transformPipeline'

interface FieldMapping {
  [originalField: string]: string
}

const FIELD_PATTERNS = {
  name: [
    'name', 'full_name', 'fullname', 'display_name', 'displayname',
    'first_name', 'firstname', 'last_name', 'lastname', 'contact_name',
    'person_name', 'individual_name', 'real_name', 'realname'
  ],
  email: [
    'email', 'email_address', 'emailaddress', 'e_mail', 'mail',
    'contact_email', 'primary_email', 'work_email', 'business_email'
  ],
  username: [
    'username', 'user_name', 'handle', 'screen_name', 'screenname',
    'social_handle', 'ig_handle', 'twitter_handle', 'insta_username',
    'social_username', 'profile_name', 'account_name'
  ],
  phone: [
    'phone', 'phone_number', 'phonenumber', 'mobile', 'cell',
    'telephone', 'contact_number', 'primary_phone', 'work_phone'
  ],
  bio: [
    'bio', 'biography', 'description', 'about', 'profile_description',
    'summary', 'intro', 'introduction', 'profile_bio', 'user_bio'
  ],
  profile_url: [
    'profile_url', 'profileurl', 'url', 'link', 'profile_link',
    'social_url', 'page_url', 'account_url', 'profile', 'social_link'
  ],
  platform: [
    'platform', 'social_platform', 'network', 'source', 'channel',
    'social_network', 'site', 'service', 'provider'
  ],
  location: [
    'location', 'city', 'country', 'region', 'address', 'place',
    'geographic_location', 'geo_location', 'residence', 'hometown'
  ]
}

export async function mapSchema(rawInput: RawContactInput): Promise<FieldMapping> {
  const mappings: FieldMapping = {}
  const rawRecord = rawInput.raw_record

  if (!rawRecord || typeof rawRecord !== 'object') {
    return mappings
  }

  // Get all keys from the raw record
  const rawKeys = Object.keys(rawRecord).map(key => key.toLowerCase().trim())

  // Map each field using pattern matching
  Object.entries(FIELD_PATTERNS).forEach(([targetField, patterns]) => {
    // First, check if the field exists directly in rawInput
    if (rawInput[targetField as keyof RawContactInput]) {
      mappings[targetField] = targetField
      return
    }

    // Then check for pattern matches in raw record
    for (const pattern of patterns) {
      const matchingKey = rawKeys.find(key => {
        // Exact match
        if (key === pattern) return true
        
        // Contains match
        if (key.includes(pattern) || pattern.includes(key)) return true
        
        // Fuzzy match (remove common separators)
        const normalizedKey = key.replace(/[_\-\s]/g, '')
        const normalizedPattern = pattern.replace(/[_\-\s]/g, '')
        if (normalizedKey === normalizedPattern) return true
        
        return false
      })

      if (matchingKey) {
        // Find the original key (with proper casing)
        const originalKey = Object.keys(rawRecord).find(
          k => k.toLowerCase().trim() === matchingKey
        )
        if (originalKey) {
          mappings[originalKey] = targetField
          break
        }
      }
    }
  })

  // Store mapping log for future learning
  await storeFieldMappingLog(rawInput.user_id, rawInput.external_source, mappings, rawKeys)

  return mappings
}

async function storeFieldMappingLog(
  userId: string,
  externalSource: string | undefined,
  mappings: FieldMapping,
  rawKeys: string[]
) {
  try {
    // This would be stored in a separate table for ML learning in the future
    console.log('Field mapping log:', {
      userId,
      externalSource,
      mappings,
      rawKeys,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to store field mapping log:', error)
  }
}

export function getFieldValue(rawRecord: any, fieldMapping: FieldMapping, targetField: string): any {
  // Find the original field name that maps to our target field
  const originalField = Object.keys(fieldMapping).find(
    key => fieldMapping[key] === targetField
  )

  if (originalField && rawRecord[originalField] !== undefined) {
    return rawRecord[originalField]
  }

  // Fallback: try direct access
  return rawRecord[targetField]
}