'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

interface UseSupabaseQueryOptions {
  table: string
  select?: string
  orderBy?: { column: string; ascending?: boolean }
  filters?: Array<{ column: string; operator: string; value: any }>
  enabled?: boolean
}

interface UseSupabaseQueryResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSupabaseQuery<T = any>({
  table,
  select = '*',
  orderBy = { column: 'created_at', ascending: false },
  filters = [],
  enabled = true,
}: UseSupabaseQueryOptions): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Handle database errors
  const handleDatabaseError = (err: any) => {
    const isMissingTable = err.message?.includes('does not exist');
    const isMissingColumn = err.message?.includes('column') && err.message?.includes('does not exist');
    
    if (isMissingTable || isMissingColumn) {
      // If these are database schema errors, redirect to setup
      router.push('/setup');
    }
    return err;
  }

  const fetchData = useCallback(async () => {
    // Don't execute queries on the setup page to avoid errors
    if (pathname === '/setup') {
      setLoading(false)
      setError(null)
      setData([])
      return
    }

    if (!enabled || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Set orderBy column to created_at for tables where updated_at doesn't exist yet
      let orderColumn = orderBy.column;
      if (orderColumn === 'updated_at' && 
          (table === 'comments' || table === 'transcripts' || table === 'ai_insights')) {
        // Use created_at as a fallback for tables that might not have updated_at
        orderColumn = 'created_at';
      }

      let query = supabase
        .from(table)
        .select(select)
        .eq('user_id', user.id)

      // Apply additional filters
      filters.forEach(filter => {
        query = query.filter(filter.column, filter.operator, filter.value)
      })

      // Apply ordering
      query = query.order(orderColumn, { ascending: orderBy.ascending })

      const { data: result, error: queryError } = await query

      if (queryError) {
        throw handleDatabaseError(queryError)
      }

      setData(result || [])
    } catch (err) {
      console.error(`Error fetching ${table}:`, err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [table, select, orderBy, filters, enabled, user, router, pathname])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}