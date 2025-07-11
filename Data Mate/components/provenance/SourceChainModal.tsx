'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBadge } from './ConfidenceBadge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  GitBranch,
  ArrowRight,
  Globe,
  Search,
  Database,
  Zap,
  Upload,
  UserCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

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

interface SourceChainNode {
  id: string
  type: string
  label: string
  description: string
  timestamp: string
  data: any
  status: 'success' | 'error' | 'processing' | 'waiting'
  confidence?: number
}

interface SourceChainModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: ProvenanceRecord | null
  contactId: string
}

export function SourceChainModal({
  open,
  onOpenChange,
  record,
  contactId
}: SourceChainModalProps) {
  const { user } = useAuth()
  const [sourceChain, setSourceChain] = useState<SourceChainNode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && record && user) {
      buildSourceChain()
    }
  }, [open, record, user])

  const buildSourceChain = async () => {
    if (!record) return
    
    try {
      setLoading(true)
      
      // Start with the current record
      const chain: SourceChainNode[] = [{
        id: record.id,
        type: record.source_type,
        label: getSourceTypeLabel(record.source_type),
        description: `New value: ${record.new_value || '(empty)'}`,
        timestamp: record.detected_at,
        data: record.source_detail,
        status: record.job_errors?.length ? 'error' : 'success',
        confidence: record.confidence_after
      }]

      // If there's an enrichment job, add details
      if (record.enrichment_job) {
        const { data: job } = await supabase
          .from('enrichment_jobs')
          .select('*')
          .eq('id', record.enrichment_job.id)
          .single()

        if (job) {
          chain.push({
            id: job.id,
            type: 'enrichment_job',
            label: 'Enrichment Job',
            description: job.job_type.replace(/_/g, ' '),
            timestamp: job.created_at,
            data: job.parameters,
            status: job.status === 'completed' ? 'success' : 
                   job.status === 'failed' ? 'error' : 
                   job.status === 'processing' ? 'processing' : 'waiting'
          })

          // Add source API calls if available
          if (job.parameters?.api_calls) {
            const apiCalls = job.parameters.api_calls
            if (Array.isArray(apiCalls)) {
              apiCalls.forEach(call => {
                chain.push({
                  id: `api-${Math.random()}`,
                  type: 'api',
                  label: 'External API',
                  description: call.api_name || 'API Request',
                  timestamp: call.timestamp || job.created_at,
                  data: call,
                  status: call.success ? 'success' : 'error'
                })
              })
            }
          }
        }
      }

      // If there's source detail with a URL, add a web scraping step
      if (record.source_detail?.url) {
        chain.push({
          id: `scrape-${Math.random()}`,
          type: 'scraper',
          label: 'Web Scraping',
          description: `Scraped from ${new URL(record.source_detail.url).hostname}`,
          timestamp: record.detected_at,
          data: { url: record.source_detail.url },
          status: 'success'
        })
      }

      // Look for earlier provenance records for this field
      const { data: priorRecords } = await supabase
        .from('data_provenance')
        .select('*')
        .eq('contact_id', contactId)
        .eq('field_name', record.field_name)
        .lt('detected_at', record.detected_at)
        .order('detected_at', { ascending: false })
        .limit(1)

      if (priorRecords && priorRecords.length > 0) {
        const priorRecord = priorRecords[0]
        chain.push({
          id: priorRecord.id,
          type: 'previous_value',
          label: 'Previous Value',
          description: `Old value: ${priorRecord.new_value || '(empty)'}`,
          timestamp: priorRecord.detected_at,
          data: {},
          status: 'success',
          confidence: priorRecord.confidence_after
        })
      }

      // If there's a raw_data_id, add the data import step
      if (record.source_detail?.raw_data_id) {
        const { data: rawData } = await supabase
          .from('raw_contact_data')
          .select('*')
          .eq('id', record.source_detail.raw_data_id)
          .single()

        if (rawData) {
          chain.push({
            id: rawData.id,
            type: rawData.external_source.includes('upload') ? 'upload' : 'import',
            label: rawData.external_source.includes('upload') ? 'Data Upload' : 'Data Import',
            description: `Source: ${rawData.external_source}`,
            timestamp: rawData.created_at,
            data: rawData.raw_data,
            status: 'success'
          })
        }
      }

      // For the initial creation
      if (record.old_value === null && !record.source_detail?.raw_data_id) {
        chain.push({
          id: 'initial-creation',
          type: 'creation',
          label: 'Initial Creation',
          description: 'Contact was created',
          timestamp: record.detected_at,
          data: {},
          status: 'success'
        })
      }

      setSourceChain(chain)

    } catch (error) {
      console.error('Error building source chain:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'scraper':
        return 'Web Scraper'
      case 'upload':
        return 'CSV Upload'
      case 'api':
        return 'API Integration'
      case 'manual':
        return 'Manual Entry'
      case 'enrichment_job':
        return 'AI Enrichment'
      case 'sync':
        return 'Auto-Sync'
      default:
        return type
    }
  }

  const getSourceIcon = (type: string, status: string) => {
    if (status === 'processing') {
      return <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
    } else if (status === 'error') {
      return <XCircle className="w-6 h-6 text-red-600" />
    }

    switch (type) {
      case 'scraper':
        return <Globe className="w-6 h-6 text-blue-600" />
      case 'upload':
        return <Upload className="w-6 h-6 text-green-600" />
      case 'api':
        return <Zap className="w-6 h-6 text-purple-600" />
      case 'manual':
        return <UserCircle className="w-6 h-6 text-yellow-600" />
      case 'enrichment_job':
        return <Database className="w-6 h-6 text-orange-600" />
      case 'previous_value':
        return <GitBranch className="w-6 h-6 text-slate-600" />
      case 'creation':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      default:
        return <Search className="w-6 h-6 text-slate-600" />
    }
  }

  const getStepColor = (type: string, status: string) => {
    if (status === 'error') {
      return 'border-red-300 bg-red-50'
    } else if (status === 'processing') {
      return 'border-blue-300 bg-blue-50'
    } else if (status === 'waiting') {
      return 'border-yellow-300 bg-yellow-50'
    }

    switch (type) {
      case 'scraper':
        return 'border-blue-300 bg-blue-50'
      case 'upload':
        return 'border-green-300 bg-green-50'
      case 'api':
        return 'border-purple-300 bg-purple-50'
      case 'manual':
        return 'border-yellow-300 bg-yellow-50'
      case 'enrichment_job':
        return 'border-orange-300 bg-orange-50'
      case 'previous_value':
        return 'border-slate-300 bg-slate-50'
      case 'creation':
        return 'border-green-300 bg-green-50'
      default:
        return 'border-slate-300 bg-slate-50'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Data Source Chain</DialogTitle>
          <DialogDescription>
            Complete history of how this data was acquired, processed and verified
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : sourceChain.length > 0 ? (
            <div className="space-y-4">
              {record && (
                <div className="text-center mb-6">
                  <h3 className="font-medium text-lg text-slate-900">
                    {record.field_name.charAt(0).toUpperCase() + record.field_name.slice(1)} Field
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Current Value: <span className="font-medium">{record.new_value || '(empty)'}</span>
                  </p>
                  {record.confidence_after !== undefined && (
                    <div className="mt-1 flex justify-center">
                      <ConfidenceBadge 
                        before={record.confidence_before}
                        after={record.confidence_after}
                        size="md"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Chain Timeline */}
              <div className="relative">
                {sourceChain.map((node, index) => (
                  <div key={node.id} className="mb-6 relative">
                    {/* Connector Line */}
                    {index < sourceChain.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-10 bg-slate-300 -z-10" />
                    )}
                    
                    <div className={`border rounded-lg p-4 ${getStepColor(node.type, node.status)}`}>
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 flex-shrink-0">
                          {getSourceIcon(node.type, node.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-slate-900">{node.label}</h4>
                              <Badge variant="outline">
                                {format(new Date(node.timestamp), 'MMM d, yyyy h:mm a')}
                              </Badge>
                            </div>
                            {node.confidence !== undefined && (
                              <ConfidenceBadge
                                before={0}
                                after={node.confidence}
                              />
                            )}
                          </div>
                          <p className="text-sm text-slate-700 mt-1">
                            {node.description}
                          </p>
                          
                          {/* Additional Details */}
                          {node.type === 'scraper' && node.data?.url && (
                            <div className="mt-2 text-xs text-blue-600">
                              <a 
                                href={node.data.url}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="flex items-center"
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                {node.data.url.substring(0, 50)}
                                {node.data.url.length > 50 ? '...' : ''}
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          )}
                          
                          {node.type === 'enrichment_job' && node.data?.selective_fields && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {node.data.selective_fields.map((field: string) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {node.status === 'error' && (
                            <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                              {node.data?.error_message || 'An error occurred during processing'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No source chain data available</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}