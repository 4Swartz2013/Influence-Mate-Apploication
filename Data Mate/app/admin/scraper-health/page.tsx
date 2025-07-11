'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/components/ui/use-toast'
import { HealthCards } from '@/components/scraper/HealthCards'
import { PlatformTable } from '@/components/scraper/PlatformTable'
import { ProxyHeatmap } from '@/components/scraper/ProxyHeatmap'
import { WorkerFleetTable } from '@/components/scraper/WorkerFleetTable'
import { JobErrorTable } from '@/components/scraper/JobErrorTable'
import { ConfidenceChart } from '@/components/scraper/ConfidenceChart'
import { AlertTriangle, ClipboardCheck, Database, RefreshCw, Server } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ScraperHealthPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPlatform, setSelectedPlatform] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [metricsData, setMetricsData] = useState<{
    platformKpis: any[];
    workerStats: any[];
    proxyStats: any[];
    jobQueueLag: any;
    confidenceStats: any[];
    recentErrors: any[];
    activeJobsCount: number;
    successRate: number;
  }>({
    platformKpis: [],
    workerStats: [],
    proxyStats: [],
    jobQueueLag: { oldest_job_age_sec: 0, pending_jobs: 0 },
    confidenceStats: [],
    recentErrors: [],
    activeJobsCount: 0,
    successRate: 0
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
      
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchData(true)
      }, 30000)
      
      setRefreshInterval(interval)
      
      return () => {
        if (refreshInterval) clearInterval(refreshInterval)
      }
    }
  }, [user, authLoading])
  
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/metrics/scraper-health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch metrics')
      }
      
      const data = await response.json()
      setMetricsData(data)
      setLastRefresh(new Date())
      
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
      if (!silent) {
        toast({
          title: 'Error loading metrics',
          description: err instanceof Error ? err.message : 'Failed to load metrics',
          variant: 'destructive'
        })
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }
  
  const handleRefresh = () => {
    fetchData()
    toast({
      title: 'Refreshing data',
      description: 'Fetching the latest metrics...'
    })
  }
  
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform === selectedPlatform ? undefined : platform)
  }
  
  const handleRetrySuccess = () => {
    fetchData()
    toast({
      title: 'Job retry requested',
      description: 'The job has been queued for retry',
    })
  }
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold text-center mb-2">Authentication Required</h1>
        <p className="text-gray-600 text-center mb-4">
          You need to be logged in to view the scraper health dashboard.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Server className="h-6 w-6 mr-2 text-blue-600" />
              Scraper Health & Observability
            </h1>
            <p className="text-slate-600">
              Real-time monitoring of scraper performance, worker health, and confidence metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Health Cards */}
        <HealthCards
          successRate={metricsData.successRate}
          queueLag={metricsData.jobQueueLag.oldest_job_age_sec || 0}
          activeWorkers={metricsData.workerStats.filter(w => w.effective_status === 'online').length}
          pendingJobs={metricsData.jobQueueLag.pending_jobs || 0}
          proxyFailRate={
            metricsData.proxyStats.length > 0
              ? metricsData.proxyStats.reduce((sum: number, proxy: any) => sum + proxy.fail_pct, 0) / 
                metricsData.proxyStats.length
              : 0
          }
          activeJobsCount={metricsData.activeJobsCount}
        />

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="platforms" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Platforms</span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Workers</span>
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Errors</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <PlatformTable 
                  data={metricsData.platformKpis} 
                  onSelectPlatform={handlePlatformSelect}
                  selectedPlatform={selectedPlatform}
                />
              </div>
              <div className="lg:col-span-1">
                <ConfidenceChart data={metricsData.confidenceStats} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Recent Errors</h3>
                <JobErrorTable 
                  data={metricsData.recentErrors.slice(0, 5)} 
                  platformFilter={selectedPlatform}
                  onRetrySuccess={handleRetrySuccess}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Proxy Health</h3>
                <ProxyHeatmap data={metricsData.proxyStats} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Platform Performance</h3>
            <PlatformTable 
              data={metricsData.platformKpis} 
              onSelectPlatform={handlePlatformSelect}
              selectedPlatform={selectedPlatform}
            />
            
            <h3 className="text-lg font-medium mt-6">Platform-Specific Errors</h3>
            <JobErrorTable 
              data={metricsData.recentErrors.slice(0, 10)}
              platformFilter={selectedPlatform}
              onRetrySuccess={handleRetrySuccess}
            />
            
            <div className="mt-6">
              <ConfidenceChart data={metricsData.confidenceStats} />
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Worker Fleet Status</h3>
            <WorkerFleetTable data={metricsData.workerStats} />
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Proxy Health</h3>
              <ProxyHeatmap data={metricsData.proxyStats} />
            </div>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">Recent Job Errors</h3>
            <JobErrorTable 
              data={metricsData.recentErrors} 
              platformFilter={selectedPlatform}
              onRetrySuccess={handleRetrySuccess}
            />
            
            {metricsData.jobQueueLag.stale_jobs > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Stale Jobs Detected</AlertTitle>
                <AlertDescription>
                  There are {metricsData.jobQueueLag.stale_jobs} jobs in the queue that have been waiting for more than 1 hour.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}