'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase, AudienceSegment, Contact } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  ExternalLink, 
  Star,
  Brain,
  Target
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ContactAudienceMembershipProps {
  contactId: string
  contact: Contact
}

interface AudienceMembership {
  audience_segment_id: string
  similarity_score?: number
  added_at: string
  audience_segments: AudienceSegment
}

export function ContactAudienceMembership({ contactId }: ContactAudienceMembershipProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [memberships, setMemberships] = useState<AudienceMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && contactId) {
      fetchAudienceMemberships()
    }
  }, [user, contactId])

  const fetchAudienceMemberships = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('audience_members')
        .select(`
          audience_segment_id,
          similarity_score,
          added_at,
          audience_segments (*)
        `)
        .eq('contact_id', contactId)

      if (queryError) throw queryError

      // Filter to only show audiences owned by the current user
      const filteredData = (data || []).filter(
        (membership: any) => membership.audience_segments?.user_id === user!.id
      )

      setMemberships(filteredData as AudienceMembership[])
    } catch (err) {
      console.error('Error fetching audience memberships:', err)
      setError(err instanceof Error ? err.message : 'Failed to load audience memberships')
    } finally {
      setLoading(false)
    }
  }

  const getSimilarityColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
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
            <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Memberships</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchAudienceMemberships} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (memberships.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Audience Memberships</h3>
            <p className="text-slate-600 mb-4">
              This contact is not currently part of any audience segments
            </p>
            <Button onClick={() => router.push('/audiences')} variant="outline">
              <Target className="w-4 h-4 mr-2" />
              View All Audiences
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Audience Memberships</h3>
        <p className="text-sm text-slate-600">
          This contact belongs to {memberships.length} audience segment{memberships.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-4">
        {memberships.map((membership) => {
          const audience = membership.audience_segments
          
          return (
            <Card key={membership.audience_segment_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{audience.name}</CardTitle>
                      {audience.description && (
                        <CardDescription className="mt-1">
                          {audience.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          className={getStatusColor(audience.status)}
                          variant="secondary"
                        >
                          {audience.status.charAt(0).toUpperCase() + audience.status.slice(1)}
                        </Badge>
                        {audience.ai_persona_label && (
                          <div className="flex items-center space-x-1">
                            <Brain className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-purple-600 font-medium">
                              {audience.ai_persona_label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/audiences/${audience.id}`)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Total Members</label>
                    <p className="text-lg font-semibold text-slate-900">
                      {audience.total_contacts.toLocaleString()}
                    </p>
                  </div>
                  
                  {membership.similarity_score && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Similarity Score</label>
                      <div className="flex items-center space-x-1">
                        <Star className={`w-4 h-4 ${getSimilarityColor(membership.similarity_score)}`} />
                        <span className={`text-lg font-semibold ${getSimilarityColor(membership.similarity_score)}`}>
                          {(membership.similarity_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Added</label>
                    <p className="text-sm text-slate-700">
                      {formatDistanceToNow(new Date(membership.added_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Primary Traits */}
                {audience.primary_traits && typeof audience.primary_traits === 'object' && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">Primary Traits</label>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(audience.primary_traits).slice(0, 5).map((trait, index) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {trait.replace('_', ' ')}
                        </Badge>
                      ))}
                      {Object.keys(audience.primary_traits).length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(audience.primary_traits).length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}