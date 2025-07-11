import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SyncManager } from '@/lib/sync/syncManager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { jobId, userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Initialize sync manager and run sync
    const syncManager = new SyncManager(userId)
    const stats = await syncManager.runSync(jobId)

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json({ 
      error: 'Sync process failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}