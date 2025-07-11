'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnrichmentJobTable } from '@/components/jobs/EnrichmentJobTable'
import { supabase, EnrichmentJob, AudienceSegment } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Users,
  Brain,
  Target,
  Zap
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface AudienceTimelineProps {
  audienceId: string
  audience: AudienceSegment
}

interface TimelineEvent {
  id: string
  type: 'creation' | 'enrichment' | 'analysis' | 'update'
  title: string
  description: string
  status: 'completed' | 'pending' | 'failed' | 'processing'
  timestamp: string
  metadata?: any
}

export function AudienceTimeline({ audienceId, audience }: AudienceTimelineProps) {
  const { user } = useAuth()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [jobs, setJobs] = useState<EnrichmentJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && audienceId) {
      fetchTimelineData()
    }
  }, [user, audienceId])

  const fetchTimelineData = async () => {
    try {
      setLoading(true)

      // Fetch enrichment jobs related to this audience
      const { data: jobsData, error: jobsError } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('target_id', audienceId)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      setJobs(jobsData || [])

      // Create timeline events
      const timelineEvents: TimelineEvent[] = []

      // Add audience creation event
      timelineEvents.push({
        id: `creation-${audience.id}`,
        type: 'creation',
        title: 'Audience Segment Created',
        description: `"${audience.name}" was created and initialized`,
        status: 'completed',
        timestamp: audience.created_at,
      })

      // Add enrichment job events
      jobsData?.forEach(job => {
        timelineEvents.push({
          id: job.id,
          type: job.job_type.includes('analysis') ? 'analysis' : 'enrichment',
          title: getJobTitle(job.job_type),
          description: getJobDescription(job),
          status: job.status as any,
          timestamp: job.created_at,
          metadata: job
        })
      })

      // Add update events if audience was modified
      if (audience.updated_at !== audience.created_at) {
        timelineEvents.push({
          id: `update-${audience.id}`,
          type: 'update',
          title: 'Segment Updated',
          description: 'Audience segment configuration was modified',
          status: 'completed',
          timestamp: audience.updated_at,
        })
      }

      // Sort by timestamp (newest first)
      timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setEvents(timelineEvents)
    } catch (err) {
      console.error('Error fetching timeline events:', err)
    } finally {
      setLoading(false)
    }
  }

  const getJobTitle = (jobType: string) => {
    switch (jobType) {
      case 'audience_clustering':
        return 'AI Clustering Analysis'
      case 'persona_analysis':
        return 'Persona Classification'
      case 'engagement_analysis':
        return 'Engagement Analysis'
      case 'similarity_scoring':
        return 'Similarity Scoring'
      default:
        return jobType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getJobDescription = (job: EnrichmentJob) => {
    const baseDesc = `${getJobTitle(job.job_type)} job`
    
    if (job.status === 'completed') {
      return `${baseDesc} completed successfully`
    } else if (job.status === 'failed') {
      return `${baseDesc} failed: ${job.error_message || 'Unknown error'}`
    } else if (job.status === 'processing') {
      return `${baseDesc} is currently running (${job.progress}% complete)`
    } else {
      return `${baseDesc} is pending`
    }
  }

  const getEventIcon = (event: TimelineEvent) => {
    if (event.status === 'failed') return XCircle
    if (event.status === 'processing') return Loader2
    if (event.status === 'pending') return Clock
    
    switch (event.type) {
      case 'creation':
        return Users
      case 'analysis':
        return Brain
      case 'enrichment':
        return Zap
      case 'update':
        return Target
      default:
        return CheckCircle
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    if (event.status === 'failed') return 'text-red-600 bg-red-100'
    if (event.status === 'processing') return 'text-blue-600 bg-blue-100'
    if (event.status === 'pending') return 'text-yellow-600 bg-yellow-100'
    
    switch (event.type) {
      case 'creation':
        return 'text-green-600 bg-green-100'
      case 'analysis':
        return 'text-purple-600 bg-purple-100'
      case 'enrichment':
        return 'text-orange-600 bg-orange-100'
      case 'update':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-slate-600 bg-slate-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="w-32 h-6 bg-slate-200 animate-pulse rounded mb-2" />
            <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-slate-200 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
                    <div className="w-32 h-3 bg-slate-200 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Activity Timeline</span>
          </CardTitle>
          <CardDescription>
            History of enrichment and analysis activities for this audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No timeline events found</p>
              <p className="text-sm">Events will appear here as the audience is processed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event, index) => {
                const Icon = getEventIcon(event)
                const isProcessing = event.status === 'processing'
                
                return (
                  <div key={event.id} className="relative">
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event)}`}>
                        <Icon className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-900">{event.title}</h4>
                          <span className="text-sm text-slate-500">
                            {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                          <span>{format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                        
                        {/* Progress bar for processing jobs */}
                        {event.metadata?.status === 'processing' && event.metadata?.progress && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                              <span>Progress</span>
                              <span>{event.metadata.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${event.metadata.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timeline connector */}
                    {index < events.length - 1 && (
                      <div className="absolute left-4 top-8 w-px h-6 bg-slate-200" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Job Table */}
      <EnrichmentJobTable
        jobs={jobs}
        loading={loading}
        onRefresh={fetchTimelineData}
        audienceId={audienceId}
      />
    </div>
  )
}