'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight,
  Clock,
  XCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { RetryButton } from "./RetryButton"

interface JobError {
  id: string
  error_type: string
  error_message: string
  context?: {
    [key: string]: any
  }
  created_at: string
  enrichment_job_id?: string
  retry_count?: number
}

interface JobErrorTableProps {
  data: JobError[]
  platformFilter?: string
  onRetrySuccess?: () => void
}

export function JobErrorTable({ 
  data, 
  platformFilter,
  onRetrySuccess
}: JobErrorTableProps) {
  const [expandedError, setExpandedError] = useState<string | null>(null)
  
  // Filter data by platform if filter is provided
  const filteredData = platformFilter 
    ? data.filter(error => 
        error.context?.method?.includes(platformFilter) ||
        error.context?.platform?.includes(platformFilter) ||
        error.error_type?.includes(platformFilter)
      )
    : data
  
  const getErrorTypeColor = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('rate') || lowerType.includes('limit')) return 'bg-yellow-100 text-yellow-800'
    if (lowerType.includes('token') || lowerType.includes('auth')) return 'bg-purple-100 text-purple-800'
    if (lowerType.includes('captcha')) return 'bg-orange-100 text-orange-800'
    if (lowerType.includes('network') || lowerType.includes('timeout')) return 'bg-blue-100 text-blue-800'
    if (lowerType.includes('fail')) return 'bg-red-100 text-red-800'
    return 'bg-slate-100 text-slate-800'
  }

  const getPlatformFromError = (error: JobError): string => {
    // Try to extract platform from context
    if (error.context?.platform) return error.context.platform;
    if (error.context?.method) {
      if (error.context.method.includes('instagram')) return 'Instagram';
      if (error.context.method.includes('facebook')) return 'Facebook';
      if (error.context.method.includes('twitter')) return 'Twitter';
      if (error.context.method.includes('tiktok')) return 'TikTok';
    }
    
    // Try from error type
    if (error.error_type) {
      if (error.error_type.includes('INSTAGRAM')) return 'Instagram';
      if (error.error_type.includes('FACEBOOK')) return 'Facebook';
      if (error.error_type.includes('TWITTER')) return 'Twitter';
      if (error.error_type.includes('TIKTOK')) return 'TikTok';
    }
    
    return 'Unknown';
  }
  
  return (
    <div className="space-y-4">
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-md border border-slate-200">
          <XCircle className="h-8 w-8 text-slate-300 mb-2" />
          <h3 className="text-lg font-medium text-slate-900">No Errors Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {platformFilter ? 'No errors for this platform.' : 'No recent errors detected in the system.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Error Type</TableHead>
                <TableHead className="w-[100px]">Platform</TableHead>
                <TableHead className="w-[300px]">Message</TableHead>
                <TableHead className="w-[120px]">Time</TableHead>
                <TableHead className="w-[120px]">Retries</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((error) => (
                <Collapsible
                  key={error.id}
                  open={expandedError === error.id}
                  onOpenChange={() => setExpandedError(expandedError === error.id ? null : error.id)}
                >
                  <TableRow className="group">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center cursor-pointer">
                          {expandedError === error.id ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-slate-500" />
                          )}
                          <Badge 
                            variant="secondary"
                            className={getErrorTypeColor(error.error_type)}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {error.error_type}
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPlatformFromError(error)}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate max-w-[300px]" title={error.error_message}>
                      {error.error_message}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {error.retry_count ? (
                        <Badge variant="outline" className="bg-yellow-50">
                          {error.retry_count} {error.retry_count === 1 ? 'retry' : 'retries'}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {error.enrichment_job_id ? (
                        <RetryButton 
                          jobId={error.enrichment_job_id} 
                          onRetrySuccess={onRetrySuccess} 
                        />
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-700">
                          No job
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  <CollapsibleContent>
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={6}>
                        <div className="p-4">
                          <h4 className="font-medium mb-2">Error Details</h4>
                          <div className="bg-slate-100 p-3 rounded-md font-mono text-xs overflow-auto max-h-40">
                            <pre>{error.error_message}</pre>
                          </div>
                          
                          {error.context && Object.keys(error.context).length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Context</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(error.context).map(([key, value]) => (
                                  <div key={key} className="bg-white p-2 rounded border border-slate-200">
                                    <span className="text-xs font-medium text-slate-600">{key}:</span>
                                    <span className="text-xs ml-2 font-mono">
                                      {typeof value === 'object'
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {error.enrichment_job_id && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Related Job</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="font-mono">
                                  {error.enrichment_job_id}
                                </Badge>
                                <RetryButton 
                                  jobId={error.enrichment_job_id} 
                                  onRetrySuccess={onRetrySuccess}
                                  variant="default"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}