'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AudienceSegment } from '@/lib/supabase'
import { BarChart3, Users, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CrossMatchData {
  segments: AudienceSegment[]
  membershipMap: Map<string, string[]>
  segmentMembersMap: Map<string, string[]>
}

interface SegmentHeatmapProps {
  crossMatchData: CrossMatchData
  onRefresh: () => void
}

interface HeatmapCell {
  segmentA: AudienceSegment
  segmentB: AudienceSegment
  overlapCount: number
  overlapPercentage: number
  jaccardIndex: number
}

export function SegmentHeatmap({ crossMatchData }: SegmentHeatmapProps) {
  const router = useRouter()
  const { segments, segmentMembersMap } = crossMatchData

  const heatmapData = useMemo(() => {
    const matrix: HeatmapCell[][] = []
    
    segments.forEach((segmentA, i) => {
      const row: HeatmapCell[] = []
      
      segments.forEach((segmentB, j) => {
        if (i === j) {
          // Self-intersection (diagonal)
          const memberCount = (segmentMembersMap.get(segmentA.id) || []).length
          row.push({
            segmentA,
            segmentB,
            overlapCount: memberCount,
            overlapPercentage: 100,
            jaccardIndex: 1
          })
        } else {
          // Calculate intersection
          const membersA = new Set(segmentMembersMap.get(segmentA.id) || [])
          const membersB = new Set(segmentMembersMap.get(segmentB.id) || [])
          
          const intersection = new Set([...membersA].filter(x => membersB.has(x)))
          const union = new Set([...membersA, ...membersB])
          
          const overlapCount = intersection.size
          const overlapPercentage = membersA.size > 0 ? (overlapCount / Math.min(membersA.size, membersB.size)) * 100 : 0
          const jaccardIndex = union.size > 0 ? overlapCount / union.size : 0

          row.push({
            segmentA,
            segmentB,
            overlapCount,
            overlapPercentage,
            jaccardIndex
          })
        }
      })
      
      matrix.push(row)
    })
    
    return matrix
  }, [segments, segmentMembersMap])

  const getHeatmapColor = (percentage: number, isDiagonal: boolean) => {
    if (isDiagonal) return 'bg-slate-200 text-slate-700'
    
    if (percentage >= 70) return 'bg-red-500 text-white'
    if (percentage >= 50) return 'bg-red-400 text-white'
    if (percentage >= 30) return 'bg-orange-400 text-white'
    if (percentage >= 15) return 'bg-yellow-400 text-slate-900'
    if (percentage >= 5) return 'bg-blue-400 text-white'
    return 'bg-slate-100 text-slate-600'
  }

  const getIntensityLabel = (percentage: number) => {
    if (percentage >= 70) return 'Very High'
    if (percentage >= 50) return 'High'
    if (percentage >= 30) return 'Medium'
    if (percentage >= 15) return 'Low'
    if (percentage >= 5) return 'Very Low'
    return 'Minimal'
  }

  if (segments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Segments to Visualize</h3>
            <p className="text-slate-600">
              Create audience segments to see overlap heatmap visualization
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (segments.length < 2) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Need More Segments</h3>
            <p className="text-slate-600">
              Create at least 2 audience segments to analyze overlaps in the heatmap
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Overlap Intensity Legend</span>
          </CardTitle>
          <CardDescription>
            Color intensity represents the percentage of overlap between audience segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-100 border rounded" />
              <span className="text-sm">Minimal (0-5%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-400 rounded" />
              <span className="text-sm">Very Low (5-15%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-400 rounded" />
              <span className="text-sm">Low (15-30%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-400 rounded" />
              <span className="text-sm">Medium (30-50%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-400 rounded" />
              <span className="text-sm">High (50-70%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm">Very High (70%+)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Segment Overlap Heatmap</CardTitle>
          <CardDescription>
            Visual representation of contact overlaps between all audience segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header row with segment names */}
              <div className="flex">
                <div className="w-48 h-12 flex items-center justify-center font-medium text-slate-700 border-b border-r">
                  Segments
                </div>
                {segments.map((segment) => (
                  <div 
                    key={segment.id} 
                    className="w-24 h-12 flex items-center justify-center text-xs font-medium text-slate-700 border-b border-r p-1"
                  >
                    <div className="text-center">
                      <div className="truncate">{segment.name}</div>
                      <div className="text-xs text-slate-500">
                        {segment.total_contacts}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data rows */}
              {heatmapData.map((row, i) => (
                <div key={i} className="flex">
                  {/* Row header */}
                  <div className="w-48 h-16 flex items-center justify-between p-3 border-b border-r bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-900 text-sm truncate">
                          {segments[i].name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {segments[i].total_contacts} contacts
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/audiences/${segments[i].id}`)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Data cells */}
                  {row.map((cell, j) => {
                    const isDiagonal = i === j
                    const colorClass = getHeatmapColor(cell.overlapPercentage, isDiagonal)
                    
                    return (
                      <div 
                        key={j}
                        className={`w-24 h-16 flex flex-col items-center justify-center border-b border-r ${colorClass} transition-all hover:scale-105 cursor-pointer`}
                        title={`${cell.segmentA.name} ↔ ${cell.segmentB.name}: ${cell.overlapCount} contacts (${cell.overlapPercentage.toFixed(1)}%)`}
                      >
                        <div className="text-sm font-bold">
                          {isDiagonal ? '100%' : `${cell.overlapPercentage.toFixed(0)}%`}
                        </div>
                        <div className="text-xs opacity-90">
                          {isDiagonal ? 'Self' : cell.overlapCount}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Highest Overlap</h4>
              {(() => {
                let maxOverlap = 0
                let maxPair: HeatmapCell | null = null
                
                heatmapData.forEach((row, i) => {
                  row.forEach((cell, j) => {
                    if (i !== j && cell.overlapPercentage > maxOverlap) {
                      maxOverlap = cell.overlapPercentage
                      maxPair = cell
                    }
                  })
                })

                return maxPair ? (
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {maxPair.overlapPercentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600">
                      {maxPair.segmentA.name} ↔ {maxPair.segmentB.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {maxPair.overlapCount} shared contacts
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No overlaps found</div>
                )
              })()}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Average Overlap</h4>
              {(() => {
                const nonDiagonalCells = heatmapData.flatMap((row, i) => 
                  row.filter((_, j) => i !== j)
                )
                const avgOverlap = nonDiagonalCells.length > 0 
                  ? nonDiagonalCells.reduce((sum, cell) => sum + cell.overlapPercentage, 0) / nonDiagonalCells.length
                  : 0

                return (
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {avgOverlap.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600">
                      {getIntensityLabel(avgOverlap)} intensity
                    </div>
                    <div className="text-xs text-slate-500">
                      Across {nonDiagonalCells.length} pairs
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Segmentation Quality</h4>
              {(() => {
                const nonDiagonalCells = heatmapData.flatMap((row, i) => 
                  row.filter((_, j) => i !== j)
                )
                const highOverlapCount = nonDiagonalCells.filter(cell => cell.overlapPercentage >= 50).length
                const totalPairs = nonDiagonalCells.length
                
                const quality = totalPairs > 0 ? ((totalPairs - highOverlapCount) / totalPairs) * 100 : 100

                return (
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {quality.toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-600">
                      {quality >= 80 ? 'Excellent' : quality >= 60 ? 'Good' : quality >= 40 ? 'Fair' : 'Poor'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {highOverlapCount} high-overlap pairs
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}