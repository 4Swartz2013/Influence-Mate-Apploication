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
    const { 
      pageId, 
      pageName, 
      postCount = 50, 
      forceRefresh = false, 
      useApi = true 
    } = await request.json();
    
    if (!pageId && !pageName) {
      return NextResponse.json({ error: 'Facebook page ID or name is required' }, { status: 400 });
    }

    // Check if profile was scraped recently and no force refresh
    if (!forceRefresh) {
      let query = supabase
        .from('social_profiles')
        .select('id, last_scraped_at')
        .eq('user_id', user.id)
        .eq('platform', 'facebook');
        
      if (pageId) {
        query = query.eq('profile_id', pageId);
      } else if (pageName) {
        // Create a normalized handle from the page name
        const normalizedHandle = pageName.replace(/\s+/g, '').toLowerCase();
        query = query.eq('handle', normalizedHandle);
      }
      
      const { data: profile } = await query.single();
      
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
        job_type: 'facebook_harvest',
        status: 'pending',
        parameters: {
          pageId,
          pageName,
          userId: user.id,
          postCount,
          forceRefresh,
          useApi,
          platform_required: 'facebook_harvester'
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
      message: 'Facebook harvest job created',
      status: 'pending'
    });
  } catch (error) {
    console.error('Facebook harvest error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Facebook harvest' },
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
    console.error('Facebook job status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get job status' },
      { status: 500 }
    );
  }
}