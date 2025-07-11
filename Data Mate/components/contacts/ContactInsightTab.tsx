'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase, AIInsight, Contact } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb,
  Star,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ContactInsightTabProps {
  contactId: string
  contact: Contact
}

export function ContactInsightTab({ contactId }: ContactInsightTabProps) {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (user && contactId) {
      fetchInsights()
    }
  }, [user, contactId])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('contact_id', contactId)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setInsights(data || [])
    } catch (err) {
      console.error('Error fetching contact insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async () => {
    try {
      setGenerating(true)
      
      // TODO: Implement contact-specific insight generation
      // This would call an API endpoint similar to the audience insights
      
      // For now, simulate insight generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refresh insights after generation
      await fetchInsights()
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setGenerating(false)
    }
  }

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'conversion_prediction':
        return Target
      case 'persona_conflict':
        return AlertCircle
      case 'outreach_suggestion':
        return Lightbulb
      case 'causal_analysis':
        return TrendingUp
      default:
        return Brain
    }
  }

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'conversion_prediction':
        return 'bg-green-100 text-green-700'
      case 'persona_conflict':
        return 'bg-red-100 text-red-700'
      case 'outreach_suggestion':
        return 'bg-blue-100 text-blue-700'
      case 'causal_analysis':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-purple-100 text-purple-700'
    }
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-48 h-6 bg-slate-200 animate-pulse rounded" />
              <div className="w-32 h-4 bg-slate-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-3/4 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Insights</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchInsights} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No AI Insights Yet</h3>
            <p className="text-slate-600 mb-6">
              Generate AI-powered insights to understand this contact's potential and behavior patterns
            </p>
            <Button 
              onClick={generateInsights}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Generate New Insights Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">AI-Generated Insights</h3>
          <p className="text-sm text-slate-600">
            {insights.length} insight{insights.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button 
          onClick={generateInsights}
          disabled={generating}
          variant="outline"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Insights
            </>
          )}
        </Button>
      </div>

      {/* Insights List */}
      {insights.map((insight) => {
        const Icon = getInsightTypeIcon(insight.insight_type)
        
        return (
          <Card key={insight.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        className={getInsightTypeColor(insight.insight_type)}
                        variant="secondary"
                      >
                        {insight.insight_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      {insight.confidence_score && (
                        <div className="flex items-center space-x-1">
                          <Star className={`w-4 h-4 ${getConfidenceColor(insight.confidence_score)}`} />
                          <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence_score)}`}>
                            {(insight.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">{insight.description}</p>
              
              {/* Display insight data if available */}
              {insight.data && typeof insight.data === 'object' && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Analysis Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {Object.entries(insight.data).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-slate-700 capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        <span className="ml-2 text-slate-600">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}