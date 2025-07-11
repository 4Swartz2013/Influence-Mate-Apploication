'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SearchResultTabs } from '@/components/search/SearchResultTabs'
import { SmartFilterDrawer } from '@/components/search/SmartFilterDrawer'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase, Contact, AudienceSegment, AIInsight, EnrichmentJob, Comment } from '@/lib/supabase'
import { Filter, Search } from 'lucide-react'

interface SearchResults {
  contacts: Contact[]
  audiences: AudienceSegment[]
  insights: AIInsight[]
  jobs: EnrichmentJob[]
  comments: Comment[]
}

interface SearchFilters {
  platforms: string[]
  personas: string[]
  enrichmentStatus: string[]
  engagementRange: [number, number]
  confidenceRange: [number, number]
  dateRange: [Date | null, Date | null]
}

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState<SearchResults>({
    contacts: [],
    audiences: [],
    insights: [],
    jobs: [],
    comments: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    platforms: [],
    personas: [],
    enrichmentStatus: [],
    engagementRange: [0, 100],
    confidenceRange: [0, 100],
    dateRange: [null, null]
  })

  useEffect(() => {
    if (user && query) {
      performSearch()
    }
  }, [user, query, filters])

  const performSearch = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchTerm = `%${query}%`

      // Build filter conditions
      const platformFilter = filters.platforms.length > 0 ? filters.platforms : undefined
      const enrichmentFilter = filters.enrichmentStatus.length > 0 ? filters.enrichmentStatus : undefined

      // Search contacts
      let contactsQuery = supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user!.id)
        .or(`name.ilike.${searchTerm},username.ilike.${searchTerm},bio.ilike.${searchTerm},email.ilike.${searchTerm}`)

      if (platformFilter) {
        contactsQuery = contactsQuery.in('platform', platformFilter)
      }

      if (filters.engagementRange[0] > 0 || filters.engagementRange[1] < 100) {
        contactsQuery = contactsQuery
          .gte('engagement_rate', filters.engagementRange[0] / 100)
          .lte('engagement_rate', filters.engagementRange[1] / 100)
      }

      const { data: contacts, error: contactsError } = await contactsQuery.limit(50)

      // Search audience segments
      let audiencesQuery = supabase
        .from('audience_segments')
        .select('*')
        .eq('user_id', user!.id)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},ai_persona_label.ilike.${searchTerm}`)

      if (filters.personas.length > 0) {
        audiencesQuery = audiencesQuery.in('ai_persona_label', filters.personas)
      }

      const { data: audiences, error: audiencesError } = await audiencesQuery.limit(50)

      // Search AI insights
      let insightsQuery = supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user!.id)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)

      if (filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100) {
        insightsQuery = insightsQuery
          .gte('confidence_score', filters.confidenceRange[0] / 100)
          .lte('confidence_score', filters.confidenceRange[1] / 100)
      }

      const { data: insights, error: insightsError } = await insightsQuery.limit(50)

      // Search enrichment jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .eq('user_id', user!.id)
        .ilike('job_type', searchTerm)
        .limit(50)

      // Search comments
      let commentsQuery = supabase
        .from('comments')
        .select('*')
        .eq('user_id', user!.id)
        .ilike('content', searchTerm)

      if (platformFilter) {
        commentsQuery = commentsQuery.in('platform', platformFilter)
      }

      const { data: comments, error: commentsError } = await commentsQuery.limit(50)

      // Check for errors
      if (contactsError || audiencesError || insightsError || jobsError || commentsError) {
        throw new Error('Search failed')
      }

      setResults({
        contacts: contacts || [],
        audiences: audiences || [],
        insights: insights || [],
        jobs: jobs || [],
        comments: comments || []
      })

    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const getTotalResults = () => {
    return Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  }

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

  if (!query) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Search</h1>
            <p className="text-slate-600">
              Search across contacts, audiences, insights, and more
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Start Searching</h3>
                <p className="text-slate-600 mb-6">
                  Use the search bar above to find contacts, audiences, insights, and more
                </p>
                <GlobalSearchBar className="max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Search Results</h1>
            <p className="text-slate-600">
              {loading ? 'Searching...' : `${getTotalResults()} results for "${query}"`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setFilterDrawerOpen(true)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {Object.values(filters).some(f => 
                Array.isArray(f) ? f.length > 0 : f !== null
              ) && (
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <GlobalSearchBar 
              className="w-full"
              placeholder={`Search for "${query}" or try something else...`}
            />
          </CardContent>
        </Card>

        {/* Results */}
        {error ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Search className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Search Error</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button onClick={performSearch} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SearchResultTabs 
            results={results} 
            loading={loading} 
            query={query}
            onRefresh={performSearch}
          />
        )}

        {/* Filter Drawer */}
        <SmartFilterDrawer
          open={filterDrawerOpen}
          onOpenChange={setFilterDrawerOpen}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={performSearch}
        />
      </motion.div>
    </DashboardLayout>
  )
}