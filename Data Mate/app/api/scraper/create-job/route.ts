import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const { 
      query, 
      enrichmentJobId,
      maxResults = 10,
      engines = ['google', 'bing', 'ddg']
    } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Create scraper job
    const { data: job, error: jobError } = await supabase
      .from('scraper_jobs')
      .insert({
        user_id: user.id,
        query,
        enrichment_job_id: enrichmentJobId,
        max_results: maxResults,
        engines,
        status: 'pending'
      })
      .select()
      .single()
    
    if (jobError) {
      console.error('Error creating scraper job:', jobError)
      return NextResponse.json({ error: 'Failed to create scraper job' }, { status: 500 })
    }

    // Update enrichment job if provided
    if (enrichmentJobId) {
      await supabase
        .from('enrichment_jobs')
        .update({ 
          scrape_job_id: job.id,
          status: 'processing',
          progress: 10,
          parameters: { 
            ...job.parameters || {},
            scrape_query: query,
            scrape_job_id: job.id
          }
        })
        .eq('id', enrichmentJobId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        query: job.query,
        status: job.status
      }
    })

  } catch (error) {
    console.error('Scraper job creation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}