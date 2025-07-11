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
    const { agent_name, capabilities, host_ip } = await req.json()

    if (!agent_name) {
      return new Response(
        JSON.stringify({ error: 'agent_name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Determine platform from capabilities
    let platform = 'generic'
    if (capabilities?.tags) {
      if (capabilities.tags.includes('mobile_app')) {
        platform = 'mobile'
      } else if (capabilities.tags.includes('web_headless')) {
        platform = 'web'
      }
    }

    const { data: agent, error } = await supabase
      .from('worker_agents')
      .insert({
        agent_name,
        platform,
        capabilities,
        host_ip,
        status: 'online',
        last_heartbeat: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        agent_id: agent.id,
        polling_interval: 30000, // 30 seconds in ms
        status: 'registered'
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