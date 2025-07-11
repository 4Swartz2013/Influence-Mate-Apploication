'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBadge } from './ConfidenceBadge'
import {
  ArrowRight,
  ExternalLink,
  Zap,
  Upload,
  Globe,
  UserCircle,
  GitBranch,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle
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

interface ProvenanceNodeProps {
  record: ProvenanceRecord
  isFirst: boolean
  isLast: boolean
  onViewSourceChain: () => void
}

export function ProvenanceNode({ 
  record, 
  isFirst, 
  isLast,
  onViewSourceChain
}: ProvenanceNodeProps) {
  const [expanded, setExpanded] = useState(isFirst)

  const getSourceTypeIcon = () => {
    switch (record.source_type) {
      case 'scraper':
        return <Globe className="w-4 h-4" />
      case 'upload':
        return <Upload className="w-4 h-4" />
      case 'api':
        return <Zap className="w-4 h-4" />
      case 'manual':
        return <UserCircle className="w-4 h-4" />
      case 'enrichment_job':
        return <RefreshCw className="w-4 h-4" />
      default:
        return <GitBranch className="w-4 h-4" />
    }
  }

  const getSourceTypeLabel = () => {
    switch (record.source_type) {
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
        return record.source_type
    }
  }

  const getSourceColor = () => {
    // If there are errors, show red regardless of source
    if (record.job_errors && record.job_errors.length > 0) {
      return 'bg-red-100 text-red-700'
    }

    switch (record.source_type) {
      case 'scraper':
        return 'bg-blue-100 text-blue-700'
      case 'upload':
        return 'bg-green-100 text-green-700'
      case 'api':
        return 'bg-purple-100 text-purple-700'
      case 'manual':
        return 'bg-yellow-100 text-yellow-700'
      case 'enrichment_job':
        return 'bg-orange-100 text-orange-700'
      case 'sync':
        return 'bg-indigo-100 text-indigo-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getSourceDetail = () => {
    const detail = record.source_detail
    if (!detail || typeof detail !== 'object') return null

    switch (record.source_type) {
      case 'scraper':
        return detail.url ? (
          <div className="text-xs text-blue-600 flex items-center">
            <Globe className="w-3 h-3 mr-1" />
            <span className="underline truncate max-w-48">{detail.url}</span>
          </div>
        ) : null
      case 'api':
        return detail.api_name ? (
          <div className="text-xs text-purple-600">{detail.api_name}</div>
        ) : null
      case 'enrichment_job':
        return record.enrichment_job ? (
          <div className="text-xs text-orange-600 flex items-center">
            {record.enrichment_job.job_type.replace('_', ' ')}
            {renderJobStatus(record.enrichment_job.status)}
          </div>
        ) : null
      default:
        return null
    }
  }

  const renderJobStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
      case 'failed':
        return <XCircle className="w-3 h-3 ml-1 text-red-500" />
      case 'processing':
        return <RefreshCw className="w-3 h-3 ml-1 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-3 h-3 ml-1 text-yellow-500" />
    }
  }

  const renderErrors = () => {
    if (!record.job_errors || record.job_errors.length === 0) return null
    
    return (
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
        <div className="flex items-start space-x-1 text-xs text-red-700">
          <AlertTriangle className="w-3 h-3 mt-0.5" />
          <div>
            {record.job_errors.map(error => (
              <div key={error.id} className="mb-1">
                <span className="font-semibold">{error.error_type}: </span>
                {error.error_message}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderValue = (value: string) => {
    if (!value) return <span className="text-slate-400 italic">empty</span>
    
    if (value.length > 50) {
      return <span title={value}>{value.substring(0, 50)}...</span>
    }
    
    return <span>{value}</span>
  }

  const handleToggle = () => {
    setExpanded(prev => !prev)
  }

  return (
    <div className="relative pb-5">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-4 top-8 w-px h-full bg-slate-200 -z-10" />
      )}

      {/* Node */}
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${getSourceColor()}`}>
          {getSourceTypeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={getSourceColor()}>
                {getSourceTypeLabel()}
              </Badge>
              <span className="text-xs text-slate-500">
                {format(new Date(record.detected_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <ConfidenceBadge 
                before={record.confidence_before}
                after={record.confidence_after}
              />
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleToggle}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {getSourceDetail()}

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                <div className="flex items-center text-sm">
                  <div className="w-20 text-slate-500">Before:</div>
                  <div className="text-slate-700">{renderValue(record.old_value)}</div>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <div className="w-20 text-slate-500">After:</div>
                  <div className="text-slate-700 font-medium">{renderValue(record.new_value)}</div>
                </div>
              </div>

              {renderErrors()}

              {/* Actions */}
              <div className="flex justify-end mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewSourceChain}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  View Source Chain
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChevronUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ChevronDown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}