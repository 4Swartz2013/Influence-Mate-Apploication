'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  Users,
  AlertTriangle,
  Zap
} from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HealthCardsProps {
  successRate: number
  queueLag: number
  activeWorkers: number
  pendingJobs: number
  proxyFailRate: number
  activeJobsCount: number
}

export function HealthCards({ 
  successRate, 
  queueLag, 
  activeWorkers, 
  pendingJobs,
  proxyFailRate,
  activeJobsCount
}: HealthCardsProps) {
  
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-500";
    if (rate >= 75) return "text-yellow-500";
    return "text-red-500";
  }
  
  const getQueueLagColor = (lag: number) => {
    if (lag < 300) return "text-green-500"; // < 5 minutes
    if (lag < 1800) return "text-yellow-500"; // < 30 minutes
    return "text-red-500";
  }
  
  const getProxyFailColor = (rate: number) => {
    if (rate <= 5) return "text-green-500";
    if (rate <= 15) return "text-yellow-500";
    return "text-red-500";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Success Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">24h Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getSuccessRateColor(successRate)}`}>
              {successRate}%
            </div>
            <Badge 
              variant={successRate >= 90 ? "default" : successRate >= 75 ? "outline" : "destructive"}
              className="text-xs"
            >
              {successRate >= 90 ? "Healthy" : successRate >= 75 ? "Degraded" : "Alert"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on jobs completed in the last 24 hours
          </p>
        </CardContent>
      </Card>
      
      {/* Queue Lag Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Queue Lag</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <div className={`text-2xl font-bold ${getQueueLagColor(queueLag)}`}>
                    {formatTime(queueLag)}
                  </div>
                  {pendingJobs > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {pendingJobs} pending
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Oldest job has been waiting for {formatTime(queueLag)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground mt-1">
            Age of oldest queued job
          </p>
        </CardContent>
      </Card>
      
      {/* Active Workers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${activeWorkers > 0 ? "text-green-500" : "text-red-500"}`}>
              {activeWorkers}
            </div>
            <Badge variant={activeWorkers > 0 ? "default" : "destructive"} className="text-xs">
              {activeWorkers > 0 ? "Online" : "Offline"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Workers with recent heartbeat
          </p>
        </CardContent>
      </Card>
      
      {/* Proxy Fail Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Proxy Fail %</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getProxyFailColor(proxyFailRate)}`}>
              {proxyFailRate.toFixed(1)}%
            </div>
            <Badge 
              variant={proxyFailRate <= 5 ? "default" : proxyFailRate <= 15 ? "outline" : "destructive"}
              className="text-xs"
            >
              {proxyFailRate <= 5 ? "Good" : proxyFailRate <= 15 ? "Warning" : "Critical"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Average proxy failure rate (24h)
          </p>
        </CardContent>
      </Card>
      
      {/* Active Jobs Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-500">
              {activeJobsCount}
            </div>
            <Badge variant="outline" className="text-xs">
              Running
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently processing jobs
          </p>
        </CardContent>
      </Card>
      
      {/* System Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${successRate >= 85 && queueLag < 1800 ? "text-green-500" : "text-red-500"}`}>
              {successRate >= 85 && queueLag < 1800 ? "Operational" : "Degraded"}
            </div>
            {successRate < 85 || queueLag >= 1800 ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Overall scraper health status
          </p>
        </CardContent>
      </Card>
    </div>
  )
}