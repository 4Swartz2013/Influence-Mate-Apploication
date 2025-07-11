'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AudienceDetailTabs } from '@/components/audiences/AudienceDetailTabs'
import { supabase, AudienceSegment } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Users, 
  Brain, 
  TrendingUp, 
  Target,
  Calendar,
  Settings
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

export default function AudienceDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const audienceId = params.id as string

  const [audience, setAudience] = useState<AudienceSegment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && audienceId) {
      fetchAudience()
    }
  }, [user, audienceId])

  const fetchAudience = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('audience_segments')
        .select('*')
        .eq('id', audienceId)
        .eq('user_id', user!.id)
        .single()

      if (queryError) throw queryError
      setAudience(data)
    } catch (err) {
      console.error('Error fetching audience:', err)
      setError(err instanceof Error ? err.message : 'Failed to load audience')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-slate-100 text-slate-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'archived':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getReadinessColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (error || !audience) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {error ? 'Error Loading Audience' : 'Audience Not Found'}
            </h2>
            <p className="text-slate-600 mb-4">
              {error || 'The audience segment you\'re looking for doesn\'t exist.'}
            </p>
            <Button onClick={() => router.push('/audiences')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Audiences
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/audiences')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{audience.name}</h1>
              {audience.description && (
                <p className="text-slate-600 mt-1">{audience.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              className={getStatusColor(audience.status)}
              variant="secondary"
            >
              {audience.status.charAt(0).toUpperCase() + audience.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{audience.total_contacts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active audience members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {audience.engagement_score ? `${(audience.engagement_score * 100).toFixed(0)}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                Average engagement rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outreach Readiness</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getReadinessColor(audience.outreach_readiness_score)}`}>
                {audience.outreach_readiness_score ? `${(audience.outreach_readiness_score * 100).toFixed(0)}%` : '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sm">
                {formatDistanceToNow(new Date(audience.updated_at), { addSuffix: true })}
              </div>
              <p className="text-xs text-muted-foreground">
                Segment analysis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Persona Label */}
        {audience.ai_persona_label && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Persona Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">
                  {audience.ai_persona_label}
                </h3>
                <p className="text-purple-700 text-sm">
                  This audience segment has been automatically classified based on behavioral patterns, 
                  engagement metrics, and content preferences.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Tabs */}
        <AudienceDetailTabs audienceId={audienceId} audience={audience} />
      </motion.div>
    </DashboardLayout>
  )
}