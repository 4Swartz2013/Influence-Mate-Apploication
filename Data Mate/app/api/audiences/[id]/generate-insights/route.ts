import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GEMINI_API_KEY = 'AIzaSyAkvQ48_ksf5hWCQkmi6MgWTKMjN2rQuik'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

interface Contact {
  id: string
  name: string
  email?: string
  platform?: string
  username?: string
  bio?: string
  follower_count?: number
  engagement_rate?: number
  location?: string
  tags?: string[]
  contact_score?: number
}

interface GeminiInsight {
  persona_label: string
  conversion_likelihood: number
  shared_traits: string[]
  outreach_tone: string
  geo_clusters: string[]
  engagement_prediction: string
  content_themes: string[]
  optimal_timing: string
  risk_factors: string[]
  confidence_score: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audienceId = params.id

    // Get the current user from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify audience belongs to user
    const { data: audience, error: audienceError } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('id', audienceId)
      .eq('user_id', user.id)
      .single()

    if (audienceError || !audience) {
      return NextResponse.json({ error: 'Audience not found' }, { status: 404 })
    }

    // Get audience members
    const { data: memberRows, error: membersError } = await supabase
      .from('audience_members')
      .select('contact_id')
      .eq('audience_segment_id', audienceId)

    if (membersError) {
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    if (!memberRows || memberRows.length === 0) {
      return NextResponse.json({ error: 'No contacts in audience' }, { status: 400 })
    }

    const contactIds = memberRows.map(row => row.contact_id)

    // Fetch contact details
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .in('id', contactIds)
      .limit(50) // Limit for API efficiency

    if (contactsError || !contacts) {
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }

    // Prepare data for Gemini
    const contactSummary = contacts.map(contact => ({
      name: contact.name,
      platform: contact.platform,
      bio: contact.bio?.substring(0, 200), // Truncate for prompt efficiency
      follower_count: contact.follower_count,
      engagement_rate: contact.engagement_rate,
      location: contact.location,
      tags: contact.tags,
      contact_score: contact.contact_score
    }))

    // Build Gemini prompt
    const prompt = `
You are an advanced audience intelligence engine. Analyze the following influencer contact data and return a structured JSON response with deep insights.

Audience: "${audience.name}"
Total Contacts: ${contacts.length}

Contact Data:
${JSON.stringify(contactSummary, null, 2)}

Return a JSON object with the following structure (no additional text, just valid JSON):

{
  "persona_label": "A descriptive 2-3 word persona name (e.g., 'Authentic Educators', 'Tech Innovators')",
  "conversion_likelihood": "Number 0-100 representing likelihood to convert",
  "shared_traits": ["Array of 3-5 common characteristics across contacts"],
  "outreach_tone": "Recommended communication style (professional, casual, educational, etc.)",
  "geo_clusters": ["Array of top 3 geographic regions/countries"],
  "engagement_prediction": "Prediction of best engagement strategies",
  "content_themes": ["Array of 3-5 content topics that resonate"],
  "optimal_timing": "Best times/days for outreach",
  "risk_factors": ["Array of potential challenges or concerns"],
  "confidence_score": "Number 0-100 representing confidence in analysis"
}

Focus on actionable insights based on the actual data provided. Consider follower counts, engagement rates, locations, bios, and platforms to generate meaningful recommendations.
`

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
    }

    const geminiResult = await geminiResponse.json()
    const aiText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiText) {
      return NextResponse.json({ error: 'No AI response received' }, { status: 500 })
    }

    // Parse and validate AI response
    let parsedInsight: GeminiInsight
    try {
      // Clean the response (remove markdown formatting if present)
      const cleanedText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsedInsight = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiText)
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
    }

    // Validate required fields
    const requiredFields = [
      'persona_label', 'conversion_likelihood', 'shared_traits', 
      'outreach_tone', 'geo_clusters', 'engagement_prediction',
      'content_themes', 'optimal_timing', 'risk_factors', 'confidence_score'
    ]

    for (const field of requiredFields) {
      if (!(field in parsedInsight)) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 500 })
      }
    }

    // Store insights in Supabase
    const insightData = {
      user_id: user.id,
      audience_segment_id: audienceId,
      insight_type: 'persona_analysis',
      title: `AI Persona Analysis: ${parsedInsight.persona_label}`,
      description: `Generated persona insights for ${contacts.length} contacts with ${parsedInsight.confidence_score}% confidence`,
      confidence_score: parsedInsight.confidence_score / 100, // Convert to decimal
      actionable_recommendations: [
        `Use ${parsedInsight.outreach_tone} tone in communications`,
        `Focus on ${parsedInsight.content_themes.slice(0, 2).join(' and ')} content themes`,
        `Target ${parsedInsight.geo_clusters[0]} region for highest impact`,
        `Optimal outreach timing: ${parsedInsight.optimal_timing}`
      ],
      data: parsedInsight
    }

    const { data: savedInsight, error: insertError } = await supabase
      .from('audience_insights')
      .insert(insightData)
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save insight:', insertError)
      return NextResponse.json({ error: 'Failed to save insights' }, { status: 500 })
    }

    // Update audience segment with AI persona label
    await supabase
      .from('audience_segments')
      .update({ 
        ai_persona_label: parsedInsight.persona_label,
        outreach_readiness_score: parsedInsight.conversion_likelihood / 100
      })
      .eq('id', audienceId)

    // Create enrichment job record
    await supabase
      .from('enrichment_jobs')
      .insert({
        user_id: user.id,
        job_type: 'persona_analysis',
        status: 'completed',
        target_table: 'audience_segments',
        target_id: audienceId,
        parameters: { contact_count: contacts.length },
        progress: 100,
        results: { insight_id: savedInsight.id },
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      insight: savedInsight,
      persona_label: parsedInsight.persona_label,
      confidence_score: parsedInsight.confidence_score
    })

  } catch (error) {
    console.error('Generate insights error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}