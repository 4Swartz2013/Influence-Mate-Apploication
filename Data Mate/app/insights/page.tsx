'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { AIInsight } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Brain, Star, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: insights,
    loading,
    error,
    refetch
  } = useSupabaseQuery<AIInsight>({
    table: 'ai_insights',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!user
  })

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'conversion_prediction':
        return 'bg-blue-100 text-blue-700'
      case 'persona_conflict':
        return 'bg-red-100 text-red-700'
      case 'audience_clustering':
        return 'bg-green-100 text-green-700'
      case 'outreach_suggestion':
        return 'bg-purple-100 text-purple-700'
      case 'causal_analysis':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'conversion_prediction':
        return 'Conversion Prediction'
      case 'persona_conflict':
        return 'Persona Conflict'
      case 'audience_clustering':
        return 'Audience Clustering'
      case 'outreach_suggestion':
        return 'Outreach Suggestion'
      case 'causal_analysis':
        return 'Causal Analysis'
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const columns: ColumnDef<AIInsight>[] = [
    {
      accessorKey: 'title',
      header: 'Insight',
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Brain className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.original.title}</p>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">
              {row.original.description}
            </p>
          </div>
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'insight_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge 
          className={getInsightTypeColor(row.original.insight_type)}
          variant="secondary"
        >
          {getInsightTypeLabel(row.original.insight_type)}
        </Badge>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'confidence_score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Confidence
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.original.confidence_score
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
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Generated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          <TrendingUp className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Insights</h1>
          <p className="text-slate-600">
            AI-generated insights, predictions, and recommendations
          </p>
        </div>

        <EnhancedDataTable
          data={insights}
          columns={columns}
          title="Intelligence Dashboard"
          description="Machine learning insights and behavioral predictions"
          loading={loading}
          error={error}
          onRefresh={refetch}
          searchPlaceholder="Search insights by title, type, or description..."
          emptyStateTitle="No insights generated yet"
          emptyStateDescription="AI insights will appear here as your data is analyzed"
          emptyStateAction={{
            label: "Generate Insights",
            onClick: () => console.log('Generate new insights')
          }}
          onAdd={() => console.log('Generate new insights')}
          onExport={() => console.log('Export insights')}
        />
      </motion.div>
    </DashboardLayout>
  )
}