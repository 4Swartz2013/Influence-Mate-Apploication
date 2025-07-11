import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

// Import types
type HarvestRequest = {
  handle: string;
  userId: string;
  postCount?: number;
  forceRefresh?: boolean;
  useApi?: boolean;
};

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  
  // Check authorization
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
  
  try {
    const { handle, postCount = 30, forceRefresh = false, useApi = true } = await req.json() as HarvestRequest;
    
    if (!handle) {
      return new Response(
        JSON.stringify({ error: 'Instagram handle is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
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
          return new Response(
            JSON.stringify({ 
              profileId: profile.id, 
              message: 'Using recently harvested data',
              hoursSinceLastScrape
            }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
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
    
    return new Response(
      JSON.stringify({ 
        jobId: job.id,
        message: 'Instagram harvest job created',
        status: 'pending'
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Instagram harvest error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process Instagram harvest' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
})