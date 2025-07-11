'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ContactInsightTab } from './ContactInsightTab'
import { ContactEnrichmentTimeline } from './ContactEnrichmentTimeline'
import { ContactAudienceMembership } from './ContactAudienceMembership'
import { CommentInsightPanel } from './CommentInsightPanel'
import { ContactProvenance } from './ContactProvenance'
import { ContactConfidencePanel } from '@/components/confidence/ContactConfidencePanel'
import { Contact } from '@/lib/supabase'
import { 
  Brain, 
  Clock, 
  Users, 
  MessageSquare,
  History,
  Shield 
} from 'lucide-react'

interface ContactDetailTabsProps {
  contactId: string
  contact: Contact
}

export function ContactDetailTabs({ contactId, contact }: ContactDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('insights')

  const tabs = [
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Brain,
      component: ContactInsightTab
    },
    {
      id: 'enrichment',
      label: 'Enrichment History',
      icon: Clock,
      component: ContactEnrichmentTimeline
    },
    {
      id: 'audiences',
      label: 'Audience Membership',
      icon: Users,
      component: ContactAudienceMembership
    },
    {
      id: 'comments',
      label: 'Comment Analysis',
      icon: MessageSquare,
      component: CommentInsightPanel
    },
    {
      id: 'provenance',
      label: 'Provenance',
      icon: History,
      component: ContactProvenance
    },
    {
      id: 'confidence',
      label: 'Confidence',
      icon: Shield,
      component: ContactConfidencePanel
    }
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
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
              <tab.component contactId={contactId} contact={contact} />
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  )
}