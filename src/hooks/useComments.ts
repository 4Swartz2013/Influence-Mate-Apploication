import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';
import toast from 'react-hot-toast';

export const useComments = (filters?: any) => {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', filters],
    queryFn: async () => {
      let query = supabase
        .from('comments')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order('timestamp', { ascending: false });

      if (filters?.platforms?.length) {
        query = query.in('platform', filters.platforms);
      }

      if (filters?.search) {
        query = query.or(`content.ilike.%${filters.search}%,author_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Comment[];
    },
  });

  const replyToCommentMutation = useMutation({
    mutationFn: async ({ commentId, replyContent }: { commentId: string; replyContent: string }) => {
      const { error } = await supabase
        .from('comments')
        .update({ 
          replied: true, 
          reply_content: replyContent,
          replied_at: new Date().toISOString()
        })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Reply sent successfully');
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const markCommentAsReadMutation = useMutation({
    mutationFn: async (commentId: string) => {
      // Add read status to comments table if needed
      const { error } = await supabase
        .from('comments')
        .update({ workflow_triggered: true })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const archiveCommentsMutation = useMutation({
    mutationFn: async (commentIds: string[]) => {
      const { error } = await supabase
        .from('comments')
        .update({ is_archived: true })
        .in('id', commentIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comments archived successfully');
    },
    onError: () => {
      toast.error('Failed to archive comments');
    },
  });

  const flagCommentsMutation = useMutation({
    mutationFn: async (commentIds: string[]) => {
      const { error } = await supabase
        .from('comments')
        .update({ is_flagged: true })
        .in('id', commentIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comments flagged for review');
    },
    onError: () => {
      toast.error('Failed to flag comments');
    },
  });

  const assignWorkflowMutation = useMutation({
    mutationFn: async ({ commentIds, workflowId }: { commentIds: string[]; workflowId: string }) => {
      const { error } = await supabase
        .from('comments')
        .update({ 
          workflow_triggered: true,
          workflow_id: workflowId
        })
        .in('id', commentIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Workflow assigned successfully');
    },
    onError: () => {
      toast.error('Failed to assign workflow');
    },
  });

  const bulkReplyMutation = useMutation({
    mutationFn: async ({ commentIds, replyContent }: { commentIds: string[]; replyContent: string }) => {
      const updates = commentIds.map(id => ({
        id,
        replied: true,
        reply_content: replyContent,
        replied_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('comments')
        .upsert(updates);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Bulk reply sent successfully');
    },
    onError: () => {
      toast.error('Failed to send bulk reply');
    },
  });

  return {
    comments,
    isLoading,
    replyToComment: replyToCommentMutation.mutate,
    markAsRead: markCommentAsReadMutation.mutate,
    archiveComments: archiveCommentsMutation.mutate,
    flagComments: flagCommentsMutation.mutate,
    assignWorkflow: assignWorkflowMutation.mutate,
    bulkReply: bulkReplyMutation.mutate,
  };
};