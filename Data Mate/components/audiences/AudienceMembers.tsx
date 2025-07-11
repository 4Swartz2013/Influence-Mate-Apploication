'use client'

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { supabase, Contact, AudienceSegment } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ExternalLink, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AudienceMembersProps {
  audienceId: string
  audience: AudienceSegment
}

interface ContactWithMembership extends Contact {
  similarity_score?: number
  added_at?: string
}

export function AudienceMembers({ audienceId }: AudienceMembersProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<ContactWithMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && audienceId) {
      fetchMembers()
    }
  }, [user, audienceId])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('audience_members')
        .select(`
          similarity_score,
          added_at,
          contact_id,
          contacts (*)
        `)
        .eq('audience_segment_id', audienceId)

      if (queryError) throw queryError

      // Transform the data to flatten the contact information
      const transformedData = (data || []).map(member => ({
        ...member.contacts,
        similarity_score: member.similarity_score,
        added_at: member.added_at
      })) as ContactWithMembership[]

      setMembers(transformedData)
    } catch (err) {
      console.error('Error fetching audience members:', err)
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<ContactWithMembership>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Contact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {row.original.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{row.original.name || 'Unknown Contact'}</p>
            {row.original.email && (
              <p className="text-sm text-slate-500">{row.original.email}</p>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => {
        const platform = row.original.platform
        if (!platform) return <span className="text-slate-400">—</span>
        
        return (
          <Badge variant="outline" className="capitalize">
            {platform}
          </Badge>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'follower_count',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Followers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const followers = row.original.follower_count
        if (!followers) return <span className="text-slate-400">—</span>
        
        return (
          <span className="font-medium">
            {followers.toLocaleString()}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'engagement_rate',
      header: 'Engagement',
      cell: ({ row }) => {
        const rate = row.original.engagement_rate
        if (!rate) return <span className="text-slate-400">—</span>
        
        return (
          <Badge variant={rate > 0.05 ? 'default' : 'secondary'}>
            {(rate * 100).toFixed(1)}%
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'similarity_score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Similarity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.original.similarity_score
        if (!score) return <span className="text-slate-400">—</span>
        
        const scoreColor = score >= 0.8 ? 'text-green-600' : score >= 0.6 ? 'text-yellow-600' : 'text-red-600'
        
        return (
          <div className="flex items-center space-x-1">
            <Star className={`w-4 h-4 ${scoreColor}`} />
            <span className={`font-medium ${scoreColor}`}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'added_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Added
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const addedAt = row.original.added_at
        if (!addedAt) return <span className="text-slate-400">—</span>
        
        return (
          <span className="text-sm text-slate-500">
            {formatDistanceToNow(new Date(addedAt), { addSuffix: true })}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  return (
    <EnhancedDataTable
      data={members}
      columns={columns}
      title="Audience Members"
      description={`${members.length} contacts in this audience segment`}
      loading={loading}
      error={error}
      onRefresh={fetchMembers}
      searchPlaceholder="Search members by name, email, or platform..."
      emptyStateTitle="No members found"
      emptyStateDescription="This audience segment doesn't have any members yet"
      onExport={() => console.log('Export members')}
    />
  )
}