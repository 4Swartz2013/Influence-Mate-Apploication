'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AudienceOverview } from './AudienceOverview'
import { AudienceInsights } from './AudienceInsights'
import { AudienceMembers } from './AudienceMembers'
import { AudienceTimeline } from './AudienceTimeline'
import { AudienceProvenance } from './AudienceProvenance'
import { AudienceSegment } from '@/lib/supabase'
import { 
  BarChart3, 
  Brain, 
  Users, 
  Clock,
  History
} from 'lucide-react'

interface AudienceDetailTabsProps {
  audienceId: string
  audience: AudienceSegment
}

export function AudienceDetailTabs({ audienceId, audience }: AudienceDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      component: AudienceOverview
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: Brain,
      component: AudienceInsights
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      component: AudienceMembers
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Clock,
      component: AudienceTimeline
    },
    {
      id: 'provenance',
      label: 'Provenance',
      icon: History,
      component: AudienceProvenance
    }
  ]

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
              <tab.component audienceId={audienceId} audience={audience} />
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  )
}