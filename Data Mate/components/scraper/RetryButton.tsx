'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, RotateCcw } from "lucide-react"

interface RetryButtonProps {
  jobId: string
  onRetrySuccess?: () => void
  variant?: 'default' | 'outline' | 'ghost'
}

export function RetryButton({ 
  jobId, 
  onRetrySuccess,
  variant = 'outline'
}: RetryButtonProps) {
  const [loading, setLoading] = useState(false)
  
  const handleRetry = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/jobs/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          id: jobId
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to retry job')
      }
      
      toast.success('Job queued for retry', {
        description: 'The job has been resubmitted to the queue'
      })
      
      if (onRetrySuccess) {
        onRetrySuccess()
      }
    } catch (error) {
      toast.error('Failed to retry job', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      })
      console.error('Retry error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button 
      variant={variant} 
      size="sm" 
      onClick={handleRetry} 
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RotateCcw className="h-3 w-3" />
      )}
      {variant === 'default' && <span className="ml-1">Retry</span>}
    </Button>
  )
}