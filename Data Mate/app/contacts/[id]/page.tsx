'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ContactDetailTabs } from '@/components/contacts/ContactDetailTabs'
import { ContactProfileCard } from '@/components/contacts/ContactProfileCard'
import { supabase, Contact } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

export default function ContactDetailPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const contactId = params.id as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && contactId) {
      fetchContact()
    }
  }, [user, contactId])

  const fetchContact = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('user_id', user!.id)
        .single()

      if (queryError) throw queryError
      setContact(data)
    } catch (err) {
      console.error('Error fetching contact:', err)
      setError(err instanceof Error ? err.message : 'Failed to load contact')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  if (error || !contact) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {error ? 'Error Loading Contact' : 'Contact Not Found'}
            </h2>
            <p className="text-slate-600 mb-4">
              {error || 'The contact you\'re looking for doesn\'t exist.'}
            </p>
            <Button onClick={() => router.push('/contacts')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contacts
            </Button>
          </div>
        </div>
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
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/contacts')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contact Intelligence</h1>
            <p className="text-slate-600">
              Complete profile and enrichment data for {contact.name}
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <ContactProfileCard contact={contact} onContactUpdate={fetchContact} />

        {/* Intelligence Tabs */}
        <ContactDetailTabs contactId={contactId} contact={contact} />
      </motion.div>
    </DashboardLayout>
  )
}