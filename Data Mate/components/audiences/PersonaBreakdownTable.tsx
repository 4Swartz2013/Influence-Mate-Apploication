'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AudienceSegment, AudienceInsight } from '@/lib/supabase'
import { ArrowUpDown, Brain, Users, TrendingUp, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrossMatchData {
  segments: AudienceSegment[]
  insights: AudienceInsight[]
  membershipMap: Map<string, string[]>
  segmentMembersMap: Map<string, string[]>
}

interface PersonaBreakdownTableProps {
  crossMatchData: CrossMatchData
  onRefresh: () => void
}

interface PersonaGroup {
  persona: string
  segments: AudienceSegment[]
  totalMembers: number
  avgEngagement: number
  avgReadiness: number
  sharedTraits: string[]
  insights: AudienceInsight[]
}

export function PersonaBreakdownTable({ crossMatchData }: PersonaBreakdownTableProps) {
  const router = useRouter()
  const { segments, insights, segmentMembersMap } = crossMatchData

  const personaGroups = useMemo(() => {
    const personaMap = new Map<string, PersonaGroup>()

    // Group segments by persona
    segments.forEach(segment => {
      const persona = segment.ai_persona_label || 'Unclassified'
      const memberCount = (segmentMembersMap.get(segment.id) || []).length
      
      if (!personaMap.has(persona)) {
        personaMap.set(persona, {
          persona,
          segments: [],
          totalMembers: 0,
          avgEngagement: 0,
          avgReadiness: 0,
          sharedTraits: [],
          insights: []
        })
      }

      const group = personaMap.get(persona)!
      group.segments.push(segment)
      group.totalMembers += memberCount
    })

    // Calculate averages and extract shared traits
    personaMap.forEach((group, persona) => {
      const validEngagements = group.segments
        .map(s => s.engagement_score)
        .filter(Boolean) as number[]
      
      const validReadiness = group.segments
        .map(s => s.outreach_readiness_score)
        .filter(Boolean) as number[]

      group.avgEngagement = validEngagements.length > 0 
        ? validEngagements.reduce((sum, score) => sum + score, 0) / validEngagements.length
        : 0

      group.avgReadiness = validReadiness.length > 0
        ? validReadiness.reduce((sum, score) => sum + score, 0) / validReadiness.length
        : 0

      // Extract shared traits from primary_traits
      const allTraits = new Map<string, number>()
      group.segments.forEach(segment => {
        if (segment.primary_traits && typeof segment.primary_traits === 'object') {
          Object.keys(segment.primary_traits).forEach(trait => {
            allTraits.set(trait, (allTraits.get(trait) || 0) + 1)
          })
        }
      })

      // Get traits that appear in most segments
      const threshold = Math.ceil(group.segments.length * 0.6) // 60% threshold
      group.sharedTraits = Array.from(allTraits.entries())
        .filter(([_, count]) => count >= threshold)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([trait]) => trait)

      // Get related insights
      group.insights = insights.filter(insight => 
        group.segments.some(segment => segment.id === insight.audience_segment_id)
      )
    })

    return Array.from(personaMap.values())
      .sort((a, b) => b.totalMembers - a.totalMembers)
  }, [segments, insights, segmentMembersMap])

  const getEngagementColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600'
    if (score >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getReadinessColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const columns: ColumnDef<PersonaGroup>[] = [
    {
      accessorKey: 'persona',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Persona
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.original.persona}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {row.original.segments.length} segment{row.original.segments.length !== 1 ? 's' : ''}
              </Badge>
              {row.original.insights.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {row.original.insights.length} insight{row.original.insights.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'totalMembers',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Total Members
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">
            {row.original.totalMembers.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            across {row.original.segments.length} segment{row.original.segments.length !== 1 ? 's' : ''}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'avgEngagement',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Avg Engagement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.original.avgEngagement
        if (score === 0) return <span className="text-slate-400">—</span>
        
        return (
          <div className="space-y-1">
            <div className={`text-lg font-bold ${getEngagementColor(score)}`}>
              {(score * 100).toFixed(1)}%
            </div>
            <Progress value={score * 100} className="h-2 w-16" />
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'avgReadiness',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Outreach Readiness
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.original.avgReadiness
        if (score === 0) return <span className="text-slate-400">—</span>
        
        return (
          <div className="flex items-center space-x-2">
            <Target className={`w-4 h-4 ${getReadinessColor(score)}`} />
            <span className={`font-medium ${getReadinessColor(score)}`}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'sharedTraits',
      header: 'Shared Traits',
      cell: ({ row }) => {
        if (row.original.sharedTraits.length === 0) {
          return <span className="text-slate-400">No common traits</span>
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {row.original.sharedTraits.slice(0, 4).map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs capitalize">
                {trait.replace('_', ' ')}
              </Badge>
            ))}
            {row.original.sharedTraits.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{row.original.sharedTraits.length - 4}
              </Badge>
            )}
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'segments',
      header: 'Segments',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.segments.slice(0, 3).map((segment) => (
            <div key={segment.id} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-slate-700 truncate max-w-32">
                {segment.name}
              </span>
              <Badge variant="outline" className="text-xs">
                {segment.total_contacts}
              </Badge>
            </div>
          ))}
          {row.original.segments.length > 3 && (
            <div className="text-xs text-slate-500">
              +{row.original.segments.length - 3} more
            </div>
          )}
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          {row.original.segments.slice(0, 2).map((segment) => (
            <Button 
              key={segment.id}
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/audiences/${segment.id}`)}
              title={`View ${segment.name}`}
            >
              <Users className="w-4 h-4" />
            </Button>
          ))}
        </div>
      ),
    },
  ]

  // Calculate persona distribution
  const totalMembers = personaGroups.reduce((sum, group) => sum + group.totalMembers, 0)

  return (
    <div className="space-y-6">
      {/* Persona Distribution Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Unique Personas</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{personaGroups.length}</div>
          <div className="text-sm text-purple-600">
            Distinct personality types
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Total Members</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{totalMembers.toLocaleString()}</div>
          <div className="text-sm text-blue-600">
            Across all personas
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Avg Engagement</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {personaGroups.length > 0 
              ? ((personaGroups.reduce((sum, g) => sum + g.avgEngagement, 0) / personaGroups.length) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-green-600">
            Across personas
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Avg Readiness</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {personaGroups.length > 0 
              ? ((personaGroups.reduce((sum, g) => sum + g.avgReadiness, 0) / personaGroups.length) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-orange-600">
            For outreach
          </div>
        </div>
      </div>

      {/* Persona Breakdown Table */}
      <EnhancedDataTable
        data={personaGroups}
        columns={columns}
        title="Persona Group Analysis"
        description="Analyze shared characteristics and performance across persona types"
        searchPlaceholder="Search personas by name or traits..."
        emptyStateTitle="No persona groups found"
        emptyStateDescription="Generate AI insights for your audience segments to see persona breakdowns"
      />
    </div>
  )
}