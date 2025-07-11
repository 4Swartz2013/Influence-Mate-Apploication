'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SearchResultTable } from './SearchResultTable'
import { Contact, AudienceSegment, AIInsight, EnrichmentJob, Comment } from '@/lib/supabase'
import { 
  Users, 
  Target, 
  Brain, 
  Zap, 
  MessageSquare,
  Search
} from 'lucide-react'

interface SearchResults {
  contacts: Contact[]
  audiences: AudienceSegment[]
  insights: AIInsight[]
  jobs: EnrichmentJob[]
  comments: Comment[]
}

interface SearchResultTabsProps {
  results: SearchResults
  loading: boolean
  query: string
  onRefresh: () => void
}

export function SearchResultTabs({ results, loading, query, onRefresh }: SearchResultTabsProps) {
  const [activeTab, setActiveTab] = useState('contacts')

  const tabs = [
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      count: results.contacts.length,
      data: results.contacts
    },
    {
      id: 'audiences',
      label: 'Audiences',
      icon: Target,
      count: results.audiences.length,
      data: results.audiences
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Brain,
      count: results.insights.length,
      data: results.insights
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Zap,
      count: results.jobs.length,
      data: results.jobs
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      count: results.comments.length,
      data: results.comments
    }
  ]

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="w-32 h-6 bg-slate-200 animate-pulse rounded" />
                <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-3/4 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (totalResults === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Results Found</h3>
            <p className="text-slate-600 mb-4">
              No results found for "<span className="font-medium">{query}</span>"
            </p>
            <div className="text-sm text-slate-500">
              <p>Try:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Checking your spelling</li>
                <li>Using different keywords</li>
                <li>Searching for partial matches</li>
                <li>Adjusting your filters</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <Badge variant="secondary" className="ml-1">
                {tab.count}
              </Badge>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <AnimatePresence mode="wait">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SearchResultTable
                type={tab.id as any}
                data={tab.data}
                query={query}
                onRefresh={onRefresh}
              />
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  )
}