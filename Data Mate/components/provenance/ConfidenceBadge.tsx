'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TrendingUp, TrendingDown, ChevronsUp, ChevronsDown, Minus } from 'lucide-react'

interface ConfidenceBadgeProps {
  before: number
  after: number
  size?: 'sm' | 'md' | 'lg'
}

export function ConfidenceBadge({ before, after, size = 'sm' }: ConfidenceBadgeProps) {
  const difference = after - before
  const isImprovement = difference > 0
  const isSignificant = Math.abs(difference) >= 0.2

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.7) return 'text-blue-600'
    if (score >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getChangeIcon = () => {
    if (Math.abs(difference) < 0.05) return <Minus className="w-3 h-3" />
    if (isImprovement) {
      return isSignificant ? <ChevronsUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />
    } else {
      return isSignificant ? <ChevronsDown className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
    }
  }

  const getChangeClass = () => {
    if (Math.abs(difference) < 0.05) return 'text-slate-500'
    if (isImprovement) return 'text-green-600'
    return 'text-red-600'
  }

  const getBadgeClass = () => {
    if (after >= 0.9) return 'bg-green-100 text-green-700'
    if (after >= 0.7) return 'bg-blue-100 text-blue-700'
    if (after >= 0.5) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const getTooltipContent = () => {
    const beforePercent = (before * 100).toFixed(0)
    const afterPercent = (after * 100).toFixed(0)
    const diffText = isImprovement ? '+' : ''
    
    return (
      <div className="text-xs">
        <div className="font-medium mb-1">Confidence Score</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div>Before:</div>
          <div className={getConfidenceColor(before)}>{beforePercent}%</div>
          <div>After:</div>
          <div className={getConfidenceColor(after)}>{afterPercent}%</div>
          <div>Change:</div>
          <div className={getChangeClass()}>
            {diffText}{(difference * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={`${getBadgeClass()} ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}
          >
            <div className="flex items-center space-x-1">
              {getChangeIcon()}
              <span>{(after * 100).toFixed(0)}%</span>
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}