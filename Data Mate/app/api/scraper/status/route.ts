import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get the job ID from the query string
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
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

    // Get job status
    const { data: job, error: jobError } = await supabase
      .from('scraper_jobs')
      .select(`
        id,
        status,
        query,
        current_engine,
        results_found,
        error_msg,
        start_time,
        end_time,
        created_at,
        updated_at
      `)
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()
    
    if (jobError) {
      console.error('Error fetching scraper job:', jobError)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get result summary if job is completed
    let results = null
    let errorLogs = null
    
    if (job.status === 'completed' || job.status === 'failed') {
      // Get result count by status code
      const { data: resultStats } = await supabase
        .from('raw_scrape_results')
        .select('status_code, count')
        .eq('scrape_job_id', jobId)
        .eq('user_id', user.id)
        .group('status_code')
      
      // Get error logs if any
      if (job.status === 'failed') {
        const { data: logs } = await supabase
          .from('crawler_error_logs')
          .select('error_type, error_message, engine, url')
          .eq('scrape_job_id', jobId)
          .eq('user_id', user.id)
          .order('occurred_at', { ascending: false })
          .limit(5)
        
        errorLogs = logs
      }
      
      results = resultStats
    }

    return NextResponse.json({
      success: true,
      job,
      results,
      errorLogs
    })

  } catch (error) {
    console.error('Scraper status error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}