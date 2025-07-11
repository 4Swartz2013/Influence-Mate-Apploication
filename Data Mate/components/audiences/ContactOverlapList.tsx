'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AudienceSegment, Contact } from '@/lib/supabase'
import { ArrowUpDown, ExternalLink, Users, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrossMatchData {
  segments: AudienceSegment[]
  contacts: Contact[]
  membershipMap: Map<string, string[]>
  segmentMembersMap: Map<string, string[]>
}

interface ContactOverlapListProps {
  crossMatchData: CrossMatchData
  onRefresh: () => void
}

interface ContactOverlap {
  contact: Contact
  segmentIds: string[]
  segments: AudienceSegment[]
  overlapType: 'multi-segment' | 'outlier' | 'single-segment'
}

export function ContactOverlapList({ crossMatchData }: ContactOverlapListProps) {
  const router = useRouter()
  const { segments, contacts, membershipMap } = crossMatchData

  const contactOverlaps = useMemo(() => {
    const overlaps: ContactOverlap[] = []
    const segmentMap = new Map(segments.map(s => [s.id, s]))

    // Process contacts with memberships
    membershipMap.forEach((segmentIds, contactId) => {
      const contact = contacts.find(c => c.id === contactId)
      if (!contact) return

      const contactSegments = segmentIds.map(id => segmentMap.get(id)).filter(Boolean) as AudienceSegment[]
      
      overlaps.push({
        contact,
        segmentIds,
        segments: contactSegments,
        overlapType: segmentIds.length > 1 ? 'multi-segment' : 'single-segment'
      })
    })

    // Process outlier contacts (not in any segment)
    contacts.forEach(contact => {
      if (!membershipMap.has(contact.id)) {
        overlaps.push({
          contact,
          segmentIds: [],
          segments: [],
          overlapType: 'outlier'
        })
      }
    })

    return overlaps.sort((a, b) => {
      // Sort by overlap type priority, then by segment count
      const typeOrder = { 'outlier': 0, 'multi-segment': 1, 'single-segment': 2 }
      const aOrder = typeOrder[a.overlapType]
      const bOrder = typeOrder[b.overlapType]
      
      if (aOrder !== bOrder) return aOrder - bOrder
      return b.segmentIds.length - a.segmentIds.length
    })
  }, [segments, contacts, membershipMap])

  const getOverlapTypeColor = (type: string) => {
    switch (type) {
      case 'multi-segment':
        return 'bg-orange-100 text-orange-700'
      case 'outlier':
        return 'bg-red-100 text-red-700'
      case 'single-segment':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getOverlapTypeIcon = (type: string) => {
    switch (type) {
      case 'multi-segment':
        return <Users className="w-4 h-4" />
      case 'outlier':
        return <AlertTriangle className="w-4 h-4" />
      case 'single-segment':
        return <Users className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getOverlapTypeLabel = (type: string) => {
    switch (type) {
      case 'multi-segment':
        return 'Multi-Segment'
      case 'outlier':
        return 'Outlier'
      case 'single-segment':
        return 'Single Segment'
      default:
        return type
    }
  }

  const columns: ColumnDef<ContactOverlap>[] = [
    {
      accessorKey: 'contact',
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
              {row.original.contact.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">
              {row.original.contact.name || 'Unknown Contact'}
            </p>
            {row.original.contact.email && (
              <p className="text-sm text-slate-500">{row.original.contact.email}</p>
            )}
            {row.original.contact.platform && (
              <Badge variant="outline" className="text-xs mt-1">
                {row.original.contact.platform}
              </Badge>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'overlapType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge 
          className={getOverlapTypeColor(row.original.overlapType)}
          variant="secondary"
        >
          <div className="flex items-center space-x-1">
            {getOverlapTypeIcon(row.original.overlapType)}
            <span>{getOverlapTypeLabel(row.original.overlapType)}</span>
          </div>
        </Badge>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'segmentCount',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Segments
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">
            {row.original.segmentIds.length}
          </div>
          <div className="text-xs text-slate-500">
            {row.original.segmentIds.length === 0 ? 'No segments' : 
             row.original.segmentIds.length === 1 ? 'segment' : 'segments'}
          </div>
        </div>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        return rowA.original.segmentIds.length - rowB.original.segmentIds.length
      }
    },
    {
      accessorKey: 'segments',
      header: 'Audience Memberships',
      cell: ({ row }) => {
        if (row.original.segments.length === 0) {
          return (
            <div className="flex items-center space-x-2 text-slate-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Not in any audience</span>
            </div>
          )
        }

        return (
          <div className="space-y-1">
            {row.original.segments.slice(0, 3).map((segment) => (
              <div key={segment.id} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-slate-700">{segment.name}</span>
                {segment.ai_persona_label && (
                  <Badge variant="outline" className="text-xs">
                    {segment.ai_persona_label}
                  </Badge>
                )}
              </div>
            ))}
            {row.original.segments.length > 3 && (
              <div className="text-xs text-slate-500">
                +{row.original.segments.length - 3} more segments
              </div>
            )}
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'enrichment',
      header: 'Profile',
      cell: ({ row }) => {
        const contact = row.original.contact
        const isEnriched = contact.bio || contact.location || contact.contact_score || contact.follower_count
        
        return (
          <div className="space-y-1">
            {contact.follower_count && (
              <div className="text-sm text-slate-600">
                {contact.follower_count.toLocaleString()} followers
              </div>
            )}
            {contact.engagement_rate && (
              <div className="text-sm text-slate-600">
                {(contact.engagement_rate * 100).toFixed(1)}% engagement
              </div>
            )}
            <Badge variant={isEnriched ? 'default' : 'secondary'} className="text-xs">
              {isEnriched ? 'Enriched' : 'Basic'}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'recommendation',
      header: 'Recommendation',
      cell: ({ row }) => {
        const type = row.original.overlapType
        const segmentCount = row.original.segmentIds.length
        
        if (type === 'outlier') {
          return (
            <div className="text-sm text-red-600">
              Consider adding to segment
            </div>
          )
        } else if (type === 'multi-segment' && segmentCount > 3) {
          return (
            <div className="text-sm text-orange-600">
              Review segment criteria
            </div>
          )
        } else if (type === 'multi-segment') {
          return (
            <div className="text-sm text-blue-600">
              Natural cross-segment fit
            </div>
          )
        } else {
          return (
            <div className="text-sm text-green-600">
              Well categorized
            </div>
          )
        }
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/contacts/${row.original.contact.id}`)}
          title="View Contact Details"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  // Filter options for different overlap types
  const multiSegmentContacts = contactOverlaps.filter(c => c.overlapType === 'multi-segment')
  const outlierContacts = contactOverlaps.filter(c => c.overlapType === 'outlier')

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Multi-Segment Contacts</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">{multiSegmentContacts.length}</div>
          <div className="text-sm text-orange-600">
            Contacts in multiple audiences
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">Outlier Contacts</span>
          </div>
          <div className="text-2xl font-bold text-red-700">{outlierContacts.length}</div>
          <div className="text-sm text-red-600">
            Not in any audience segment
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Total Contacts</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{contacts.length}</div>
          <div className="text-sm text-blue-600">
            In your database
          </div>
        </div>
      </div>

      {/* Contact Overlap Table */}
      <EnhancedDataTable
        data={contactOverlaps}
        columns={columns}
        title="Contact-to-Multiple-Segment Analysis"
        description="Identify contacts that belong to multiple segments or need categorization"
        searchPlaceholder="Search contacts by name, email, or platform..."
        emptyStateTitle="No contact overlaps found"
        emptyStateDescription="All contacts are properly categorized in single segments"
      />
    </div>
  )
}