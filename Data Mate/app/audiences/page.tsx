'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { AudienceSegment } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Users, Brain, Target, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function AudiencesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const {
    data: audiences,
    loading,
    error,
    refetch
  } = useSupabaseQuery<AudienceSegment>({
    table: 'audience_segments',
    select: '*',
    orderBy: { column: 'updated_at', ascending: false },
    enabled: !!user
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-slate-100 text-slate-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'archived':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getReadinessColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const columns: ColumnDef<AudienceSegment>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Audience
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.original.name}</p>
            {row.original.description && (
              <p className="text-sm text-slate-600 line-clamp-1 mt-1">
                {row.original.description}
              </p>
            )}
            {row.original.ai_persona_label && (
              <div className="flex items-center space-x-1 mt-1">
                <Brain className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">
                  {row.original.ai_persona_label}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'total_contacts',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Contacts
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Target className="w-4 h-4 text-slate-400" />
          <span className="font-medium">
            {row.original.total_contacts.toLocaleString()}
          </span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'engagement_score',
      header: 'Engagement',
      cell: ({ row }) => {
        const score = row.original.engagement_score
        if (!score) return <span className="text-slate-400">—</span>
        
        return (
          <Badge variant={score > 0.7 ? 'default' : 'secondary'}>
            {(score * 100).toFixed(0)}%
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'outreach_readiness_score',
      header: 'Readiness',
      cell: ({ row }) => {
        const score = row.original.outreach_readiness_score
        if (!score) return <span className="text-slate-400">—</span>
        
        return (
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-4 h-4 ${getReadinessColor(score)}`} />
            <span className={`font-medium ${getReadinessColor(score)}`}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'primary_traits',
      header: 'Primary Traits',
      cell: ({ row }) => {
        const traits = row.original.primary_traits
        if (!traits || typeof traits !== 'object') {
          return <span className="text-slate-400">—</span>
        }
        
        const traitKeys = Object.keys(traits).slice(0, 3)
        
        return (
          <div className="flex flex-wrap gap-1">
            {traitKeys.map((trait, index) => (
              <Badge key={index} variant="outline" className="text-xs capitalize">
                {trait.replace('_', ' ')}
              </Badge>
            ))}
            {Object.keys(traits).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{Object.keys(traits).length - 3}
              </Badge>
            )}
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          className={getStatusColor(row.original.status)}
          variant="secondary"
        >
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(row.original.updated_at), { addSuffix: true })}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/audiences/${row.original.id}`)}
        >
          <Brain className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  if (authLoading) {
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
          <h1 className="text-3xl font-bold text-slate-900">Audience Segments</h1>
          <p className="text-slate-600">
            AI-powered audience clustering and intelligence insights
          </p>
        </div>

        <EnhancedDataTable
          data={audiences}
          columns={columns}
          title="Audience Intelligence"
          description="Discover and analyze audience segments with AI-powered clustering"
          loading={loading}
          error={error || undefined}
          onRefresh={refetch}
          searchPlaceholder="Search audiences by name, traits, or persona..."
          emptyStateTitle="No audience segments found"
          emptyStateDescription="Create your first audience segment to start discovering insights"
          emptyStateAction={{
            label: "Create Audience",
            onClick: () => router.push('/audiences/create')
          }}
          onAdd={() => router.push('/audiences/create')}
          onExport={() => console.log('Export audiences')}
        />
      </motion.div>
    </DashboardLayout>
  )
}