'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CrossMatchTabs } from '@/components/audiences/CrossMatchTabs'
import { supabase, AudienceSegment, Contact, AudienceInsight } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Shuffle, Brain, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrossMatchData {
  segments: AudienceSegment[]
  contacts: Contact[]
  insights: AudienceInsight[]
  membershipMap: Map<string, string[]> // contactId -> segmentIds
  segmentMembersMap: Map<string, string[]> // segmentId -> contactIds
}

export default function AudienceCrossMatchPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [crossMatchData, setCrossMatchData] = useState<CrossMatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchCrossMatchData()
    }
  }, [user])

  const fetchCrossMatchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all audience segments
      const { data: segments, error: segmentsError } = await supabase
        .from('audience_segments')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })

      if (segmentsError) throw segmentsError

      // Fetch all contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user!.id)

      if (contactsError) throw contactsError

      // Fetch audience insights
      const { data: insights, error: insightsError } = await supabase
        .from('audience_insights')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (insightsError) throw insightsError

      // Fetch audience memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('audience_members')
        .select('audience_segment_id, contact_id')

      if (membershipsError) throw membershipsError

      // Build membership maps
      const membershipMap = new Map<string, string[]>()
      const segmentMembersMap = new Map<string, string[]>()

      memberships?.forEach(membership => {
        // Contact -> Segments mapping
        const contactSegments = membershipMap.get(membership.contact_id) || []
        contactSegments.push(membership.audience_segment_id)
        membershipMap.set(membership.contact_id, contactSegments)

        // Segment -> Contacts mapping
        const segmentContacts = segmentMembersMap.get(membership.audience_segment_id) || []
        segmentContacts.push(membership.contact_id)
        segmentMembersMap.set(membership.audience_segment_id, segmentContacts)
      })

      setCrossMatchData({
        segments: segments || [],
        contacts: contacts || [],
        insights: insights || [],
        membershipMap,
        segmentMembersMap
      })
    } catch (err) {
      console.error('Error fetching cross-match data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cross-match data')
    } finally {
      setLoading(false)
    }
  }

  const getOverviewStats = () => {
    if (!crossMatchData) return null

    const { segments, contacts, membershipMap, segmentMembersMap } = crossMatchData

    // Contacts in multiple segments
    const multiSegmentContacts = Array.from(membershipMap.entries())
      .filter(([_, segmentIds]) => segmentIds.length > 1)

    // Contacts in no segments (outliers)
    const outlierContacts = contacts.filter(contact => 
      !membershipMap.has(contact.id)
    )

    // Segments with overlapping members
    const overlappingSegments = segments.filter(segment => {
      const members = segmentMembersMap.get(segment.id) || []
      return members.some(contactId => {
        const contactSegments = membershipMap.get(contactId) || []
        return contactSegments.length > 1
      })
    })

    // Unique personas
    const personas = new Set(
      segments
        .map(s => s.ai_persona_label)
        .filter(Boolean)
    )

    return {
      totalSegments: segments.length,
      totalContacts: contacts.length,
      multiSegmentContacts: multiSegmentContacts.length,
      outlierContacts: outlierContacts.length,
      overlappingSegments: overlappingSegments.length,
      uniquePersonas: personas.size
    }
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Data</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchCrossMatchData}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!crossMatchData || crossMatchData.segments.length === 0) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
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
              <h1 className="text-3xl font-bold text-slate-900">Audience Cross-Match</h1>
              <p className="text-slate-600">
                Analyze intersections and overlaps between audience segments
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Shuffle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Audience Segments</h3>
                <p className="text-slate-600 mb-4">
                  Create at least 2 audience segments to analyze cross-matches and overlaps
                </p>
                <Button onClick={() => router.push('/audiences')}>
                  <Users className="w-4 h-4 mr-2" />
                  View Audiences
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DashboardLayout>
    )
  }

  const stats = getOverviewStats()

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-slate-900">Audience Cross-Match Intelligence</h1>
            <p className="text-slate-600">
              Discover intersections, overlaps, and patterns across your audience segments
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Segments</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalSegments}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Contacts</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalContacts}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Multi-Segment</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.multiSegmentContacts}</p>
                  </div>
                  <Shuffle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Outliers</p>
                    <p className="text-2xl font-bold text-red-600">{stats.outlierContacts}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Overlapping</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.overlappingSegments}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Personas</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.uniquePersonas}</p>
                  </div>
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cross-Match Analysis Tabs */}
        <CrossMatchTabs crossMatchData={crossMatchData} onRefresh={fetchCrossMatchData} />
      </motion.div>
    </DashboardLayout>
  )
}