'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DivideIcon as LucideIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface StatsCardProps {
  title: string
  count: number
  icon: LucideIcon
  color: string
  lastUpdated?: string
  trend?: {
    value: number
    label: string
  }
  onClick?: () => void
  loading?: boolean
}

export function StatsCard({ 
  title, 
  count, 
  icon: Icon, 
  color, 
  lastUpdated,
  trend,
  onClick,
  loading = false
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg border-0 bg-white",
          onClick && "hover:shadow-lg"
        )}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <div className="flex items-baseline space-x-2">
                {loading ? (
                  <div className="w-12 h-8 bg-slate-200 animate-pulse rounded" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900">
                    {count.toLocaleString()}
                  </p>
                )}
                {trend && (
                  <Badge variant={trend.value > 0 ? 'default' : 'secondary'} className="text-xs">
                    {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                  </Badge>
                )}
              </div>
              {lastUpdated && (
                <p className="text-xs text-slate-500">
                  Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                </p>
              )}
            </div>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              color
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Decorative gradient */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-1",
            color.replace('bg-', 'bg-gradient-to-r from-').replace('-600', '-400 to-').replace(' ', '-600 ')
          )} />
        </CardContent>
      </Card>
    </motion.div>
  )
}