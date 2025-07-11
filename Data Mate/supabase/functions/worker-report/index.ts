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
    const { agent_id, job_id, status, duration_ms, error_msg, results } = await req.json()

    if (!agent_id || !job_id || !status) {
      return new Response(
        JSON.stringify({ error: 'agent_id, job_id, and status are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Update worker session
    const { error: sessionError } = await supabase
      .from('worker_sessions')
      .update({
        status,
        ended_at: new Date().toISOString(),
        duration_ms,
        error_msg
      })
      .eq('agent_id', agent_id)
      .eq('job_id', job_id)
      .eq('status', 'in_progress')

    if (sessionError) throw sessionError

    // Update enrichment job
    const jobUpdate: any = {
      status: status === 'success' ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      progress: status === 'success' ? 100 : 0
    }

    // Add error message if present
    if (error_msg) {
      jobUpdate.error_message = error_msg
    }

    // Add results if present
    if (results) {
      jobUpdate.results = results
    }

    const { error: jobError } = await supabase
      .from('enrichment_jobs')
      .update(jobUpdate)
      .eq('id', job_id)

    if (jobError) throw jobError

    return new Response(
      JSON.stringify({ 
        status: 'reported',
        job_id,
        job_status: jobUpdate.status
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})