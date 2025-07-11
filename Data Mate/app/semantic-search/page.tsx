'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Database, Zap } from 'lucide-react'

export default function SemanticSearchPage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Semantic Search</h1>
          <p className="text-slate-600">
            Vector-powered search across all your data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Semantic Search (Beta)</span>
            </CardTitle>
            <CardDescription>
              Search using natural language across all your contacts, content, and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  placeholder="Search for concepts, topics, or similar content..."
                  className="pl-10 py-6 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center py-12">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Vector Search Coming Soon</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our semantic search engine is currently in development. Soon you'll be able to search
                across all your data using natural language and find conceptually similar content.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}