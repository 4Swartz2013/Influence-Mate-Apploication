'use client'

import { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EnhancedDataTable } from '@/components/tables/EnhancedDataTable'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { Contact } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ExternalLink, Star, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ContactsPage() {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: contacts,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Contact>({
    table: 'contacts',
    select: '*',
    orderBy: { column: 'updated_at', ascending: false },
    enabled: !!user
  })

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Contact
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {row.original.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-slate-900">{row.original.name || 'Unknown Contact'}</p>
            {row.original.email && (
              <p className="text-sm text-slate-500">{row.original.email}</p>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'username',
      header: 'Username',
      cell: ({ row }) => {
        const username = row.original.username
        if (!username) return <span className="text-slate-400">—</span>
        
        return (
          <div className="flex items-center space-x-1">
            <span className="text-sm font-mono">@{username}</span>
          </div>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => {
        const platform = row.original.platform
        if (!platform) return <span className="text-slate-400">—</span>
        
        return (
          <Badge variant="outline" className="capitalize">
            {platform}
          </Badge>
        )
      },
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'follower_count',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Followers
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const followers = row.original.follower_count
        if (!followers) return <span className="text-slate-400">—</span>
        
        return (
          <span className="font-medium">
            {followers.toLocaleString()}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'engagement_rate',
      header: 'Engagement',
      cell: ({ row }) => {
        const rate = row.original.engagement_rate
        if (!rate) return <span className="text-slate-400">—</span>
        
        return (
          <Badge variant={rate > 0.05 ? 'default' : 'secondary'}>
            {(rate * 100).toFixed(1)}%
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      id: 'enriched',
      header: 'Enriched',
      cell: ({ row }) => {
        const hasEnrichment = row.original.bio || row.original.location || row.original.contact_score
        
        return hasEnrichment ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-400" />
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(row.original.created_at), { addSuffix: true })}
        </span>
      ),
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          <ExternalLink className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600">
            Manage and analyze your enriched contact database
          </p>
        </div>

        <EnhancedDataTable
          data={contacts}
          columns={columns}
          title="Contact Database"
          description="Enriched profiles with AI-powered insights and scoring"
          loading={loading}
          error={error}
          onRefresh={refetch}
          searchPlaceholder="Search contacts by name, email, or username..."
          emptyStateTitle="No contacts found"
          emptyStateDescription="Start building your contact database by importing or adding contacts"
          emptyStateAction={{
            label: "Add Contact",
            onClick: () => console.log('Add contact')
          }}
          onAdd={() => console.log('Add contact')}
          onExport={() => console.log('Export contacts')}
        />
      </motion.div>
    </DashboardLayout>
  )
}