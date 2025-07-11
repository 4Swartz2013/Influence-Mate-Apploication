'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnrichmentJobTable } from '@/components/jobs/EnrichmentJobTable'
import { supabase, EnrichmentJob, Contact } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Clock } from 'lucide-react'

interface ContactEnrichmentTimelineProps {
  contactId: string
  contact: Contact
}

export function ContactEnrichmentTimeline({ contactId }: ContactEnrichmentTimelineProps) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<EnrichmentJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && contactId) {
      fetchEnrichmentJobs()
    }
  }, [user, contactId])

  const fetchEnrichmentJobs = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('enrichment_jobs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('target_id', contactId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching enrichment jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Enrichment Timeline</span>
          </CardTitle>
          <CardDescription>
            History of data enrichment and analysis activities for this contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 && !loading ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No enrichment jobs found</p>
              <p className="text-sm">Enrichment activities will appear here as they are processed</p>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {jobs.length} enrichment job{jobs.length !== 1 ? 's' : ''} found for this contact
            </p>
          )}
        </CardContent>
      </Card>

      <EnrichmentJobTable
        jobs={jobs}
        loading={loading}
        onRefresh={fetchEnrichmentJobs}
        contactId={contactId}
      />
    </div>
  )
}