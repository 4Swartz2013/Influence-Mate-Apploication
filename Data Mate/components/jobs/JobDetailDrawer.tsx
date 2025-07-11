'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SourceChainViewer } from './SourceChainViewer'
import { ProvenanceTimeline } from '@/components/provenance/ProvenanceTimeline'
import { EnrichmentJob } from '@/lib/supabase'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Play,
  RotateCcw,
  FileText,
  Brain,
  Target,
  Users,
  MessageSquare,
  Zap,
  History
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface JobDetailDrawerProps {
  job: EnrichmentJob | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdate?: () => void
}

export function JobDetailDrawer({ job, open, onOpenChange, onJobUpdate }: JobDetailDrawerProps) {
  const [retrying, setRetrying] = useState(false)
  const [showProvenance, setShowProvenance] = useState(false)

  if (!job) return null

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getJobTypeIcon = () => {
    switch (job.job_type) {
      case 'contact_enrichment':
        return <Users className="w-5 h-5" />
      case 'sentiment_analysis':
        return <MessageSquare className="w-5 h-5" />
      case 'persona_analysis':
        return <Brain className="w-5 h-5" />
      case 'audience_clustering':
        return <Target className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getJobTypeLabel = () => {
    return job.job_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getDuration = () => {
    if (!job.started_at || !job.completed_at) return null
    
    const start = new Date(job.started_at)
    const end = new Date(job.completed_at)
    const durationMs = end.getTime() - start.getTime()
    
    if (durationMs < 1000) return `${durationMs}ms`
    if (durationMs < 60000) return `${Math.round(durationMs / 1000)}s`
    return `${Math.round(durationMs / 60000)}m ${Math.round((durationMs % 60000) / 1000)}s`
  }

  const handleRetry = async () => {
    setRetrying(true)
    // TODO: Implement retry logic
    setTimeout(() => {
      setRetrying(false)
      onJobUpdate?.()
    }, 2000)
  }

  const toggleProvenance = () => {
    setShowProvenance(!showProvenance)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {getJobTypeIcon()}
            </div>
            <div>
              <SheetTitle className="text-xl">{getJobTypeLabel()}</SheetTitle>
              <SheetDescription>
                Job ID: {job.id}
              </SheetDescription>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <Badge className={getStatusColor()} variant="secondary">
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {job.status === 'failed' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleRetry}
                  disabled={retrying}
                >
                  {retrying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Retry
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={toggleProvenance}
              >
                <History className="w-4 h-4 mr-2" />
                {showProvenance ? 'Hide Provenance' : 'View Source Trail'}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {showProvenance && job.target_id ? (
            // Provenance Timeline
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Data Provenance Trail</span>
                </CardTitle>
                <CardDescription>
                  Field-level changes made by this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProvenanceTimeline 
                  contactId={job.target_id}
                  showControls={false}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Job Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Target Type</label>
                      <p className="text-slate-900 capitalize">
                        {job.target_table?.replace('_', ' ') || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Target ID</label>
                      <p className="text-slate-900 font-mono text-sm">
                        {job.target_id ? `${job.target_id.slice(0, 8)}...` : '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Created</label>
                      <p className="text-slate-900">
                        {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Duration</label>
                      <p className="text-slate-900">
                        {getDuration() || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {job.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-600">Progress</label>
                        <span className="text-sm text-slate-600">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Parameters */}
              {job.parameters && Object.keys(job.parameters).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parameters</CardTitle>
                    <CardDescription>
                      Configuration used for this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(job.parameters, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Source Chain */}
              <SourceChainViewer job={job} />

              {/* Results */}
              {job.results && Object.keys(job.results).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Results</span>
                    </CardTitle>
                    <CardDescription>
                      Output generated by this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <pre className="text-sm text-green-800 whitespace-pre-wrap">
                        {JSON.stringify(job.results, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Details */}
              {job.error_message && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span>Error Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{job.error_message}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">Job Created</p>
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {job.started_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">Processing Started</p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(job.started_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.completed_at && (
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          job.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">
                            {job.status === 'completed' ? 'Completed' : 'Failed'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}