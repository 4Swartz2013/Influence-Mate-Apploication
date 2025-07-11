'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export default function DataQualityPage() {
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
          <h1 className="text-3xl font-bold text-slate-900">Data Quality</h1>
          <p className="text-slate-600">
            Monitor and improve the quality of your data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Data Quality Dashboard (Beta)</span>
            </CardTitle>
            <CardDescription>
              Overview of data quality metrics and improvement opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Overall Quality</h3>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Completeness</h3>
                    <Badge variant="outline">92%</Badge>
                  </div>
                  <Progress value={92} className="h-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-600">Accuracy</h3>
                    <Badge variant="outline">78%</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center py-8">
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Quality Tools Coming Soon</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our comprehensive data quality tools are currently in development. Soon you'll be able to
                identify and fix data quality issues across your entire dataset.
              </p>
              <Button className="mt-4" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Data Quality Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}