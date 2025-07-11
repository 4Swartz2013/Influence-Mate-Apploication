'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Search, 
  Users, 
  Target, 
  Brain, 
  MessageSquare,
  Zap,
  Clock
} from 'lucide-react'

interface SearchSuggestion {
  id: string
  type: 'contact' | 'audience' | 'insight' | 'job'
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
}

interface GlobalSearchBarProps {
  className?: string
  placeholder?: string
}

export function GlobalSearchBar({ 
  className = "", 
  placeholder = "Search contacts, audiences, insights..." 
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length >= 2 && user) {
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [query, user])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const searchTerm = `%${query}%`

      // Search contacts
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, username, platform')
        .eq('user_id', user!.id)
        .or(`name.ilike.${searchTerm},username.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .limit(3)

      // Search audience segments
      const { data: audiences } = await supabase
        .from('audience_segments')
        .select('id, name, ai_persona_label, total_contacts')
        .eq('user_id', user!.id)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},ai_persona_label.ilike.${searchTerm}`)
        .limit(3)

      // Search AI insights
      const { data: insights } = await supabase
        .from('ai_insights')
        .select('id, title, insight_type')
        .eq('user_id', user!.id)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(2)

      // Search enrichment jobs
      const { data: jobs } = await supabase
        .from('enrichment_jobs')
        .select('id, job_type, status, target_table')
        .eq('user_id', user!.id)
        .ilike('job_type', searchTerm)
        .limit(2)

      const newSuggestions: SearchSuggestion[] = []

      // Add contact suggestions
      contacts?.forEach(contact => {
        newSuggestions.push({
          id: contact.id,
          type: 'contact',
          title: contact.name || 'Unknown Contact',
          subtitle: contact.username ? `@${contact.username}` : contact.platform,
          icon: Users
        })
      })

      // Add audience suggestions
      audiences?.forEach(audience => {
        newSuggestions.push({
          id: audience.id,
          type: 'audience',
          title: audience.name,
          subtitle: audience.ai_persona_label || `${audience.total_contacts} contacts`,
          icon: Target
        })
      })

      // Add insight suggestions
      insights?.forEach(insight => {
        newSuggestions.push({
          id: insight.id,
          type: 'insight',
          title: insight.title,
          subtitle: insight.insight_type.replace('_', ' '),
          icon: Brain
        })
      })

      // Add job suggestions
      jobs?.forEach(job => {
        newSuggestions.push({
          id: job.id,
          type: 'job',
          title: job.job_type.replace('_', ' '),
          subtitle: `${job.status} • ${job.target_table}`,
          icon: Zap
        })
      })

      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (finalQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`)
      setShowSuggestions(false)
      setQuery('')
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false)
    setQuery('')

    switch (suggestion.type) {
      case 'contact':
        router.push(`/contacts/${suggestion.id}`)
        break
      case 'audience':
        router.push(`/audiences/${suggestion.id}`)
        break
      case 'insight':
        router.push(`/insights`)
        break
      case 'job':
        router.push(`/jobs`)
        break
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && (query.length >= 2 || suggestions.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-lg border-slate-200">
              <CardContent className="p-2">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-slate-600">Searching...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => {
                      const Icon = suggestion.icon
                      return (
                        <button
                          key={`${suggestion.type}-${suggestion.id}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {suggestion.title}
                            </p>
                            {suggestion.subtitle && (
                              <p className="text-sm text-slate-500 truncate">
                                {suggestion.subtitle}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {suggestion.type}
                          </Badge>
                        </button>
                      )
                    })}
                    {query.length >= 2 && (
                      <div className="border-t pt-2 mt-2">
                        <button
                          onClick={() => handleSearch()}
                          className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                        >
                          <Search className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            Search for "<span className="font-medium">{query}</span>"
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-slate-500">No results found</p>
                    <button
                      onClick={() => handleSearch()}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Search anyway
                    </button>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-slate-500">Type to search...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}