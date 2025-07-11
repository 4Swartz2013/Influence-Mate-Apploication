'use client'

import { ColumnDef } from '@tanstack/react-table'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Contact, AudienceSegment, AIInsight, EnrichmentJob, Comment } from '@/lib/supabase'
import { 
  ArrowUpDown, 
  ExternalLink, 
  Users, 
  Target, 
  Brain, 
  Zap, 
  MessageSquare,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface SearchResultTableProps {
  type: 'contacts' | 'audiences' | 'insights' | 'jobs' | 'comments'
  data: any[]
  query: string
  onRefresh: () => void
}

export function SearchResultTable({ type, data, query, onRefresh }: SearchResultTableProps) {
  const router = useRouter()

  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  // Contact columns
  const contactColumns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'name',
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
              {row.original.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">
              {highlightText(row.original.name || 'Unknown Contact', query)}
            </p>
            {row.original.username && (
              <p className="text-sm text-slate-500">
                @{highlightText(row.original.username, query)}
              </p>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => {
        const platform = row.original.platform
        if (!platform) return <span className="text-slate-400">—</span>
        
        return (
          <Badge variant="outline" className="capitalize">
            {platform}
          </Badge>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'follower_count',
      header: 'Followers',
      cell: ({ row }) => {
        const followers = row.original.follower_count
        if (!followers) return <span className="text-slate-400">—</span>
        
        return (
          <span className="font-medium">
            {followers.toLocaleString()}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      id: 'enriched',
      header: 'Status',
      cell: ({ row }) => {
        const hasEnrichment = row.original.bio || row.original.location || row.original.contact_score
        
        return hasEnrichment ? (
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">Enriched</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <XCircle className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">Basic</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/contacts/${row.original.id}`)}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  // Audience columns
  const audienceColumns: ColumnDef<AudienceSegment>[] = [
    {
      accessorKey: 'name',
      header: 'Audience',
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {highlightText(row.original.name, query)}
            </p>
            {row.original.ai_persona_label && (
              <div className="flex items-center space-x-1 mt-1">
                <Brain className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">
                  {highlightText(row.original.ai_persona_label, query)}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'total_contacts',
      header: 'Members',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="font-medium">
            {row.original.total_contacts.toLocaleString()}
          </span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/audiences/${row.original.id}`)}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  // Insight columns
  const insightColumns: ColumnDef<AIInsight>[] = [
    {
      accessorKey: 'title',
      header: 'Insight',
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Brain className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {highlightText(row.original.title, query)}
            </p>
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">
              {highlightText(row.original.description, query)}
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
        <Badge variant="outline">
          {row.original.insight_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'confidence_score',
      header: 'Confidence',
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
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/insights')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  // Job columns
  const jobColumns: ColumnDef<EnrichmentJob>[] = [
    {
      accessorKey: 'job_type',
      header: 'Job Type',
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Zap className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {highlightText(row.original.job_type.replace('_', ' '), query)}
            </p>
            {row.original.target_table && (
              <p className="text-sm text-slate-600">
                Target: {row.original.target_table}
              </p>
            )}
          </div>
        </div>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors = {
          completed: 'bg-green-100 text-green-700',
          processing: 'bg-blue-100 text-blue-700',
          failed: 'bg-red-100 text-red-700',
          pending: 'bg-yellow-100 text-yellow-700'
        }
        
        return (
          <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-slate-100 text-slate-700'} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
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
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/jobs')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  // Comment columns
  const commentColumns: ColumnDef<Comment>[] = [
    {
      accessorKey: 'content',
      header: 'Comment',
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm text-slate-900 line-clamp-2 leading-relaxed">
            {highlightText(row.original.content, query)}
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
    },
    {
      accessorKey: 'sentiment_score',
      header: 'Sentiment',
      cell: ({ row }) => {
        const score = row.original.sentiment_score
        if (!score) return <span className="text-slate-400">—</span>
        
        const sentiment = score > 0.1 ? 'Positive' : score < -0.1 ? 'Negative' : 'Neutral'
        const color = score > 0.1 ? 'bg-green-100 text-green-700' : 
                     score < -0.1 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        
        return (
          <Badge className={color} variant="secondary">
            {sentiment}
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/comments')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  const getColumns = () => {
    switch (type) {
      case 'contacts': return contactColumns
      case 'audiences': return audienceColumns
      case 'insights': return insightColumns
      case 'jobs': return jobColumns
      case 'comments': return commentColumns
      default: return []
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'contacts': return 'Contact Results'
      case 'audiences': return 'Audience Results'
      case 'insights': return 'AI Insight Results'
      case 'jobs': return 'Job Results'
      case 'comments': return 'Comment Results'
      default: return 'Results'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'contacts': return `${data.length} contacts matching "${query}"`
      case 'audiences': return `${data.length} audience segments matching "${query}"`
      case 'insights': return `${data.length} AI insights matching "${query}"`
      case 'jobs': return `${data.length} enrichment jobs matching "${query}"`
      case 'comments': return `${data.length} comments matching "${query}"`
      default: return `${data.length} results`
    }
  }

  return (
    <EnhancedDataTable
      data={data}
      columns={getColumns()}
      title={getTitle()}
      description={getDescription()}
      onRefresh={onRefresh}
      searchPlaceholder={`Search ${type}...`}
      emptyStateTitle={`No ${type} found`}
      emptyStateDescription={`No ${type} match your search criteria`}
    />
  )
}