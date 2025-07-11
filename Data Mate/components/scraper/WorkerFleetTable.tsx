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
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Activity } from "lucide-react"

interface WorkerAgent {
  id: string
  agent_name: string
  platform: string
  status: string
  effective_status: string
  capabilities: any
  last_heartbeat: string
  successful_jobs: number
  failed_jobs: number
  avg_duration_ms: number
  seconds_since_heartbeat: number
}

interface WorkerFleetTableProps {
  data: WorkerAgent[]
}

export function WorkerFleetTable({ data }: WorkerFleetTableProps) {
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null)
  
  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
  
  const formatDuration = (milliseconds: number) => {
    if (isNaN(milliseconds) || milliseconds === 0) return '—';
    const seconds = milliseconds / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  }
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" /> Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" /> Offline
          </Badge>
        );
      case 'draining':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" /> Draining
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            {status}
          </Badge>
        );
    }
  }
  
  const renderCapabilities = (capabilities: any) => {
    if (!capabilities) return null;
    
    return (
      <div className="space-y-1">
        {capabilities.tags && (
          <div>
            <span className="text-sm font-medium">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {capabilities.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {Object.entries(capabilities)
          .filter(([key]) => key !== 'tags')
          .map(([key, value]) => (
            <div key={key}>
              <span className="text-sm font-medium capitalize">{key.replace('_', ' ')}:</span>
              <span className="text-sm ml-2">
                {typeof value === 'boolean' 
                  ? (value ? 'Yes' : 'No')
                  : String(value)}
              </span>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-md border border-slate-200">
          <Activity className="h-8 w-8 text-slate-300 mb-2" />
          <h3 className="text-lg font-medium text-slate-900">No Workers Online</h3>
          <p className="text-sm text-slate-500 mt-1">No worker agents are currently registered.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Worker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Heartbeat</TableHead>
                <TableHead>Avg. Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((worker) => (
                <Collapsible
                  key={worker.id}
                  open={expandedWorker === worker.id}
                  onOpenChange={() => setExpandedWorker(expandedWorker === worker.id ? null : worker.id)}
                >
                  <TableRow>
                    <TableCell className="font-medium">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center cursor-pointer">
                          {expandedWorker === worker.id ? (
                            <ChevronDown className="h-4 w-4 mr-2 text-slate-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2 text-slate-500" />
                          )}
                          <span>{worker.agent_name}</span>
                        </div>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(worker.effective_status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {worker.platform || 'generic'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {worker.successful_jobs + worker.failed_jobs > 0 ? (
                              <span className={worker.successful_jobs / (worker.successful_jobs + worker.failed_jobs) >= 0.9 ? 'text-green-600' : 'text-red-600'}>
                                {Math.round(worker.successful_jobs / (worker.successful_jobs + worker.failed_jobs) * 100)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-1">
                              <p>Successful jobs: {worker.successful_jobs}</p>
                              <p>Failed jobs: {worker.failed_jobs}</p>
                              <p>Total jobs: {worker.successful_jobs + worker.failed_jobs}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {formatTimeAgo(worker.seconds_since_heartbeat)}
                    </TableCell>
                    <TableCell>
                      {formatDuration(worker.avg_duration_ms || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="cursor-default">
                        {worker.id.slice(0, 8)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  
                  <CollapsibleContent>
                    <TableRow>
                      <TableCell colSpan={7} className="bg-slate-50">
                        <div className="p-4">
                          <h4 className="font-medium mb-2">Worker Capabilities</h4>
                          {renderCapabilities(worker.capabilities)}
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <div>
                              <h5 className="text-sm font-medium mb-1">Status</h5>
                              <div className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Current:</span>
                                  <span>{worker.status}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Effective:</span>
                                  <span>{worker.effective_status}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-slate-500">Last heartbeat:</span>
                                  <span>{new Date(worker.last_heartbeat).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-1">Performance</h5>
                              <div className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Successful jobs:</span>
                                  <span className="text-green-600">{worker.successful_jobs}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Failed jobs:</span>
                                  <span className="text-red-600">{worker.failed_jobs}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Avg. duration:</span>
                                  <span>{formatDuration(worker.avg_duration_ms || 0)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-1">Details</h5>
                              <div className="text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Worker ID:</span>
                                  <span className="font-mono text-xs">{worker.id}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-500">Platform:</span>
                                  <span>{worker.platform || 'generic'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
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