'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GenerateInsightsButton } from './GenerateInsightsButton'
import { supabase, AudienceInsight, AudienceSegment } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb,
  Star,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AudienceInsightsProps {
  audienceId: string
  audience: AudienceSegment
}

export function AudienceInsights({ audienceId }: AudienceInsightsProps) {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AudienceInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && audienceId) {
      fetchInsights()
    }
  }, [user, audienceId])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('audience_insights')
        .select('*')
        .eq('audience_segment_id', audienceId)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (queryError) throw queryError
      setInsights(data || [])
    } catch (err) {
      console.error('Error fetching audience insights:', err)
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'persona_analysis':
        return Brain
      case 'engagement_patterns':
        return TrendingUp
      case 'outreach_recommendations':
        return Target
      case 'behavioral_insights':
        return Lightbulb
      default:
        return AlertCircle
    }
  }

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'persona_analysis':
        return 'bg-purple-100 text-purple-700'
      case 'engagement_patterns':
        return 'bg-blue-100 text-blue-700'
      case 'outreach_recommendations':
        return 'bg-green-100 text-green-700'
      case 'behavioral_insights':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderPersonaInsight = (insight: AudienceInsight) => {
    const data = insight.data as any
    if (!data) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Conversion Likelihood */}
        {data.conversion_likelihood && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Conversion Likelihood</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{data.conversion_likelihood}%</div>
          </div>
        )}

        {/* Geographic Clusters */}
        {data.geo_clusters && data.geo_clusters.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">Top Regions</span>
            </div>
            <div className="space-y-1">
              {data.geo_clusters.slice(0, 3).map((region: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Optimal Timing */}
        {data.optimal_timing && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-900">Best Timing</span>
            </div>
            <p className="text-sm text-orange-700">{data.optimal_timing}</p>
          </div>
        )}

        {/* Shared Traits */}
        {data.shared_traits && data.shared_traits.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-900">Shared Traits</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.shared_traits.slice(0, 4).map((trait: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Outreach Tone */}
        {data.outreach_tone && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-indigo-900">Recommended Tone</span>
            </div>
            <p className="text-sm text-indigo-700 capitalize">{data.outreach_tone}</p>
          </div>
        )}

        {/* Content Themes */}
        {data.content_themes && data.content_themes.length > 0 && (
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-pink-600" />
              <span className="font-medium text-pink-900">Content Themes</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.content_themes.slice(0, 3).map((theme: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
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
              Generate AI-powered insights to understand your audience better
            </p>
            <GenerateInsightsButton 
              audienceId={audienceId} 
              onInsightGenerated={fetchInsights}
            />
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
        <GenerateInsightsButton 
          audienceId={audienceId} 
          onInsightGenerated={fetchInsights}
        />
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
              
              {/* Render persona-specific insights */}
              {insight.insight_type === 'persona_analysis' && renderPersonaInsight(insight)}
              
              {insight.actionable_recommendations && insight.actionable_recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Actionable Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {insight.actionable_recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}