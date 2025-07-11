'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { Campaign } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Megaphone, Calendar, DollarSign, Target } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

export default function CampaignsPage() {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: campaigns,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Campaign>({
    table: 'campaigns',
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
      case 'paused':
        return 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Campaign
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <Megaphone className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.original.name}</p>
            {row.original.description && (
              <p className="text-sm text-slate-600 line-clamp-1 mt-1">
                {row.original.description}
              </p>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
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
      accessorKey: 'budget',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const budget = row.original.budget
        if (!budget) return <span className="text-slate-400">—</span>
        
        return (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {budget.toLocaleString()}
            </span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'target_contacts',
      header: 'Targets',
      cell: ({ row }) => {
        const targets = row.original.target_contacts
        if (!targets || targets.length === 0) {
          return <span className="text-slate-400">—</span>
        }
        
        return (
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4 text-slate-400" />
            <Badge variant="outline">
              {targets.length} contacts
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'start_date',
      header: 'Timeline',
      cell: ({ row }) => {
        const startDate = row.original.start_date
        const endDate = row.original.end_date
        
        if (!startDate && !endDate) {
          return <span className="text-slate-400">—</span>
        }
        
        return (
          <div className="text-sm">
            {startDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{format(new Date(startDate), 'MMM d')}</span>
              </div>
            )}
            {endDate && (
              <div className="text-xs text-slate-500 mt-1">
                to {format(new Date(endDate), 'MMM d')}
              </div>
            )}
          </div>
        )
      },
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
        <Button variant="ghost" size="sm">
          <Megaphone className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-600">
            Manage and track your influencer marketing campaigns
          </p>
        </div>

        <EnhancedDataTable
          data={campaigns}
          columns={columns}
          title="Campaign Management"
          description="Orchestrate outreach campaigns with AI-powered targeting"
          loading={loading}
          error={error}
          onRefresh={refetch}
          searchPlaceholder="Search campaigns by name, status, or description..."
          emptyStateTitle="No campaigns found"
          emptyStateDescription="Create your first campaign to start reaching out to influencers"
          emptyStateAction={{
            label: "Create Campaign",
            onClick: () => console.log('Create new campaign')
          }}
          onAdd={() => console.log('Create new campaign')}
          onExport={() => console.log('Export campaigns')}
        />
      </motion.div>
    </DashboardLayout>
  )
}