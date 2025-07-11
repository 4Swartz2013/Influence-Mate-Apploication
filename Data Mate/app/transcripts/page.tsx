'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { Transcript } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ExternalLink, FileText, Play } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function TranscriptsPage() {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: transcripts,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Transcript>({
    table: 'transcripts',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!user
  })

  const columns: ColumnDef<Transcript>[] = [
    {
      accessorKey: 'content_url',
      header: 'Content',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <a
              href={row.original.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
            >
              View Content <ExternalLink className="w-3 h-3 ml-1" />
            </a>
            <p className="text-xs text-slate-500">
              {new URL(row.original.content_url).hostname}
            </p>
          </div>
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'raw_transcript',
      header: 'Transcript Preview',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
            {row.original.raw_transcript.substring(0, 100)}...
          </p>
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'ai_summary',
      header: 'AI Summary',
      cell: ({ row }) => {
        const summary = row.original.ai_summary
        if (!summary) return <span className="text-slate-400">Processing...</span>
        
        return (
          <div className="max-w-xs">
            <p className="text-sm text-slate-700 line-clamp-2">
              {summary.substring(0, 80)}...
            </p>
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'topics',
      header: 'Topics',
      cell: ({ row }) => {
        const topics = row.original.topics
        if (!topics || topics.length === 0) {
          return <span className="text-slate-400">—</span>
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {topics.slice(0, 2).map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {topics.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{topics.length - 2}
              </Badge>
            )}
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
      cell: ({ row }) => {
        const sentiment = row.original.sentiment
        if (!sentiment) return <span className="text-slate-400">—</span>
        
        let color = 'bg-slate-100 text-slate-600'
        if (sentiment.toLowerCase() === 'positive') color = 'bg-green-100 text-green-700'
        if (sentiment.toLowerCase() === 'negative') color = 'bg-red-100 text-red-700'
        if (sentiment.toLowerCase() === 'neutral') color = 'bg-yellow-100 text-yellow-700'
        
        return (
          <Badge className={color} variant="secondary">
            {sentiment}
          </Badge>
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
          <FileText className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-slate-900">Transcripts</h1>
          <p className="text-slate-600">
            AI-powered video and audio transcript analysis
          </p>
        </div>

        <EnhancedDataTable
          data={transcripts}
          columns={columns}
          title="Content Transcripts"
          description="Automatically transcribed and analyzed content with AI insights"
          loading={loading}
          error={error}
          onRefresh={refetch}
          searchPlaceholder="Search transcripts by content, topics, or summary..."
          emptyStateTitle="No transcripts found"
          emptyStateDescription="Add video or audio content URLs to start generating transcripts"
          emptyStateAction={{
            label: "Add Content",
            onClick: () => console.log('Add content for transcription')
          }}
          onAdd={() => console.log('Add content for transcription')}
          onExport={() => console.log('Export transcripts')}
        />
      </motion.div>
    </DashboardLayout>
  )
}