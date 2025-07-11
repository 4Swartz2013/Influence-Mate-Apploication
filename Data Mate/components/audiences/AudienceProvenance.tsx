'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProvenanceTimeline } from '@/components/provenance/ProvenanceTimeline'
import { AudienceSegment } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  History,
  Target,
  Users,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  Brain
} from 'lucide-react'

interface AudienceProvenanceProps {
  audienceId: string
  audience: AudienceSegment
}

interface AudienceMemberWithProvenance {
  contact_id: string
  contact_name: string
  change_count: number
  last_updated: string
}

export function AudienceProvenance({ audienceId, audience }: AudienceProvenanceProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('audience')
  const [memberProvenance, setMemberProvenance] = useState<AudienceMemberWithProvenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  useEffect(() => {
    if (user && audienceId) {
      fetchMemberProvenance()
    }
  }, [user, audienceId])

  const fetchMemberProvenance = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get members of this audience
      const { data: members, error: membersError } = await supabase
        .from('audience_members')
        .select(`
          contact_id,
          contacts (id, name)
        `)
        .eq('audience_segment_id', audienceId)

      if (membersError) throw membersError

      if (!members || members.length === 0) {
        setMemberProvenance([])
        return
      }

      // Get provenance data for each member
      const contactIds = members.map(m => m.contact_id)
      
      const { data: provenance, error: provenanceError } = await supabase
        .from('data_provenance')
        .select('contact_id, detected_at')
        .in('contact_id', contactIds)
        .eq('user_id', user!.id)
        .order('detected_at', { ascending: false })

      if (provenanceError) throw provenanceError

      // Count changes and find last update for each contact
      const changeCounts = new Map<string, number>()
      const lastUpdates = new Map<string, string>()
      
      provenance?.forEach(record => {
        const contactId = record.contact_id
        changeCounts.set(contactId, (changeCounts.get(contactId) || 0) + 1)
        
        if (!lastUpdates.has(contactId) || 
            new Date(record.detected_at) > new Date(lastUpdates.get(contactId)!)) {
          lastUpdates.set(contactId, record.detected_at)
        }
      })
      
      // Combine data
      const provenanceData = members.map(member => ({
        contact_id: member.contact_id,
        contact_name: (member.contacts as any)?.name || 'Unknown',
        change_count: changeCounts.get(member.contact_id) || 0,
        last_updated: lastUpdates.get(member.contact_id) || member.contacts?.created_at
      }))
      
      // Sort by most recently updated
      provenanceData.sort((a, b) => {
        if (!a.last_updated) return 1
        if (!b.last_updated) return -1
        return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
      })
      
      setMemberProvenance(provenanceData)
      
      // Select the first member for detailed view if none selected
      if (provenanceData.length > 0 && !selectedMemberId) {
        setSelectedMemberId(provenanceData[0].contact_id)
      }
    } catch (err) {
      console.error('Error fetching member provenance:', err)
      setError(err instanceof Error ? err.message : 'Failed to load provenance data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-32 h-6 bg-slate-200 animate-pulse rounded" />
              <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-12 bg-slate-100 animate-pulse rounded" />
                <div className="w-full h-12 bg-slate-100 animate-pulse rounded" />
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
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Provenance</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchMemberProvenance} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <span>Audience Data Provenance</span>
          </CardTitle>
          <CardDescription>
            Tracking data sources and changes for audience "{audience.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Members with History</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {memberProvenance.filter(m => m.change_count > 0).length}
              </div>
              <div className="text-xs text-blue-600">
                of {memberProvenance.length} total members
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <GitBranch className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Total Changes</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {memberProvenance.reduce((sum, m) => sum + m.change_count, 0)}
              </div>
              <div className="text-xs text-green-600">
                Across all members
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Persona Label</span>
              </div>
              <div className="text-lg font-bold text-purple-700 truncate">
                {audience.ai_persona_label || 'Not Generated'}
              </div>
              <div className="text-xs text-purple-600">
                AI-generated classification
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Audience vs Member views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audience" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Audience Overview</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Member Provenance</span>
          </TabsTrigger>
        </TabsList>

        {/* Audience Overview Tab */}
        <TabsContent value="audience" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audience-Level Provenance</CardTitle>
              <CardDescription>
                Field changes and updates specific to this audience segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProvenanceTimeline 
                contactId={audienceId}
                showControls={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Provenance Tab */}
        <TabsContent value="members" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Member List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Audience Members</CardTitle>
                <CardDescription>
                  Select a member to view data history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memberProvenance.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No members found</p>
                    <p className="text-sm">This audience doesn't have any members yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {memberProvenance.map((member) => (
                      <div 
                        key={member.contact_id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMemberId === member.contact_id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-slate-50 border border-slate-200'
                        }`}
                        onClick={() => setSelectedMemberId(member.contact_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{member.contact_name}</p>
                            <p className="text-xs text-slate-500">
                              {member.change_count} changes recorded
                            </p>
                          </div>
                          {member.change_count > 0 && (
                            <Badge variant="outline">
                              {member.change_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Member Timeline</CardTitle>
                <CardDescription>
                  Data provenance history for the selected member
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMemberId ? (
                  <ProvenanceTimeline 
                    contactId={selectedMemberId}
                    showControls={false}
                  />
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Select a member to view their provenance history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}