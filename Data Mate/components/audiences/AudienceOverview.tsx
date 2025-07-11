'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AudienceSegment } from '@/lib/supabase'
import { 
  TrendingUp, 
  Target, 
  Users, 
  Brain,
  BarChart3,
  Zap
} from 'lucide-react'

interface AudienceOverviewProps {
  audienceId: string
  audience: AudienceSegment
}

export function AudienceOverview({ audience }: AudienceOverviewProps) {
  const primaryTraits = audience.primary_traits || {}
  const clusterCriteria = audience.cluster_criteria || {}

  const renderTraitValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(2)
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    return String(value)
  }

  return (
    <div className="space-y-6">
      {/* Segment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Segment Summary</span>
            </CardTitle>
            <CardDescription>
              Key metrics and characteristics of this audience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Members</span>
              <Badge variant="outline">{audience.total_contacts.toLocaleString()}</Badge>
            </div>
            
            {audience.engagement_score && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Engagement Score</span>
                  <span className="text-sm text-slate-600">
                    {(audience.engagement_score * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={audience.engagement_score * 100} className="h-2" />
              </div>
            )}

            {audience.outreach_readiness_score && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Outreach Readiness</span>
                  <span className="text-sm text-slate-600">
                    {(audience.outreach_readiness_score * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress value={audience.outreach_readiness_score * 100} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={audience.status === 'active' ? 'default' : 'secondary'}>
                {audience.status.charAt(0).toUpperCase() + audience.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>AI Analysis</span>
            </CardTitle>
            <CardDescription>
              Machine learning insights about this segment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {audience.ai_persona_label ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Persona Classification</span>
                </div>
                <p className="text-purple-700 font-semibold">{audience.ai_persona_label}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Brain className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>AI analysis in progress</p>
                <p className="text-sm">Persona insights will appear here once processing is complete</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Primary Traits */}
      {Object.keys(primaryTraits).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Primary Traits</span>
            </CardTitle>
            <CardDescription>
              Key characteristics that define this audience segment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(primaryTraits).map(([key, value]) => (
                <div key={key} className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 capitalize mb-1">
                    {key.replace('_', ' ')}
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {renderTraitValue(value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cluster Criteria */}
      {Object.keys(clusterCriteria).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Clustering Criteria</span>
            </CardTitle>
            <CardDescription>
              The parameters used to identify and group this audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(clusterCriteria).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 capitalize mb-2">
                    {key.replace('_', ' ')}
                  </h4>
                  <div className="text-slate-600 text-sm">
                    {typeof value === 'object' ? (
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      renderTraitValue(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}