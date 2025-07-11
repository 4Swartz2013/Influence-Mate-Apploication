import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeHtml = searchParams.get('includeHtml') === 'true'
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

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

    // Select appropriate columns
    let query = supabase
      .from('raw_scrape_results')
      .select(includeHtml ? 
        'id, query, engine, result_rank, target_url, final_url, status_code, html, scraped_at, proxy_id, duration_ms, error_msg' : 
        'id, query, engine, result_rank, target_url, final_url, status_code, scraped_at, proxy_id, duration_ms, error_msg'
      )
      .eq('scrape_job_id', jobId)
      .eq('user_id', user.id)
      .order('result_rank', { ascending: true })
      .limit(limit)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching scrape results:', error)
      return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      results: data || []
    })

  } catch (error) {
    console.error('Scraper results error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}