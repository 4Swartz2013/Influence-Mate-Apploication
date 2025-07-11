'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Brain, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface GenerateInsightsButtonProps {
  audienceId: string
  onInsightGenerated?: () => void
  disabled?: boolean
}

export function GenerateInsightsButton({ 
  audienceId, 
  onInsightGenerated,
  disabled = false 
}: GenerateInsightsButtonProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const generateInsights = async () => {
    if (!user) return

    try {
      setLoading(true)

      const response = await fetch(`/api/audiences/${audienceId}/generate-insights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate insights')
      }

      toast.success(`AI insights generated: ${result.persona_label}`, {
        description: `Analysis completed with ${result.confidence_score}% confidence`
      })

      onInsightGenerated?.()

    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={generateInsights}
      disabled={loading || disabled}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate AI Insights
        </>
      )}
    </Button>
  )
}