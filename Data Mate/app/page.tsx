'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const [dbError, setDbError] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    if (user) {
      // Check if database is properly set up
      checkDatabase()
    }
  }, [user])

  const checkDatabase = async () => {
    try {
      // Try to query tables that should exist - including campaigns table
      const tables = ['ai_insights', 'comments', 'transcripts', 'campaigns']
      const errors = []

      for (const table of tables) {
        try {
          await supabase.from(table).select('id').limit(1)
        } catch (error) {
          errors.push(error)
        }
      }

      if (errors.length > 0) {
        setDbError(true)
      }
    } catch (error) {
      console.error('Error checking database:', error)
      setDbError(true)
    }
  }

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

  if (dbError) {
    return (
      <DashboardLayout>
        <Card className="max-w-2xl mx-auto my-12 border-red-200">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Database className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Database Setup Required</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-red-800">Database Error Detected</p>
                    <p className="text-red-700 text-sm mt-1">
                      Your application is missing required database tables or columns.
                      This is likely because the database migrations haven't been run yet.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-slate-600">
                Please visit the setup page to configure your database with the required tables and schema.
              </p>
              <Button 
                onClick={() => router.push('/setup')} 
                size="lg"
                className="mt-4"
              >
                <Database className="w-4 h-4 mr-2" />
                Go to Database Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}