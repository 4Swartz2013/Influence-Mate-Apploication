'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase, Comment, Contact } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ExternalLink,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CommentInsightPanelProps {
  contactId: string
  contact: Contact
}

interface SentimentBreakdown {
  positive: number
  negative: number
  neutral: number
  total: number
}

interface KeywordCluster {
  keyword: string
  count: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

export function CommentInsightPanel({ contact }: CommentInsightPanelProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sentimentBreakdown, setSentimentBreakdown] = useState<SentimentBreakdown | null>(null)
  const [keywordClusters, setKeywordClusters] = useState<KeywordCluster[]>([])

  useEffect(() => {
    if (user && contact.username) {
      fetchComments()
    } else {
      setLoading(false)
    }
  }, [user, contact.username])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Search for comments by username across platforms
      const { data, error: queryError } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', user!.id)
        .ilike('content', `%@${contact.username}%`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (queryError) throw queryError

      setComments(data || [])
      analyzeSentiment(data || [])
      extractKeywords(data || [])
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const analyzeSentiment = (comments: Comment[]) => {
    const breakdown = comments.reduce(
      (acc, comment) => {
        const score = comment.sentiment_score || 0
        if (score > 0.1) acc.positive++
        else if (score < -0.1) acc.negative++
        else acc.neutral++
        acc.total++
        return acc
      },
      { positive: 0, negative: 0, neutral: 0, total: 0 }
    )
    setSentimentBreakdown(breakdown)
  }

  const extractKeywords = (comments: Comment[]) => {
    // Simple keyword extraction from intent labels
    const keywordMap = new Map<string, { count: number; sentiments: number[] }>()

    comments.forEach(comment => {
      const labels = comment.intent_labels || []
      const sentiment = comment.sentiment_score || 0

      labels.forEach(label => {
        const existing = keywordMap.get(label) || { count: 0, sentiments: [] }
        existing.count++
        existing.sentiments.push(sentiment)
        keywordMap.set(label, existing)
      })
    })

    const clusters: KeywordCluster[] = Array.from(keywordMap.entries())
      .map(([keyword, data]) => {
        const avgSentiment = data.sentiments.reduce((sum, s) => sum + s, 0) / data.sentiments.length
        return {
          keyword,
          count: data.count,
          sentiment: avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'neutral'
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    setKeywordClusters(clusters)
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700'
      case 'negative':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  if (!contact.username) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Username Available</h3>
            <p className="text-slate-600">
              Comment analysis requires a username to search for mentions and interactions
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-48 h-6 bg-slate-200 animate-pulse rounded" />
              <div className="w-32 h-4 bg-slate-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-3/4 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Comments</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={fetchComments} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Comments Found</h3>
            <p className="text-slate-600 mb-4">
              No comments mentioning @{contact.username} were found in your database
            </p>
            <Button onClick={fetchComments} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Comment Analysis</h3>
        <p className="text-sm text-slate-600">
          Found {comments.length} comment{comments.length !== 1 ? 's' : ''} mentioning @{contact.username}
        </p>
      </div>

      {/* Sentiment Breakdown */}
      {sentimentBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Sentiment Breakdown</span>
            </CardTitle>
            <CardDescription>
              Overall sentiment analysis of comments mentioning this contact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Positive</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {sentimentBreakdown.positive}
                </div>
                <div className="text-xs text-green-600">
                  {sentimentBreakdown.total > 0 
                    ? ((sentimentBreakdown.positive / sentimentBreakdown.total) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Minus className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Neutral</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {sentimentBreakdown.neutral}
                </div>
                <div className="text-xs text-yellow-600">
                  {sentimentBreakdown.total > 0 
                    ? ((sentimentBreakdown.neutral / sentimentBreakdown.total) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Negative</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {sentimentBreakdown.negative}
                </div>
                <div className="text-xs text-red-600">
                  {sentimentBreakdown.total > 0 
                    ? ((sentimentBreakdown.negative / sentimentBreakdown.total) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Clusters */}
      {keywordClusters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Comment Themes</CardTitle>
            <CardDescription>
              Most common topics and intents in comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywordClusters.map((cluster, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge 
                    className={getSentimentColor(cluster.sentiment)}
                    variant="secondary"
                  >
                    <div className="flex items-center space-x-1">
                      {getSentimentIcon(cluster.sentiment)}
                      <span>{cluster.keyword}</span>
                      <span className="text-xs">({cluster.count})</span>
                    </div>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Comments</CardTitle>
          <CardDescription>
            Latest comments mentioning @{contact.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comments.slice(0, 5).map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {comment.platform}
                    </Badge>
                    {comment.sentiment_score && (
                      <Badge 
                        className={getSentimentColor(
                          comment.sentiment_score > 0.1 ? 'positive' : 
                          comment.sentiment_score < -0.1 ? 'negative' : 'neutral'
                        )}
                        variant="secondary"
                      >
                        {comment.sentiment_score > 0.1 ? 'Positive' : 
                         comment.sentiment_score < -0.1 ? 'Negative' : 'Neutral'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.post_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={comment.post_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {comment.content}
                </p>
                {comment.intent_labels && comment.intent_labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {comment.intent_labels.slice(0, 3).map((label, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}