'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GitGraph as GraphUp, Database } from 'lucide-react'

export default function GraphExplorerPage() {
  const { user, loading } = useAuth()

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
          <h1 className="text-3xl font-bold text-slate-900">Graph Explorer</h1>
          <p className="text-slate-600">
            Visualize and explore relationships in your data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraphUp className="w-5 h-5" />
              <span>Graph Explorer (Beta)</span>
            </CardTitle>
            <CardDescription>
              Interactive visualization of connections between contacts, audiences, and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mt-8 text-center py-12">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Graph Visualization Coming Soon</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our interactive graph explorer is currently in development. Soon you'll be able to visualize
                the connections between your contacts, audiences, and content in an intuitive graph interface.
              </p>
              <Button className="mt-4" variant="outline">
                Join Beta Waitlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}