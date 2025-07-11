export { transformPipeline } from './transformPipeline'
export type { RawContactInput, TransformResult } from './transformPipeline'
export { cleanFields } from './cleanFields'
export { deduplicate } from './deduplicate'
export { mapSchema } from './mapSchema'
export { scoreConfidence } from './scoreConfidence'

// Utility function for bulk processing
export async function processBulkContacts(
  contacts: any[],
  userId: string,
  externalSource: string
) {
  const results = []
  
  for (const contact of contacts) {
    const rawInput = {
      ...contact,
      user_id: userId,
      external_source: externalSource,
      raw_record: contact
    }
    
    const result = await transformPipeline(rawInput)
    results.push(result)
  }
  
  return results
}

// Utility function for CSV processing
export function parseCSVToContacts(csvContent: string): any[] {
  const lines = csvContent.split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const contacts = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    if (values.length === headers.length) {
      const contact: any = {}
      headers.forEach((header, index) => {
        if (values[index]) {
          contact[header] = values[index]
        }
      })
      contacts.push(contact)
    }
  }
  
  return contacts
}