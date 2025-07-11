import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Collect metrics from various views
    const [
      platformKpis,
      workerStats, 
      proxyStats, 
      jobQueueLag, 
      confidenceStats,
      recentErrors
    ] = await Promise.all([
      // Platform KPIs
      supabase.rpc('get_platform_kpis', { user_id_param: user.id }),
      
      // Worker stats
      supabase.from('v_worker_fleet_stats').select('*'),
      
      // Proxy stats
      supabase.from('v_proxy_stats').select('*').order('fail_pct', { ascending: false }).limit(20),
      
      // Queue lag
      supabase.from('v_job_queue_lag').select('*').single(),
      
      // Confidence stats
      supabase.from('v_confidence_daily').select('*').order('day', { ascending: false }).limit(14),
      
      // Recent errors
      supabase
        .from('job_errors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);
    
    // Get active jobs count
    const { count: activeJobsCount } = await supabase
      .from('enrichment_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing']);
    
    // Get overall success rate
    const { data: overallStats } = await supabase
      .from('enrichment_jobs')
      .select('status, count(*)')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .group('status');
    
    // Calculate overall success rate
    let successRate = 0;
    if (overallStats) {
      const total = overallStats.reduce((sum, item) => sum + item.count, 0);
      const successful = overallStats.find(item => item.status === 'completed')?.count || 0;
      if (total > 0) {
        successRate = Math.round((successful / total) * 100);
      }
    }

    return NextResponse.json({
      platformKpis: platformKpis.data || [],
      workerStats: workerStats.data || [],
      proxyStats: proxyStats.data || [],
      jobQueueLag: jobQueueLag.data || { oldest_job_age_sec: 0, pending_jobs: 0 },
      confidenceStats: confidenceStats.data || [],
      recentErrors: recentErrors.data || [],
      activeJobsCount: activeJobsCount || 0,
      successRate
    });
  } catch (error) {
    console.error('Error getting scraper health metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get scraper health metrics' },
      { status: 500 }
    );
  }
}