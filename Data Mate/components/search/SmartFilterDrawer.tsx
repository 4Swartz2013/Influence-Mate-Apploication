'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Filter, 
  X, 
  RotateCcw,
  Users,
  Brain,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react'

interface SearchFilters {
  platforms: string[]
  personas: string[]
  enrichmentStatus: string[]
  engagementRange: [number, number]
  confidenceRange: [number, number]
  dateRange: [Date | null, Date | null]
}

interface SmartFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onApplyFilters: () => void
}

interface FilterOptions {
  platforms: string[]
  personas: string[]
  enrichmentStatuses: string[]
}

export function SmartFilterDrawer({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange, 
  onApplyFilters 
}: SmartFilterDrawerProps) {
  const { user } = useAuth()
  const [options, setOptions] = useState<FilterOptions>({
    platforms: [],
    personas: [],
    enrichmentStatuses: ['enriched', 'basic']
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && open) {
      fetchFilterOptions()
    }
  }, [user, open])

  const fetchFilterOptions = async () => {
    try {
      setLoading(true)

      // Get unique platforms from contacts
      const { data: platformData } = await supabase
        .from('contacts')
        .select('platform')
        .eq('user_id', user!.id)
        .not('platform', 'is', null)

      const platforms = [...new Set(platformData?.map(item => item.platform).filter(Boolean))]

      // Get unique personas from audience insights
      const { data: personaData } = await supabase
        .from('audience_segments')
        .select('ai_persona_label')
        .eq('user_id', user!.id)
        .not('ai_persona_label', 'is', null)

      const personas = [...new Set(personaData?.map(item => item.ai_persona_label).filter(Boolean))]

      setOptions({
        platforms: platforms as string[],
        personas: personas as string[],
        enrichmentStatuses: ['enriched', 'basic']
      })
    } catch (error) {
      console.error('Error fetching filter options:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: 'platforms' | 'personas' | 'enrichmentStatus', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilters(key, newArray)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      platforms: [],
      personas: [],
      enrichmentStatus: [],
      engagementRange: [0, 100],
      confidenceRange: [0, 100],
      dateRange: [null, null]
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.platforms.length > 0) count++
    if (filters.personas.length > 0) count++
    if (filters.enrichmentStatus.length > 0) count++
    if (filters.engagementRange[0] > 0 || filters.engagementRange[1] < 100) count++
    if (filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 100) count++
    if (filters.dateRange[0] || filters.dateRange[1]) count++
    return count
  }

  const hasActiveFilters = getActiveFilterCount() > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <SheetTitle>Smart Filters</SheetTitle>
              {hasActiveFilters && (
                <Badge variant="secondary">
                  {getActiveFilterCount()} active
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-500 hover:text-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          <SheetDescription>
            Apply advanced filters to refine your search results across all data types.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Platform Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Platforms</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Filter by social media platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-20 h-6 bg-slate-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {options.platforms.map((platform) => (
                    <motion.div
                      key={platform}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Badge
                        variant={filters.platforms.includes(platform) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleArrayFilter('platforms', platform)}
                      >
                        {platform}
                        {filters.platforms.includes(platform) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Persona Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Personas</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Filter by AI-generated persona labels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-24 h-6 bg-slate-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : options.personas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {options.personas.map((persona) => (
                    <motion.div
                      key={persona}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Badge
                        variant={filters.personas.includes(persona) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter('personas', persona)}
                      >
                        {persona}
                        {filters.personas.includes(persona) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No personas found</p>
              )}
            </CardContent>
          </Card>

          {/* Enrichment Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Enrichment Status</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Filter by profile enrichment level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {options.enrichmentStatuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={status}
                    checked={filters.enrichmentStatus.includes(status)}
                    onCheckedChange={() => toggleArrayFilter('enrichmentStatus', status)}
                  />
                  <Label htmlFor={status} className="text-sm capitalize cursor-pointer">
                    {status} Profiles
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Engagement Range Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Engagement Rate</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Filter by engagement rate percentage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={filters.engagementRange}
                  onValueChange={(value) => updateFilters('engagementRange', value as [number, number])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{filters.engagementRange[0]}%</span>
                <span>{filters.engagementRange[1]}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Range Filter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Confidence</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Filter by AI insight confidence score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={filters.confidenceRange}
                  onValueChange={(value) => updateFilters('confidenceRange', value as [number, number])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{filters.confidenceRange[0]}%</span>
                <span>{filters.confidenceRange[1]}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apply Filters Button */}
        <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                onApplyFilters()
                onOpenChange(false)
              }}
              className="flex-1"
            >
              Apply Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}