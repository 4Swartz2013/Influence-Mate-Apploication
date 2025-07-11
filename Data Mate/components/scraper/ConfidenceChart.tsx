'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"
import { useEffect, useState } from "react"

interface ConfidenceData {
  day: string
  avg_conf: number
  transcripts_count: number
}

interface ConfidenceChartProps {
  data: ConfidenceData[]
}

export function ConfidenceChart({ data }: ConfidenceChartProps) {
  const [sparklinePath, setSparklinePath] = useState<string>('')
  const [avgConfidence, setAvgConfidence] = useState<number>(0)
  const [trendDirection, setTrendDirection] = useState<'up' | 'down' | 'stable'>('stable')
  
  useEffect(() => {
    if (data.length === 0) return
    
    // Reverse data to show chronological order
    const chronologicalData = [...data].reverse()
    
    // Calculate average confidence
    const totalConfidence = chronologicalData.reduce((sum, item) => sum + item.avg_conf * item.transcripts_count, 0)
    const totalTranscripts = chronologicalData.reduce((sum, item) => sum + item.transcripts_count, 0)
    const avgConf = totalTranscripts > 0 ? totalConfidence / totalTranscripts : 0
    setAvgConfidence(avgConf)
    
    // Calculate trend direction (comparing last week to previous week)
    if (chronologicalData.length >= 2) {
      const recentAvg = chronologicalData.slice(-7).reduce((sum, item) => sum + item.avg_conf, 0) / 
                      Math.min(7, chronologicalData.slice(-7).length)
      
      const previousAvg = chronologicalData.slice(-14, -7).reduce((sum, item) => sum + item.avg_conf, 0) / 
                        Math.min(7, chronologicalData.slice(-14, -7).length)
      
      if (Math.abs(recentAvg - previousAvg) < 0.02) {
        setTrendDirection('stable')
      } else {
        setTrendDirection(recentAvg > previousAvg ? 'up' : 'down')
      }
    }
    
    // Generate sparkline path
    // Map confidence values to y coordinates
    const width = 100 // SVG width
    const height = 30 // SVG height
    const padding = 2 // Padding to avoid cutting off the line
    
    if (chronologicalData.length === 0) return
    
    const values = chronologicalData.map(d => d.avg_conf)
    const min = Math.max(0, Math.min(...values) - 0.05) // Add some padding
    const max = Math.min(1, Math.max(...values) + 0.05) // Add some padding
    
    // Scale function to map confidence values to y coordinates
    const scaleY = (value: number) => {
      return height - padding - ((value - min) / (max - min)) * (height - 2 * padding)
    }
    
    // Scale function to map indices to x coordinates
    const scaleX = (index: number) => {
      return padding + (index / (values.length - 1 || 1)) * (width - 2 * padding)
    }
    
    // Generate path
    let path = `M ${scaleX(0)} ${scaleY(values[0])}`
    for (let i = 1; i < values.length; i++) {
      path += ` L ${scaleX(i)} ${scaleY(values[i])}`
    }
    
    setSparklinePath(path)
  }, [data])
  
  const getTrendColorClass = () => {
    if (trendDirection === 'up') return 'text-green-500'
    if (trendDirection === 'down') return 'text-red-500'
    return 'text-blue-500'
  }
  
  const getTrendArrow = () => {
    if (trendDirection === 'up') return '↑'
    if (trendDirection === 'down') return '↓'
    return '→'
  }
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-500'
    if (confidence >= 0.7) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center space-x-2">
          <Brain className="h-4 w-4 text-indigo-500" />
          <span>Transcript Confidence Trend</span>
        </CardTitle>
        <CardDescription>
          Average confidence scores for transcripts over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No confidence data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(avgConfidence)}`}>
                  {(avgConfidence * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <p className="text-sm text-slate-500">30-Day Trend</p>
                <p className={`text-xl font-semibold ${getTrendColorClass()}`}>
                  {getTrendArrow()}
                </p>
              </div>
            </div>
            
            {/* Sparkline Chart */}
            <div className="h-8 w-full mt-2">
              <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`${getTrendColorClass()}`}
                />
              </svg>
            </div>
            
            {/* Data Summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <div>Last {data.length} days</div>
              <div>{data.reduce((sum, item) => sum + item.transcripts_count, 0)} transcripts</div>
            </div>
            
            {/* Recent Data */}
            <div className="border-t pt-3">
              <p className="text-xs font-medium mb-2">Recent Confidence Scores</p>
              <div className="space-y-1">
                {data.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="text-slate-600">
                      {new Date(item.day).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={getConfidenceColor(item.avg_conf)}>
                        {(item.avg_conf * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-slate-400">
                        ({item.transcripts_count})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}