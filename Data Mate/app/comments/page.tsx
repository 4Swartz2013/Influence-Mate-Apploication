'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { Comment } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ExternalLink, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function CommentsPage() {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: comments,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Comment>({
    table: 'comments',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!user
  })

  const getSentimentColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-600'
    if (score > 0.1) return 'bg-green-100 text-green-700'
    if (score < -0.1) return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getSentimentLabel = (score?: number) => {
    if (!score) return 'Neutral'
    if (score > 0.1) return 'Positive'
    if (score < -0.1) return 'Negative'
    return 'Neutral'
  }

  const columns: ColumnDef<Comment>[] = [
    {
      accessorKey: 'content',
      header: 'Comment',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm text-slate-900 line-clamp-2 leading-relaxed">
            {row.original.content}
          </p>
          {row.original.post_url && (
            <a
              href={row.original.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center"
            >
              View post <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.platform}
        </Badge>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'sentiment_score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Sentiment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.original.sentiment_score
        return (
          <div className="flex items-center space-x-2">
            <Badge 
              className={getSentimentColor(score)}
              variant="secondary"
            >
              {getSentimentLabel(score)}
            </Badge>
            {score && (
              <span className="text-xs text-slate-500">
                {score > 0 ? '+' : ''}{score.toFixed(2)}
              </span>
            )}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'intent_labels',
      header: 'Intent',
      cell: ({ row }) => {
        const labels = row.original.intent_labels
        if (!labels || labels.length === 0) {
          return <span className="text-slate-400">—</span>
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {labels.slice(0, 2).map((label, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
            {labels.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{labels.length - 2}
              </Badge>
            )}
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Date
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
          <MessageSquare className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-slate-900">Comments</h1>
          <p className="text-slate-600">
            Analyze sentiment and intent from scraped social media comments
          </p>
        </div>

        <EnhancedDataTable
          data={comments}
          columns={columns}
          title="Comment Intelligence"
          description="AI-powered sentiment analysis and intent detection"
          loading={loading}
          error={error}
          onRefresh={refetch}
          searchPlaceholder="Search comments by content, platform, or intent..."
          emptyStateTitle="No comments found"
          emptyStateDescription="Import social media comments to start analyzing sentiment and intent"
          emptyStateAction={{
            label: "Import Comments",
            onClick: () => console.log('Import comments')
          }}
          onAdd={() => console.log('Import comments')}
          onExport={() => console.log('Export comments')}
        />
      </motion.div>
    </DashboardLayout>
  )
}