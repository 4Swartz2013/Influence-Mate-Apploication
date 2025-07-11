'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProvenanceNode } from './ProvenanceNode'
import { SourceChainModal } from './SourceChainModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  History,
  ChevronDown,
  ChevronUp,
  Search,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ProvenanceTimelineProps {
  contactId: string
  field?: string
  limit?: number
  showControls?: boolean
}

interface ProvenanceRecord {
  id: string
  field_name: string
  old_value: string
  new_value: string
  source_type: string
  source_detail: any
  confidence_before: number
  confidence_after: number
  detected_at: string
  enrichment_job?: {
    id: string
    job_type: string
    status: string
  }
  job_errors?: {
    id: string
    error_type: string
    error_message: string
  }[]
}

interface FieldProvenance {
  field: string
  records: ProvenanceRecord[]
}

export function ProvenanceTimeline({
  contactId,
  field,
  limit = 5,
  showControls = true
}: ProvenanceTimelineProps) {
  const { user } = useAuth()
  const [fieldProvenances, setFieldProvenances] = useState<FieldProvenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFields, setExpandedFields] = useState<string[]>([])
  const [selectedRecord, setSelectedRecord] = useState<ProvenanceRecord | null>(null)
  const [showChainModal, setShowChainModal] = useState(false)
  const [fullHistory, setFullHistory] = useState(false)

  useEffect(() => {
    if (user && contactId) {
      fetchProvenance()
    }
  }, [user, contactId, field, fullHistory])

  const fetchProvenance = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query to fetch provenance records
      let query = supabase
        .from('data_provenance')
        .select(`
          *,
          enrichment_job:enrichment_job_id (
            id, job_type, status
          ),
          job_errors!inner (
            id, error_type, error_message
          )
        `)
        .eq('user_id', user!.id)
        .eq('contact_id', contactId)
        .order('detected_at', { ascending: false })

      // Filter by field if specified
      if (field) {
        query = query.eq('field_name', field)
      }

      // Limit results unless showing full history
      if (!fullHistory) {
        query = query.limit(limit * (field ? 1 : 5))
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Group by field_name
      const groupedByField = (data || []).reduce((acc, record) => {
        const fieldName = record.field_name
        if (!acc[fieldName]) {
          acc[fieldName] = []
        }
        acc[fieldName].push(record)
        return acc
      }, {} as Record<string, ProvenanceRecord[]>)

      // Convert to array of field provenances
      const fieldProvenanceArray = Object.keys(groupedByField).map(fieldName => ({
        field: fieldName,
        records: groupedByField[fieldName]
      }))

      // Sort fields by most recent change
      fieldProvenanceArray.sort((a, b) => {
        const dateA = new Date(a.records[0].detected_at).getTime()
        const dateB = new Date(b.records[0].detected_at).getTime()
        return dateB - dateA
      })

      setFieldProvenances(fieldProvenanceArray)

      // Auto-expand the first field or the specified field
      if (fieldProvenanceArray.length > 0) {
        if (field) {
          setExpandedFields([field])
        } else if (!expandedFields.length) {
          setExpandedFields([fieldProvenanceArray[0].field])
        }
      }

    } catch (err) {
      console.error('Error fetching provenance:', err)
      setError(err instanceof Error ? err.message : 'Failed to load provenance data')
    } finally {
      setLoading(false)
    }
  }

  const toggleFieldExpansion = (field: string) => {
    setExpandedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const openSourceChain = (record: ProvenanceRecord) => {
    setSelectedRecord(record)
    setShowChainModal(true)
  }

  const toggleFullHistory = () => {
    setFullHistory(prev => !prev)
  }

  const getFieldDisplayName = (fieldName: string) => {
    const displayNames: Record<string, string> = {
      name: 'Name',
      email: 'Email Address',
      username: 'Username',
      bio: 'Biography',
      location: 'Location',
      phone: 'Phone Number',
      platform: 'Platform',
      follower_count: 'Follower Count',
      engagement_rate: 'Engagement Rate',
      enrichment_completed: 'Enrichment Process',
      profile_url: 'Profile URL'
    }
    return displayNames[fieldName] || fieldName
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-32 h-6 bg-slate-200 animate-pulse rounded" />
              <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex">
                    <div className="w-8 h-8 bg-slate-200 animate-pulse rounded-full mr-4" />
                    <div className="space-y-2 flex-1">
                      <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                      <div className="w-3/4 h-3 bg-slate-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Provenance Data</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchProvenance} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (fieldProvenances.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Change History</h3>
            <p className="text-slate-600">
              No data provenance records found for this contact
            </p>
            {field && (
              <p className="text-sm text-slate-500 mt-2">
                There are no recorded changes for the '{field}' field
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Data Provenance</h3>
            <p className="text-sm text-slate-600">
              Field-by-field history and data sources
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullHistory}
            >
              {fullHistory ? 'Show Recent' : 'Show Full History'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProvenance}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Field Timelines */}
      <div className="space-y-4">
        {fieldProvenances.map(fieldProvenance => (
          <Card key={fieldProvenance.field}>
            <CardHeader className="cursor-pointer" onClick={() => toggleFieldExpansion(fieldProvenance.field)}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{getFieldDisplayName(fieldProvenance.field)}</span>
                    <Badge variant="outline">
                      {fieldProvenance.records.length} changes
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {formatDistanceToNow(new Date(fieldProvenance.records[0].detected_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                {expandedFields.includes(fieldProvenance.field) ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </CardHeader>
            
            {expandedFields.includes(fieldProvenance.field) && (
              <CardContent>
                <div className="space-y-2">
                  <AnimatePresence>
                    {fieldProvenance.records.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ProvenanceNode 
                          record={record} 
                          isFirst={index === 0}
                          isLast={index === fieldProvenance.records.length - 1}
                          onViewSourceChain={() => openSourceChain(record)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Source Chain Modal */}
      <SourceChainModal
        open={showChainModal}
        onOpenChange={setShowChainModal}
        record={selectedRecord}
        contactId={contactId}
      />
    </div>
  )
}