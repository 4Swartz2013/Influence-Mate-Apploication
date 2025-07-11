'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProvenanceTimeline } from './ProvenanceTimeline'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface FieldProvenanceCardProps {
  contactId: string
  field: string
}

interface LatestChange {
  timestamp: string
  source_type: string
  value: string
}

export function FieldProvenanceCard({ contactId, field }: FieldProvenanceCardProps) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [latestChange, setLatestChange] = useState<LatestChange | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && contactId) {
      fetchLatestChange()
    }
  }, [user, contactId, field])

  const fetchLatestChange = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('data_provenance')
        .select('detected_at, source_type, new_value')
        .eq('user_id', user!.id)
        .eq('contact_id', contactId)
        .eq('field_name', field)
        .order('detected_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setLatestChange({
          timestamp: data.detected_at,
          source_type: data.source_type,
          value: data.new_value
        })
      }
    } catch (err) {
      // Don't set error on 'No rows returned' error (normal for new fields)
      if (err instanceof Error && !err.message.includes('No rows returned')) {
        console.error('Error fetching latest change:', err)
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const getFieldDisplayName = () => {
    const displayNames: Record<string, string> = {
      name: 'Name',
      email: 'Email Address',
      username: 'Username',
      bio: 'Biography',
      location: 'Location',
      phone: 'Phone Number',
      platform: 'Platform',
      follower_count: 'Follower Count',
      engagement_rate: 'Engagement Rate'
    }
    return displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1)
  }

  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'scraper': return 'Web Scraping'
      case 'upload': return 'File Upload'
      case 'api': return 'API Integration'
      case 'manual': return 'Manual Entry'
      case 'enrichment_job': return 'AI Enrichment'
      case 'sync': return 'Auto-Sync'
      default: return sourceType
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="w-32 h-6 bg-slate-200 animate-pulse rounded" />
          <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="w-full h-8 bg-slate-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getFieldDisplayName()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-500">Error: {error}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLatestChange}
            className="w-full mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getFieldDisplayName()}</CardTitle>
            {latestChange ? (
              <CardDescription>
                Last updated {formatDistanceToNow(new Date(latestChange.timestamp), { addSuffix: true })} 
                via {getSourceTypeLabel(latestChange.source_type)}
              </CardDescription>
            ) : (
              <CardDescription>
                No change history available
              </CardDescription>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <ProvenanceTimeline 
            contactId={contactId} 
            field={field}
            limit={10}
            showControls={false}
          />
        </CardContent>
      )}
    </Card>
  )
}