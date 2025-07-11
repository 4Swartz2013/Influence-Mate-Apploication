'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StatsCard } from './StatsCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, Contact, Comment, Transcript, AIInsight, Campaign } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Brain, 
  Megaphone,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardStats {
  contacts: { count: number; lastUpdated?: string }
  comments: { count: number; lastUpdated?: string }
  transcripts: { count: number; lastUpdated?: string }
  insights: { count: number; lastUpdated?: string }
  campaigns: { count: number; lastUpdated?: string }
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    contacts: { count: 0 },
    comments: { count: 0 },
    transcripts: { count: 0 },
    insights: { count: 0 },
    campaigns: { count: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch counts and latest updates for each table
      const [contactsResult, commentsResult, transcriptsResult, insightsResult, campaignsResult] = await Promise.all([
        supabase
          .from('contacts')
          .select('id, updated_at')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false }),
        
        supabase
          .from('comments')
          .select('id, updated_at')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false }),
          
        supabase
          .from('transcripts')
          .select('id, updated_at')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false }),
          
        supabase
          .from('ai_insights')
          .select('id, updated_at')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false }),
          
        supabase
          .from('campaigns')
          .select('id, updated_at')
          .eq('user_id', user!.id)
          .order('updated_at', { ascending: false })
      ])

      // Get recent activity across all tables
      const recentItems = [
        ...(contactsResult.data || []).slice(0, 3).map(item => ({ ...item, type: 'contact' })),
        ...(commentsResult.data || []).slice(0, 3).map(item => ({ ...item, type: 'comment' })),
        ...(transcriptsResult.data || []).slice(0, 3).map(item => ({ ...item, type: 'transcript' })),
        ...(insightsResult.data || []).slice(0, 3).map(item => ({ ...item, type: 'insight' })),
        ...(campaignsResult.data || []).slice(0, 3).map(item => ({ ...item, type: 'campaign' })),
      ]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)

      setRecentActivity(recentItems)

      setStats({
        contacts: {
          count: contactsResult.data?.length || 0,
          lastUpdated: contactsResult.data?.[0]?.updated_at
        },
        comments: {
          count: commentsResult.data?.length || 0,
          lastUpdated: commentsResult.data?.[0]?.updated_at
        },
        transcripts: {
          count: transcriptsResult.data?.length || 0,
          lastUpdated: transcriptsResult.data?.[0]?.updated_at
        },
        insights: {
          count: insightsResult.data?.length || 0,
          lastUpdated: insightsResult.data?.[0]?.updated_at
        },
        campaigns: {
          count: campaignsResult.data?.length || 0,
          lastUpdated: campaignsResult.data?.[0]?.updated_at
        },
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return Users
      case 'comment': return MessageSquare
      case 'transcript': return FileText
      case 'insight': return Brain
      case 'campaign': return Megaphone
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contact': return 'bg-blue-100 text-blue-600'
      case 'comment': return 'bg-green-100 text-green-600'
      case 'transcript': return 'bg-purple-100 text-purple-600'
      case 'insight': return 'bg-orange-100 text-orange-600'
      case 'campaign': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-slate-600">
          Here's what's happening with your influence intelligence platform.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
      >
        <StatsCard
          title="Total Contacts"
          count={stats.contacts.count}
          icon={Users}
          color="bg-blue-600"
          lastUpdated={stats.contacts.lastUpdated}
          onClick={() => router.push('/contacts')}
          loading={loading}
        />
        <StatsCard
          title="Comments Analyzed"
          count={stats.comments.count}
          icon={MessageSquare}
          color="bg-green-600"
          lastUpdated={stats.comments.lastUpdated}
          onClick={() => router.push('/comments')}
          loading={loading}
        />
        <StatsCard
          title="Transcripts"
          count={stats.transcripts.count}
          icon={FileText}
          color="bg-purple-600"
          lastUpdated={stats.transcripts.lastUpdated}
          onClick={() => router.push('/transcripts')}
          loading={loading}
        />
        <StatsCard
          title="AI Insights"
          count={stats.insights.count}
          icon={Brain}
          color="bg-orange-600"
          lastUpdated={stats.insights.lastUpdated}
          onClick={() => router.push('/insights')}
          loading={loading}
        />
        <StatsCard
          title="Active Campaigns"
          count={stats.campaigns.count}
          icon={Megaphone}
          color="bg-red-600"
          lastUpdated={stats.campaigns.lastUpdated}
          onClick={() => router.push('/campaigns')}
          loading={loading}
        />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest updates across your data intelligence platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No recent activity</p>
                <p className="text-sm">Start by uploading data or creating campaigns</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, index) => {
                  const Icon = getActivityIcon(item.type)
                  return (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(item.type)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 capitalize">
                          {item.type} updated
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Quick Insights</span>
            </CardTitle>
            <CardDescription>
              Key metrics and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Data Quality</p>
                  <p className="text-xs text-blue-700">Profile completeness tracking</p>
                </div>
                <Badge variant="secondary">85%</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">Engagement Rate</p>
                  <p className="text-xs text-green-700">Average across contacts</p>
                </div>
                <Badge variant="secondary">+12%</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-orange-900">AI Processing</p>
                  <p className="text-xs text-orange-700">Insights generation rate</p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}