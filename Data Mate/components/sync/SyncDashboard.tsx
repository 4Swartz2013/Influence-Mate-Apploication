'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SyncStatusIndicator } from './SyncStatusIndicator'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { SyncStats, SyncJob, SyncChangeLog } from '@/lib/sync/types'
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function SyncDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [jobs, setJobs] = useState<SyncJob[]>([])
  const [recentChanges, setRecentChanges] = useState<SyncChangeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch sync statistics
      const [statsResult, jobsResult, changesResult] = await Promise.all([
        fetchSyncStats(),
        fetchSyncJobs(),
        fetchRecentChanges()
      ])

      setStats(statsResult)
      setJobs(jobsResult)
      setRecentChanges(changesResult)

    } catch (error) {
      console.error('Error fetching sync dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSyncStats = async (): Promise<SyncStats> => {
    // Get pending changes
    const { count: pendingCount } = await supabase
      .from('sync_change_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('sync_status', 'pending')

    // Get completed changes (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: completedCount } = await supabase
      .from('sync_change_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('sync_status', 'completed')
      .gte('processed_at', thirtyDaysAgo.toISOString())

    // Get failed changes (last 30 days)
    const { count: failedCount } = await supabase
      .from('sync_change_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('sync_status', 'failed')
      .gte('detected_at', thirtyDaysAgo.toISOString())

    // Get outdated contacts
    const { count: outdatedCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .neq('sync_status', 'synced')

    return {
      total_changes: (pendingCount || 0) + (completedCount || 0) + (failedCount || 0),
      pending_changes: pendingCount || 0,
      completed_changes: completedCount || 0,
      failed_changes: failedCount || 0,
      outdated_contacts: outdatedCount || 0
    }
  }

  const fetchSyncJobs = async (): Promise<SyncJob[]> => {
    const { data, error } = await supabase
      .from('sync_jobs')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    return data || []
  }

  const fetchRecentChanges = async (): Promise<SyncChangeLog[]> => {
    const { data, error } = await supabase
      .from('sync_change_log')
      .select(`
        *,
        contacts(name, username, platform)
      `)
      .eq('user_id', user!.id)
      .order('detected_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  }

  const triggerManualSync = async () => {
    if (!user) return

    try {
      setSyncing(true)

      const response = await fetch('/api/sync/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Manual sync failed')
      }

      await fetchDashboardData()

    } catch (error) {
      console.error('Error triggering manual sync:', error)
    } finally {
      setSyncing(false)
    }
  }

  const getChangeIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      username: 'Username',
      bio: 'Bio',
      location: 'Location',
      email: 'Email',
      name: 'Name',
      phone: 'Phone',
      profile_url: 'Profile URL'
    }
    return fieldMap[field] || field
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-48 h-6 bg-slate-200 animate-pulse rounded" />
              <div className="w-32 h-4 bg-slate-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-3/4 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sync Dashboard</h2>
          <p className="text-slate-600">Monitor and manage data synchronization</p>
        </div>
        <div className="flex items-center space-x-2">
          <SyncStatusIndicator showDetails />
          <Button onClick={triggerManualSync} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Manual Sync
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Changes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending_changes}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed (30d)</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed_changes}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Failed (30d)</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed_changes}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Outdated Contacts</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.outdated_contacts}</p>
                </div>
                <Users className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Recent Changes</span>
          </CardTitle>
          <CardDescription>
            Latest field changes detected across your contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentChanges.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No recent changes detected</p>
              <p className="text-sm">Changes will appear here when contact data is updated</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentChanges.map((change) => (
                <div key={change.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getChangeIcon(change.sync_status)}
                    <div>
                      <p className="font-medium text-slate-900">
                        {(change as any).contacts?.name || 'Unknown Contact'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getFieldDisplayName(change.field_name)} field updated
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={change.sync_status === 'completed' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {change.sync_status}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(change.detected_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>Sync Jobs</span>
          </CardTitle>
          <CardDescription>
            Automated and manual synchronization schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No sync jobs configured</p>
              <p className="text-sm">Set up automated sync schedules for your data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{job.job_name}</h4>
                    <p className="text-sm text-slate-600 capitalize">
                      {job.sync_type} • {job.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                    {job.last_run_at && (
                      <p className="text-xs text-slate-500 mt-1">
                        Last run: {formatDistanceToNow(new Date(job.last_run_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}