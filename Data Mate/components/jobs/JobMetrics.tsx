'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EnrichmentJob } from '@/lib/supabase'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react'

interface JobMetricsProps {
  jobs: EnrichmentJob[]
}

export function JobMetrics({ jobs }: JobMetricsProps) {
  const getJobStats = () => {
    const total = jobs.length
    const completed = jobs.filter(j => j.status === 'completed').length
    const failed = jobs.filter(j => j.status === 'failed').length
    const processing = jobs.filter(j => j.status === 'processing').length
    const pending = jobs.filter(j => j.status === 'pending').length

    const successRate = total > 0 ? (completed / total) * 100 : 0
    
    // Calculate average duration for completed jobs
    const completedJobs = jobs.filter(j => j.status === 'completed' && j.started_at && j.completed_at)
    const avgDuration = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => {
          const start = new Date(job.started_at!).getTime()
          const end = new Date(job.completed_at!).getTime()
          return sum + (end - start)
        }, 0) / completedJobs.length
      : 0

    const formatDuration = (ms: number) => {
      if (ms < 1000) return `${Math.round(ms)}ms`
      if (ms < 60000) return `${Math.round(ms / 1000)}s`
      return `${Math.round(ms / 60000)}m`
    }

    return {
      total,
      completed,
      failed,
      processing,
      pending,
      successRate,
      avgDuration: formatDuration(avgDuration)
    }
  }

  const stats = getJobStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Duration</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgDuration}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Jobs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processing + stats.pending}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}