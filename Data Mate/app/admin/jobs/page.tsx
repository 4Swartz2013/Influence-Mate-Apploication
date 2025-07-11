'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { supabase, EnrichmentJob } from '@/lib/supabase'
import { 
  Package2, 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react'

export default function JobsQueuePage() {
  const { user, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<EnrichmentJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      return
    }
    
    fetchJobs()
  }, [user])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError
      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Play className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobs & Queue</h1>
          <p className="text-slate-600">
            Manage and monitor background processing jobs
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Package2 className="w-5 h-5" />
                <span>Job Queue</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchJobs}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              View and manage all background processing jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full h-12 bg-slate-100 animate-pulse rounded" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Jobs</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button onClick={fetchJobs} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <Package2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Jobs Found</h3>
                <p className="text-slate-600">
                  There are currently no jobs in the queue.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className="flex items-center p-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-slate-900">{job.job_type}</h3>
                          <Badge className={getStatusColor(job.status)} variant="secondary">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(job.status)}
                              <span>{job.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Created: {new Date(job.created_at).toLocaleString()}
                        </p>
                        {job.target_table && (
                          <p className="text-sm text-slate-500">
                            Target: {job.target_table} {job.target_id ? `(${job.target_id.substring(0, 8)}...)` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'processing' && (
                          <div className="flex items-center space-x-2 mr-4">
                            <Progress value={job.progress} className="w-24 h-2" />
                            <span className="text-sm text-slate-600">{job.progress}%</span>
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          {job.status === 'pending' ? (
                            <Play className="w-4 h-4" />
                          ) : job.status === 'processing' ? (
                            <Pause className="w-4 h-4" />
                          ) : job.status === 'failed' ? (
                            <RefreshCw className="w-4 h-4" />
                          ) : (
                            <Package2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}