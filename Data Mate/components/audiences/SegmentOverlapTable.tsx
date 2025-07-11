'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AudienceSegment, Contact } from '@/lib/supabase'
import { ArrowUpDown, Users, Shuffle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrossMatchData {
  segments: AudienceSegment[]
  contacts: Contact[]
  membershipMap: Map<string, string[]>
  segmentMembersMap: Map<string, string[]>
}

interface SegmentOverlapTableProps {
  crossMatchData: CrossMatchData
  onRefresh: () => void
}

interface SegmentOverlap {
  segmentA: AudienceSegment
  segmentB: AudienceSegment
  overlapCount: number
  overlapPercentage: number
  sharedPersonas: string[]
  totalMembersA: number
  totalMembersB: number
  unionSize: number
  jaccardIndex: number
}

export function SegmentOverlapTable({ crossMatchData }: SegmentOverlapTableProps) {
  const router = useRouter()
  const { segments, segmentMembersMap } = crossMatchData

  const segmentOverlaps = useMemo(() => {
    const overlaps: SegmentOverlap[] = []

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const segmentA = segments[i]
        const segmentB = segments[j]
        
        const membersA = new Set(segmentMembersMap.get(segmentA.id) || [])
        const membersB = new Set(segmentMembersMap.get(segmentB.id) || [])
        
        // Calculate intersection
        const intersection = new Set([...membersA].filter(x => membersB.has(x)))
        const union = new Set([...membersA, ...membersB])
        
        const overlapCount = intersection.size
        const overlapPercentage = membersA.size > 0 ? (overlapCount / Math.min(membersA.size, membersB.size)) * 100 : 0
        const jaccardIndex = union.size > 0 ? overlapCount / union.size : 0

        // Find shared personas
        const sharedPersonas: string[] = []
        if (segmentA.ai_persona_label && segmentB.ai_persona_label) {
          if (segmentA.ai_persona_label === segmentB.ai_persona_label) {
            sharedPersonas.push(segmentA.ai_persona_label)
          }
        }

        overlaps.push({
          segmentA,
          segmentB,
          overlapCount,
          overlapPercentage,
          sharedPersonas,
          totalMembersA: membersA.size,
          totalMembersB: membersB.size,
          unionSize: union.size,
          jaccardIndex
        })
      }
    }

    return overlaps.sort((a, b) => b.overlapPercentage - a.overlapPercentage)
  }, [segments, segmentMembersMap])

  const getOverlapColor = (percentage: number) => {
    if (percentage >= 50) return 'text-red-600'
    if (percentage >= 25) return 'text-yellow-600'
    if (percentage >= 10) return 'text-blue-600'
    return 'text-slate-600'
  }

  const getOverlapBadgeColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-red-100 text-red-700'
    if (percentage >= 25) return 'bg-yellow-100 text-yellow-700'
    if (percentage >= 10) return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-700'
  }

  const columns: ColumnDef<SegmentOverlap>[] = [
    {
      accessorKey: 'segments',
      header: 'Segment Pair',
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Users className="w-3 h-3 text-blue-600" />
            </div>
            <span className="font-medium text-slate-900">{row.original.segmentA.name}</span>
            <Badge variant="outline" className="text-xs">
              {row.original.totalMembersA}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
              <Users className="w-3 h-3 text-green-600" />
            </div>
            <span className="font-medium text-slate-900">{row.original.segmentB.name}</span>
            <Badge variant="outline" className="text-xs">
              {row.original.totalMembersB}
            </Badge>
          </div>
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'overlapPercentage',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Overlap
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shuffle className={`w-4 h-4 ${getOverlapColor(row.original.overlapPercentage)}`} />
            <span className={`font-bold ${getOverlapColor(row.original.overlapPercentage)}`}>
              {row.original.overlapPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={row.original.overlapPercentage} 
            className="h-2 w-20"
          />
          <div className="text-xs text-slate-500">
            {row.original.overlapCount} shared contacts
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'jaccardIndex',
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
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">
            {(row.original.jaccardIndex * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">
            Jaccard Index
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'sharedPersonas',
      header: 'Shared Traits',
      cell: ({ row }) => (
        <div className="space-y-2">
          {row.original.sharedPersonas.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.sharedPersonas.map((persona, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {persona}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 text-sm">No shared personas</span>
          )}
          
          {/* Show if both segments have different personas */}
          {row.original.segmentA.ai_persona_label && 
           row.original.segmentB.ai_persona_label && 
           row.original.segmentA.ai_persona_label !== row.original.segmentB.ai_persona_label && (
            <div className="text-xs text-slate-500">
              Different personas: {row.original.segmentA.ai_persona_label} vs {row.original.segmentB.ai_persona_label}
            </div>
          )}
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'recommendation',
      header: 'Recommendation',
      cell: ({ row }) => {
        const overlap = row.original.overlapPercentage
        
        if (overlap >= 70) {
          return (
            <Badge className="bg-red-100 text-red-700" variant="secondary">
              Consider Merging
            </Badge>
          )
        } else if (overlap >= 40) {
          return (
            <Badge className="bg-yellow-100 text-yellow-700" variant="secondary">
              Review Criteria
            </Badge>
          )
        } else if (overlap >= 15) {
          return (
            <Badge className="bg-blue-100 text-blue-700" variant="secondary">
              Natural Overlap
            </Badge>
          )
        } else {
          return (
            <Badge className="bg-green-100 text-green-700" variant="secondary">
              Well Segmented
            </Badge>
          )
        }
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(`/audiences/${row.original.segmentA.id}`)}
            title="View Segment A"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push(`/audiences/${row.original.segmentB.id}`)}
            title="View Segment B"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <EnhancedDataTable
      data={segmentOverlaps}
      columns={columns}
      title="Segment-to-Segment Overlap Analysis"
      description="Identify overlapping audiences and potential merge candidates"
      searchPlaceholder="Search segment pairs..."
      emptyStateTitle="No segment overlaps to analyze"
      emptyStateDescription="Create more audience segments to analyze overlaps and intersections"
    />
  )
}