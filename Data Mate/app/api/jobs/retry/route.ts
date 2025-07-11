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
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // First, verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from('enrichment_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Check if job is in a failed state
    if (job.status !== 'failed') {
      return NextResponse.json({ error: 'Only failed jobs can be retried' }, { status: 400 });
    }

    // Update job status to pending and increment retry count
    const { data: updatedJob, error: updateError } = await supabase
      .from('enrichment_jobs')
      .update({
        status: 'pending',
        progress: 0,
        error_message: null,
        started_at: null,
        completed_at: null,
        retry_count: (job.retry_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to retry job' }, { status: 500 });
    }

    // Create a retry log entry
    await supabase
      .from('job_retries')
      .insert({
        user_id: user.id,
        job_id: id,
        retried_at: new Date().toISOString(),
        previous_status: 'failed',
        previous_error: job.error_message,
        retry_count: updatedJob.retry_count
      });

    return NextResponse.json({
      success: true,
      message: 'Job has been queued for retry',
      job: updatedJob
    });
  } catch (error) {
    console.error('Error retrying job:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retry job' },
      { status: 500 }
    );
  }
}