import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'

// Secure environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const workerServiceToken = Deno.env.get('WORKER_SERVICE_TOKEN') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // Check service token
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${workerServiceToken}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  try {
    const { agent_id } = await req.json()

    if (!agent_id) {
      return new Response(
        JSON.stringify({ error: 'agent_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Get agent capabilities
    const { data: agent, error: agentError } = await supabase
      .from('worker_agents')
      .select('capabilities, platform, status')
      .eq('id', agent_id)
      .single()

    if (agentError) throw agentError

    // Check if agent is online
    if (agent.status !== 'online') {
      return new Response(
        JSON.stringify({ error: 'Agent is not online', job: null }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Find a suitable job based on capabilities
    const { data: jobs, error: jobsError } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10) // Get a batch to filter through

    if (jobsError) throw jobsError

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ job: null }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Find first compatible job
    const compatibleJob = jobs.find(job => {
      // If job has platform requirements, check agent capabilities
      if (job.parameters?.platform_required) {
        const requiredPlatform = job.parameters.platform_required
        
        // Check if agent's platform or tags match the requirement
        if (agent.platform === requiredPlatform) return true
        
        // Check tags
        const agentTags = agent.capabilities?.tags || []
        if (agentTags.includes(requiredPlatform)) return true
        
        // Not compatible
        return false
      }
      
      // No platform requirements, compatible by default
      return true
    })

    if (!compatibleJob) {
      return new Response(
        JSON.stringify({ job: null }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Update job status to processing
    const { error: updateError } = await supabase
      .from('enrichment_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString(),
        progress: 5
      })
      .eq('id', compatibleJob.id)

    if (updateError) throw updateError

    // Create worker session
    const { error: sessionError } = await supabase
      .from('worker_sessions')
      .insert({
        agent_id,
        job_id: compatibleJob.id,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })

    if (sessionError) throw sessionError

    return new Response(
      JSON.stringify({ 
        job: {
          id: compatibleJob.id,
          type: compatibleJob.job_type,
          parameters: compatibleJob.parameters,
          payload: compatibleJob
        }
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, job: null }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})