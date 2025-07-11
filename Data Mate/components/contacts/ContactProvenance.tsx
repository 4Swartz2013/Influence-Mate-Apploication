'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProvenanceTimeline } from '@/components/provenance/ProvenanceTimeline'
import { FieldProvenanceCard } from '@/components/provenance/FieldProvenanceCard'
import { Contact } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import {
  History,
  GitBranch,
  AlertTriangle,
  Clock
} from 'lucide-react'

interface ContactProvenanceProps {
  contactId: string
  contact: Contact
}

interface FieldWithChanges {
  name: string
  count: number
  lastUpdated: string
}

export function ContactProvenance({ contactId, contact }: ContactProvenanceProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('timeline')
  const [fieldsWithChanges, setFieldsWithChanges] = useState<FieldWithChanges[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && contactId) {
      fetchFieldsWithChanges()
    }
  }, [user, contactId])

  const fetchFieldsWithChanges = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.rpc('get_fields_with_changes', {
        p_contact_id: contactId,
        p_user_id: user!.id
      })

      if (error) throw error

      if (data) {
        setFieldsWithChanges(data)
      } else {
        // Fallback if RPC doesn't exist - use raw query
        const { data: rawData, error: rawError } = await supabase
          .from('data_provenance')
          .select('field_name, detected_at')
          .eq('contact_id', contactId)
          .eq('user_id', user!.id)
          .order('detected_at', { ascending: false })

        if (rawError) throw rawError

        const fieldCountMap = new Map<string, { count: number; lastUpdated: string }>()
        
        rawData?.forEach(item => {
          if (!fieldCountMap.has(item.field_name)) {
            fieldCountMap.set(item.field_name, { count: 0, lastUpdated: item.detected_at })
          }
          
          const entry = fieldCountMap.get(item.field_name)!
          entry.count += 1
        })

        const fieldsList = Array.from(fieldCountMap.entries()).map(([name, data]) => ({
          name,
          count: data.count,
          lastUpdated: data.lastUpdated
        }))

        // Sort by most recent changes
        fieldsList.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        
        setFieldsWithChanges(fieldsList)
      }
    } catch (err) {
      console.error('Error fetching fields with changes:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderSummaryStats = () => {
    if (fieldsWithChanges.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No data provenance records found</p>
              <p className="text-sm text-slate-500 mt-1">
                Provenance information will appear here as contact data changes are recorded
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    const totalChanges = fieldsWithChanges.reduce((sum, field) => sum + field.count, 0)
    const mostChangedField = fieldsWithChanges.sort((a, b) => b.count - a.count)[0]
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <span>Provenance Summary</span>
          </CardTitle>
          <CardDescription>
            Data provenance metrics and most frequently updated fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <History className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Changes</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{totalChanges}</div>
              <div className="text-xs text-blue-600 mt-1">
                Across {fieldsWithChanges.length} fields
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Latest Update</span>
              </div>
              <div className="text-md font-bold text-green-700">
                {fieldsWithChanges[0]?.lastUpdated
                  ? new Date(fieldsWithChanges[0].lastUpdated).toLocaleDateString()
                  : 'N/A'}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {fieldsWithChanges[0]?.name} field
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Most Changed</span>
              </div>
              <div className="text-md font-bold text-purple-700">
                {mostChangedField?.name || 'N/A'}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {mostChangedField?.count || 0} recorded changes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {renderSummaryStats()}

      {/* Tabs for Timeline vs Field-by-Field views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Timeline View</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span>Field-by-Field View</span>
          </TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <ProvenanceTimeline contactId={contactId} />
        </TabsContent>

        {/* Field-by-Field View */}
        <TabsContent value="fields" className="mt-6">
          <div className="space-y-6">
            {loading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="w-32 h-6 bg-slate-200 animate-pulse rounded" />
                      <div className="w-48 h-4 bg-slate-200 animate-pulse rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-8 bg-slate-200 animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : fieldsWithChanges.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-slate-600">No field history available</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {fieldsWithChanges.map(field => (
                  <FieldProvenanceCard
                    key={field.name}
                    contactId={contactId}
                    field={field.name}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}