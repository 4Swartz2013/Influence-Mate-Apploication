'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, Info } from "lucide-react"

interface ProxyData {
  proxy_id: string
  total_hits: number
  fails: number
  fail_pct: number
  last_used_at?: string
}

interface ProxyHeatmapProps {
  data: ProxyData[]
}

export function ProxyHeatmap({ data }: ProxyHeatmapProps) {
  const [hoveredProxy, setHoveredProxy] = useState<ProxyData | null>(null)
  
  // Get color based on failure percentage
  const getFailureColor = (failPct: number) => {
    if (failPct >= 70) return 'bg-red-500 text-white';
    if (failPct >= 50) return 'bg-red-400 text-white';
    if (failPct >= 30) return 'bg-orange-400 text-white';
    if (failPct >= 15) return 'bg-yellow-400 text-slate-900';
    if (failPct >= 5) return 'bg-blue-400 text-white';
    return 'bg-slate-100 text-slate-600';
  }
  
  // Get the intensity label based on failure percentage
  const getIntensityLabel = (failPct: number) => {
    if (failPct >= 70) return 'Very High';
    if (failPct >= 50) return 'High';
    if (failPct >= 30) return 'Medium';
    if (failPct >= 15) return 'Low';
    if (failPct >= 5) return 'Very Low';
    return 'Minimal';
  }
  
  // Get formatted time
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  }
  
  // Get a shorter proxy ID for display
  const getDisplayProxyId = (id: string) => {
    if (id === 'direct-connection') return 'Direct';
    if (id.startsWith('env-proxy-')) return `ENV-${id.slice(10)}`;
    return id.slice(0, 7);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <span>Proxy Failure Heatmap</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 max-w-xs">
                  <p className="font-semibold">Proxy Failure Rates</p>
                  <p className="text-sm">Colors represent failure percentage of proxies in the last 24h</p>
                  <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>70%+ (Very High)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-400 rounded"></div>
                      <span>30-50% (Medium)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                      <span>15-30% (Low)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-400 rounded"></div>
                      <span>5-15% (Very Low)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-slate-100 rounded"></div>
                      <span>0-5% (Minimal)</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No proxy data available</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
              {data.map((proxy) => (
                <TooltipProvider key={proxy.proxy_id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`${getFailureColor(proxy.fail_pct)} p-2 rounded-md cursor-pointer text-center transition-all hover:scale-105`}
                        onMouseEnter={() => setHoveredProxy(proxy)}
                        onMouseLeave={() => setHoveredProxy(null)}
                      >
                        <div className="font-semibold text-sm">
                          {proxy.fail_pct.toFixed(1)}%
                        </div>
                        <div className="text-xs truncate">
                          {getDisplayProxyId(proxy.proxy_id)}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">Proxy: {proxy.proxy_id}</p>
                        <div className="grid grid-cols-2 gap-x-3 text-xs">
                          <span>Failure rate:</span>
                          <span>{proxy.fail_pct.toFixed(1)}%</span>
                          <span>Status:</span>
                          <span>{getIntensityLabel(proxy.fail_pct)}</span>
                          <span>Total requests:</span>
                          <span>{proxy.total_hits}</span>
                          <span>Failed requests:</span>
                          <span>{proxy.fails}</span>
                          <span>Last used:</span>
                          <span>{getTimeAgo(proxy.last_used_at)}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {/* Selected Proxy Details */}
            {hoveredProxy && (
              <div className="mt-2 bg-slate-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <span>Proxy Details</span>
                  <Badge variant="outline">{getIntensityLabel(hoveredProxy.fail_pct)}</Badge>
                </h4>
                <div className="grid grid-cols-2 mt-2 text-sm">
                  <div className="text-slate-500">ID:</div>
                  <div className="font-mono text-xs">{hoveredProxy.proxy_id}</div>
                  <div className="text-slate-500">Failure Rate:</div>
                  <div className={hoveredProxy.fail_pct > 15 ? "text-red-600 font-semibold" : ""}>
                    {hoveredProxy.fail_pct.toFixed(1)}%
                  </div>
                  <div className="text-slate-500">Success Rate:</div>
                  <div>{(100 - hoveredProxy.fail_pct).toFixed(1)}%</div>
                  <div className="text-slate-500">Total Hits:</div>
                  <div>{hoveredProxy.total_hits}</div>
                  <div className="text-slate-500">Failed Requests:</div>
                  <div>{hoveredProxy.fails}</div>
                  <div className="text-slate-500">Last Used:</div>
                  <div>{getTimeAgo(hoveredProxy.last_used_at)}</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}