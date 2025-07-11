'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, X } from 'lucide-react'

interface JobFiltersProps {
  onFiltersChange: (filters: JobFilterState) => void
}

export interface JobFilterState {
  statuses: string[]
  jobTypes: string[]
  targetTypes: string[]
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' }
]

const jobTypeOptions = [
  { value: 'contact_enrichment', label: 'Contact Enrichment' },
  { value: 'persona_analysis', label: 'Persona Analysis' },
  { value: 'sentiment_analysis', label: 'Sentiment Analysis' },
  { value: 'audience_clustering', label: 'Audience Clustering' },
  { value: 'engagement_analysis', label: 'Engagement Analysis' },
  { value: 'similarity_scoring', label: 'Similarity Scoring' }
]

const targetTypeOptions = [
  { value: 'contacts', label: 'Contacts' },
  { value: 'audience_segments', label: 'Audiences' },
  { value: 'comments', label: 'Comments' },
  { value: 'transcripts', label: 'Transcripts' }
]

export function JobFilters({ onFiltersChange }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFilterState>({
    statuses: [],
    jobTypes: [],
    targetTypes: []
  })

  const updateFilters = (newFilters: Partial<JobFilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearFilters = () => {
    const cleared = { statuses: [], jobTypes: [], targetTypes: [] }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const hasActiveFilters = filters.statuses.length > 0 || filters.jobTypes.length > 0 || filters.targetTypes.length > 0

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Status
            {filters.statuses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.statuses.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.statuses.includes(option.value)}
              onCheckedChange={(checked) => {
                const newStatuses = checked
                  ? [...filters.statuses, option.value]
                  : filters.statuses.filter(s => s !== option.value)
                updateFilters({ statuses: newStatuses })
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Job Type
            {filters.jobTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.jobTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filter by Job Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {jobTypeOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.jobTypes.includes(option.value)}
              onCheckedChange={(checked) => {
                const newJobTypes = checked
                  ? [...filters.jobTypes, option.value]
                  : filters.jobTypes.filter(t => t !== option.value)
                updateFilters({ jobTypes: newJobTypes })
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Target
            {filters.targetTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.targetTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Target Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {targetTypeOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={filters.targetTypes.includes(option.value)}
              onCheckedChange={(checked) => {
                const newTargetTypes = checked
                  ? [...filters.targetTypes, option.value]
                  : filters.targetTypes.filter(t => t !== option.value)
                updateFilters({ targetTypes: newTargetTypes })
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}