'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SegmentOverlapTable } from './SegmentOverlapTable'
import { ContactOverlapList } from './ContactOverlapList'
import { PersonaBreakdownTable } from './PersonaBreakdownTable'
import { SegmentHeatmap } from './SegmentHeatmap'
import { AudienceSegment, Contact, AudienceInsight } from '@/lib/supabase'
import { 
  Shuffle, 
  Users, 
  Brain, 
  BarChart3 
} from 'lucide-react'

interface CrossMatchData {
  segments: AudienceSegment[]
  contacts: Contact[]
  insights: AudienceInsight[]
  membershipMap: Map<string, string[]>
  segmentMembersMap: Map<string, string[]>
}

interface CrossMatchTabsProps {
  crossMatchData: CrossMatchData
  onRefresh: () => void
}

export function CrossMatchTabs({ crossMatchData, onRefresh }: CrossMatchTabsProps) {
  const [activeTab, setActiveTab] = useState('overlap')

  const tabs = [
    {
      id: 'overlap',
      label: 'Segment Overlap',
      icon: Shuffle,
      component: SegmentOverlapTable
    },
    {
      id: 'contacts',
      label: 'Contact Overlap',
      icon: Users,
      component: ContactOverlapList
    },
    {
      id: 'personas',
      label: 'Persona Breakdown',
      icon: Brain,
      component: PersonaBreakdownTable
    },
    {
      id: 'heatmap',
      label: 'Overlap Heatmap',
      icon: BarChart3,
      component: SegmentHeatmap
    }
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
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
              <tab.component crossMatchData={crossMatchData} onRefresh={onRefresh} />
            </motion.div>
          </TabsContent>
        ))}
      </AnimatePresence>
    </Tabs>
  )
}