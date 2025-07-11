'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Zap 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SyncStatusIndicatorProps {
  contactId?: string
  showDetails?: boolean
  onSyncTriggered?: () => void
}

interface SyncStatus {
  status: 'synced' | 'outdated' | 'partial' | 'syncing'
  outdatedFields: string[]
  lastSyncAt?: string
  pendingChanges: number
}

export function SyncStatusIndicator({ 
  contactId, 
  showDetails = false,
  onSyncTriggered 
}: SyncStatusIndicatorProps) {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSyncStatus()
    }
  }, [user, contactId])

  const fetchSyncStatus = async () => {
    try {
      setLoading(true)

      if (contactId) {
        // Get status for specific contact
        const { data: contact, error } = await supabase
          .from('contacts')
          .select('sync_status, outdated_fields, last_sync_at')
          .eq('id', contactId)
          .eq('user_id', user!.id)
          .single()

        if (error) throw error

        // Get pending changes for this contact
        const { count: pendingCount } = await supabase
          .from('sync_change_log')
          .select('*', { count: 'exact', head: true })
          .eq('contact_id', contactId)
          .eq('sync_status', 'pending')

        setSyncStatus({
          status: contact.sync_status || 'synced',
          outdatedFields: contact.outdated_fields || [],
          lastSyncAt: contact.last_sync_at,
          pendingChanges: pendingCount || 0
        })
      } else {
        // Get global sync status
        const { count: pendingCount } = await supabase
          .from('sync_change_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id)
          .eq('sync_status', 'pending')

        const { count: outdatedCount } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user!.id)
          .neq('sync_status', 'synced')

        setSyncStatus({
          status: (pendingCount || 0) > 0 ? 'outdated' : 'synced',
          outdatedFields: [],
          pendingChanges: pendingCount || 0
        })
      }
    } catch (error) {
      console.error('Error fetching sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerSync = async () => {
    if (!user) return

    try {
      setSyncing(true)

      const response = await fetch('/api/sync/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          contactId: contactId
        })
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      await fetchSyncStatus()
      onSyncTriggered?.()

    } catch (error) {
      console.error('Error triggering sync:', error)
    } finally {
      setSyncing(false)
    }
  }

  const getStatusIcon = () => {
    if (syncing || loading) return <RefreshCw className="w-4 h-4 animate-spin" />
    
    switch (syncStatus?.status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'outdated':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'partial':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = () => {
    switch (syncStatus?.status) {
      case 'synced':
        return 'bg-green-100 text-green-700'
      case 'outdated':
        return 'bg-orange-100 text-orange-700'
      case 'partial':
        return 'bg-yellow-100 text-yellow-700'
      case 'syncing':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = () => {
    if (syncing) return 'Syncing...'
    
    switch (syncStatus?.status) {
      case 'synced':
        return 'Up to date'
      case 'outdated':
        return `${syncStatus.pendingChanges} pending changes`
      case 'partial':
        return `${syncStatus.outdatedFields.length} fields outdated`
      case 'syncing':
        return 'Syncing...'
      default:
        return 'Unknown'
    }
  }

  const getTooltipContent = () => {
    if (!syncStatus) return 'Loading sync status...'

    let content = `Status: ${getStatusLabel()}`
    
    if (syncStatus.lastSyncAt) {
      content += `\nLast sync: ${formatDistanceToNow(new Date(syncStatus.lastSyncAt), { addSuffix: true })}`
    }
    
    if (syncStatus.outdatedFields.length > 0) {
      content += `\nOutdated fields: ${syncStatus.outdatedFields.join(', ')}`
    }

    return content
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    )
  }

  if (!syncStatus) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor()} variant="secondary">
              <div className="flex items-center space-x-1">
                {getStatusIcon()}
                <span>{showDetails ? getStatusLabel() : syncStatus.status}</span>
              </div>
            </Badge>
            
            {(syncStatus.status === 'outdated' || syncStatus.status === 'partial') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={triggerSync}
                disabled={syncing}
                className="h-6 w-6 p-0"
              >
                <Zap className="w-3 h-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <pre className="whitespace-pre-wrap text-xs">{getTooltipContent()}</pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}