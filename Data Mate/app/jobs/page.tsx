'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { EnrichmentJob } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { JobDetailDrawer } from '@/components/jobs/JobDetailDrawer'
import { JobMetrics } from '@/components/jobs/JobMetrics'
import { JobFilters, JobFilterState } from '@/components/jobs/JobFilters'
import { ArrowUpDown, Play, Pause, RotateCcw, Zap, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useState, useMemo } from 'react'

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedJob, setSelectedJob] = useState<EnrichmentJob | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<JobFilterState>({
    statuses: [],
    jobTypes: [],
    targetTypes: []
  })
  
  const {
    data: allJobs,
    loading,
    error,
    refetch
  } = useSupabaseQuery<EnrichmentJob>({
    table: 'enrichment_jobs',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!user
  })

  // Apply filters to jobs
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(job.status)) {
        return false
      }
      if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.job_type)) {
        return false
      }
      if (filters.targetTypes.length > 0 && !filters.targetTypes.includes(job.target_table || '')) {
        return false
      }
      return true
    })
  }, [allJobs, filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-slate-100 text-slate-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getJobTypeLabel = (jobType: string) => {
    switch (jobType) {
      case 'contact_enrichment':
        return 'Contact Enrichment'
      case 'sentiment_analysis':
        return 'Sentiment Analysis'
      case 'audience_clustering':
        return 'Audience Clustering'
      case 'persona_analysis':
        return 'Persona Analysis'
      case 'engagement_analysis':
        return 'Engagement Analysis'
      case 'similarity_scoring':
        return 'Similarity Scoring'
      default:
        return jobType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getTargetTypeLabel = (job: EnrichmentJob) => {
    if (job.target_table === 'contacts') return 'Contact'
    if (job.target_table === 'audience_segments') return 'Audience'
    if (job.target_table === 'comments') return 'Comment'
    if (job.target_table === 'transcripts') return 'Transcript'
    return 'Unknown'
  }

  const getDurationLabel = (job: EnrichmentJob) => {
    if (!job.started_at || !job.completed_at) return '—'
    
    const start = new Date(job.started_at)
    const end = new Date(job.completed_at)
    const durationMs = end.getTime() - start.getTime()
    
    if (durationMs < 1000) return `${durationMs}ms`
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`
    return `${Math.round(durationMs / 60000)}m`
  }

  const openJobDetail = (job: EnrichmentJob) => {
    setSelectedJob(job)
    setDrawerOpen(true)
  }

  const columns: ColumnDef<EnrichmentJob>[] = [
    {
      accessorKey: 'job_type',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Job Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {getJobTypeLabel(row.original.job_type)}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getTargetTypeLabel(row.original)}
              </Badge>
              {row.original.target_id && (
                <span className="text-xs text-slate-500">
                  ID: {row.original.target_id.slice(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          className={getStatusColor(row.original.status)}
          variant="secondary"
        >
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const progress = row.original.progress
        const status = row.original.status
        
        if (status === 'completed') {
          return (
            <div className="flex items-center space-x-2">
              <Progress value={100} className="h-2 w-20" />
              <span className="text-sm text-green-600 font-medium">100%</span>
            </div>
          )
        }
        
        if (status === 'failed' || status === 'cancelled') {
          return <span className="text-slate-400">—</span>
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Progress value={progress} className="h-2 w-20" />
            <span className="text-sm text-slate-600 font-medium">{progress}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-slate-900">
            {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
          </div>
          <div className="text-slate-500 text-xs">
            Duration: {getDurationLabel(row.original)}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'error_message',
      header: 'Details',
      cell: ({ row }) => {
        const error = row.original.error_message
        const results = row.original.results
        
        if (error) {
          return (
            <div className="max-w-xs">
              <p className="text-sm text-red-600 line-clamp-2" title={error}>
                {error}
              </p>
            </div>
          )
        }
        
        if (results && typeof results === 'object') {
          const resultKeys = Object.keys(results)
          if (resultKeys.length > 0) {
            return (
              <div className="text-sm text-slate-600">
                {resultKeys.length} result{resultKeys.length !== 1 ? 's' : ''}
              </div>
            )
          }
        }
        
        return <span className="text-slate-400">—</span>
      },
      enableGlobalFilter: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original.status
        
        return (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => openJobDetail(row.original)}
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {status === 'pending' && (
              <Button variant="ghost" size="sm" title="Start Job">
                <Play className="w-4 h-4" />
              </Button>
            )}
            {status === 'processing' && (
              <Button variant="ghost" size="sm" title="Pause Job">
                <Pause className="w-4 h-4" />
              </Button>
            )}
            {(status === 'failed' || status === 'cancelled') && (
              <Button variant="ghost" size="sm" title="Retry Job">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

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

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Enrichment Jobs</h1>
          <p className="text-slate-600">
            Monitor and manage background processing jobs for data enrichment and analysis
          </p>
        </div>

        {/* Job Metrics */}
        <JobMetrics jobs={allJobs} />

        {/* Job Filters */}
        <div className="flex items-center justify-between">
          <JobFilters onFiltersChange={setFilters} />
          <div className="text-sm text-slate-600">
            Showing {filteredJobs.length} of {allJobs.length} jobs
          </div>
        </div>

        <EnhancedDataTable
          data={filteredJobs}
          columns={columns}
          title="Job Queue"
          description="Background processing for enrichment, analysis, and clustering operations"
          loading={loading}
          error={error}
          onRefresh={refetch}
          searchPlaceholder="Search jobs by type, status, or target..."
          emptyStateTitle="No enrichment jobs found"
          emptyStateDescription="Background jobs will appear here when you run enrichment or analysis tasks"
          onExport={() => console.log('Export jobs')}
        />

        {/* Job Detail Drawer */}
        <JobDetailDrawer
          job={selectedJob}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onJobUpdate={refetch}
        />
      </motion.div>
    </DashboardLayout>
  )
}