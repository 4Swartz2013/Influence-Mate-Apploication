import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import toast from 'react-hot-toast';

export const useMessages = (filters?: any) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', filters],
    queryFn: async () => {
      let query = supabase
        .from('messages')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order('timestamp', { ascending: false });

      if (filters?.platforms?.length) {
        query = query.in('platform', filters.platforms);
      }

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`body.ilike.%${filters.search}%,sender_name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Message[];
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: () => {
      toast.error('Failed to mark message as read');
    },
  });

  const archiveMessagesMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_archived: true })
        .in('id', messageIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Messages archived successfully');
    },
    onError: () => {
      toast.error('Failed to archive messages');
    },
  });

  const flagMessagesMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_flagged: true })
        .in('id', messageIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Messages flagged for review');
    },
    onError: () => {
      toast.error('Failed to flag messages');
    },
  });

  const replyToMessageMutation = useMutation({
    mutationFn: async ({ messageId, replyContent }: { messageId: string; replyContent: string }) => {
      // Get the original message
      const { data: originalMessage, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update original message status
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'replied' })
        .eq('id', messageId);
      
      if (updateError) throw updateError;

      // Create reply message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          user_id: originalMessage.user_id,
          platform: originalMessage.platform,
          thread_id: originalMessage.thread_id || originalMessage.id,
          contact_id: originalMessage.contact_id,
          sender_name: 'You',
          recipient_name: originalMessage.sender_name,
          recipient_email: originalMessage.sender_email,
          recipient_handle: originalMessage.sender_handle,
          subject: originalMessage.subject ? `Re: ${originalMessage.subject}` : undefined,
          body: replyContent,
          message_type: originalMessage.message_type,
          status: 'replied',
          priority: 'normal',
          attachments: [],
          metadata: { reply_to: messageId }
        });
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Reply sent successfully');
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find contact if exists
      let contactId = null;
      if (messageData.recipient) {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id')
          .or(`email.eq.${messageData.recipient},handle.eq.${messageData.recipient}`)
          .limit(1);
        
        if (contacts && contacts.length > 0) {
          contactId = contacts[0].id;
        }
      }

      // Create new message
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          platform: messageData.platform,
          contact_id: contactId,
          sender_name: 'You',
          recipient_name: messageData.recipient,
          recipient_email: messageData.platform === 'email' ? messageData.recipient : null,
          recipient_handle: messageData.platform !== 'email' ? messageData.recipient : null,
          subject: messageData.subject,
          body: messageData.content,
          message_type: messageData.message_type || 'message',
          status: 'replied',
          priority: messageData.priority || 'normal',
          attachments: [],
          is_read: true
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message sent successfully');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const assignWorkflowMutation = useMutation({
    mutationFn: async ({ messageIds, workflowId }: { messageIds: string[]; workflowId: string }) => {
      // In a real app, you would store this in a workflow_assignments table
      // For now, we'll just update a metadata field
      const { error } = await supabase
        .from('messages')
        .update({ 
          metadata: supabase.rpc('jsonb_set', { 
            target: 'metadata', 
            path: '{workflow_id}', 
            value: JSON.stringify(workflowId)
          })
        })
        .in('id', messageIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Workflow assigned successfully');
    },
    onError: () => {
      toast.error('Failed to assign workflow');
    },
  });

  const bulkReplyMutation = useMutation({
    mutationFn: async ({ messageIds, replyContent }: { messageIds: string[]; replyContent: string }) => {
      // Get original messages
      const { data: originalMessages, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .in('id', messageIds);
      
      if (fetchError) throw fetchError;
      
      // Update original messages status
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'replied' })
        .in('id', messageIds);
      
      if (updateError) throw updateError;

      // Create reply messages
      const replyMessages = originalMessages!.map(original => ({
        user_id: original.user_id,
        platform: original.platform,
        thread_id: original.thread_id || original.id,
        contact_id: original.contact_id,
        sender_name: 'You',
        recipient_name: original.sender_name,
        recipient_email: original.sender_email,
        recipient_handle: original.sender_handle,
        subject: original.subject ? `Re: ${original.subject}` : undefined,
        body: replyContent,
        message_type: original.message_type,
        status: 'replied',
        priority: 'normal',
        attachments: [],
        metadata: { reply_to: original.id, bulk_reply: true }
      }));

      const { error: insertError } = await supabase
        .from('messages')
        .insert(replyMessages);
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Bulk reply sent successfully');
    },
    onError: () => {
      toast.error('Failed to send bulk reply');
    },
  });

  return {
    messages,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    archiveMessages: archiveMessagesMutation.mutate,
    flagMessages: flagMessagesMutation.mutate,
    replyToMessage: replyToMessageMutation.mutate,
    createMessage: createMessageMutation.mutate,
    assignWorkflow: assignWorkflowMutation.mutate,
    bulkReply: bulkReplyMutation.mutate,
  };
};