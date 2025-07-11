'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { JobDetailDrawer } from './JobDetailDrawer'
import { EnrichmentJob } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowUpDown, Eye, Play, Pause, RotateCcw, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface EnrichmentJobTableProps {
  jobs: EnrichmentJob[]
  loading?: boolean
  error?: string
  onRefresh?: () => void
  audienceId?: string
  contactId?: string
}

export function EnrichmentJobTable({ 
  jobs, 
  loading, 
  error, 
  onRefresh,
  audienceId,
  contactId 
}: EnrichmentJobTableProps) {
  const [selectedJob, setSelectedJob] = useState<EnrichmentJob | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Filter jobs based on context
  const filteredJobs = jobs.filter(job => {
    if (audienceId) {
      return job.target_id === audienceId && job.target_table === 'audience_segments'
    }
    if (contactId) {
      return job.target_id === contactId && job.target_table === 'contacts'
    }
    return true
  })

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
    return jobType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
            {row.original.target_id && (
              <span className="text-xs text-slate-500">
                ID: {row.original.target_id.slice(0, 8)}...
              </span>
            )}
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

  const getTitle = () => {
    if (audienceId) return "Audience Enrichment History"
    if (contactId) return "Contact Enrichment History"
    return "Enrichment Jobs"
  }

  const getDescription = () => {
    if (audienceId) return "Background jobs for this audience segment"
    if (contactId) return "Background jobs for this contact"
    return "All background processing jobs"
  }

  return (
    <>
      <EnhancedDataTable
        data={filteredJobs}
        columns={columns}
        title={getTitle()}
        description={getDescription()}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
        searchPlaceholder="Search jobs by type or status..."
        emptyStateTitle="No enrichment jobs found"
        emptyStateDescription="Background jobs will appear here when enrichment tasks are run"
      />

      <JobDetailDrawer
        job={selectedJob}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onJobUpdate={onRefresh}
      />
    </>
  )
}