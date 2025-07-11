import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const { handle, postCount = 30, forceRefresh = false, useApi = true } = await request.json();
    
    if (!handle) {
      return NextResponse.json({ error: 'Instagram handle is required' }, { status: 400 });
    }

    // Check if profile was scraped recently and no force refresh
    if (!forceRefresh) {
      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id, last_scraped_at')
        .eq('user_id', user.id)
        .eq('platform', 'instagram')
        .eq('handle', handle)
        .single();
      
      if (profile && profile.last_scraped_at) {
        const lastScraped = new Date(profile.last_scraped_at);
        const hoursSinceLastScrape = (Date.now() - lastScraped.getTime()) / (1000 * 60 * 60);
        
        // If scraped in the last 24 hours, return existing profile ID
        if (hoursSinceLastScrape < 24) {
          return NextResponse.json({ 
            profileId: profile.id, 
            message: 'Using recently harvested data',
            hoursSinceLastScrape
          });
        }
      }
    }

    // Create job for worker to process
    const { data: job, error: jobError } = await supabase
      .from('enrichment_jobs')
      .insert({
        user_id: user.id,
        job_type: 'instagram_harvest',
        status: 'pending',
        parameters: {
          handle,
          userId: user.id,
          postCount,
          forceRefresh,
          useApi,
          platform_required: 'instagram_harvester'
        },
        progress: 0
      })
      .select()
      .single();
    
    if (jobError) {
      throw jobError;
    }

    return NextResponse.json({ 
      jobId: job.id,
      message: 'Instagram harvest job created',
      status: 'pending'
    });
  } catch (error) {
    console.error('Instagram harvest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Instagram harvest' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get job ID from query params
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Get job status
    const { data: job, error: jobError } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get profile if job is completed
    let profile = null;
    if (job.status === 'completed' && job.results?.profileId) {
      const { data: profileData } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('id', job.results.profileId)
        .single();
        
      profile = profileData;
    }

    return NextResponse.json({
      job,
      profile,
      stats: job.results
    });
  } catch (error) {
    console.error('Instagram job status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get job status' },
      { status: 500 }
    );
  }
}