import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Contact } from '../types';
import toast from 'react-hot-toast';

export const useContacts = (filters?: any) => {
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      if (filters?.tags?.length) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Contact[];
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: Partial<Contact>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          user_id: user.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact created successfully');
    },
    onError: () => {
      toast.error('Failed to create contact');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact updated successfully');
    },
    onError: () => {
      toast.error('Failed to update contact');
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });

  const enrichContactMutation = useMutation({
    mutationFn: async ({ contactId, source, fields }: { 
      contactId: string; 
      source: string; 
      fields: string[] 
    }) => {
      // Simulate enrichment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockEnrichedData = {
        bio: 'Digital marketing expert with 10+ years of experience',
        company: 'Tech Innovations Inc',
        job_title: 'Senior Marketing Director',
        follower_count: 15000,
        engagement_rate: 4.2,
        location: 'San Francisco, CA',
        website: 'https://example.com'
      };

      const { error } = await supabase
        .from('contacts')
        .update({
          ...mockEnrichedData,
          enriched: true,
          enriched_at: new Date().toISOString(),
          enrichment_source: source
        })
        .eq('id', contactId);
      if (error) throw error;

      // Log enrichment activity
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('contact_enrichment_logs')
          .insert({
            contact_id: contactId,
            user_id: user.id,
            enriched_by: source,
            enrichment_type: 'profile',
            data_before: {},
            data_after: mockEnrichedData,
            fields_updated: fields,
            confidence_score: 0.95,
            cost: 0.25,
            status: 'completed'
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact enriched successfully');
    },
    onError: () => {
      toast.error('Failed to enrich contact');
    },
  });

  return {
    contacts,
    isLoading,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    enrichContact: enrichContactMutation.mutate,
    isEnriching: enrichContactMutation.isPending,
  };
};