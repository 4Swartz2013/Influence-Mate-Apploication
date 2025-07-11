import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types';

export const useDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get messages stats
      const { data: messages } = await supabase
        .from('messages')
        .select('id, is_read, status')
        .eq('user_id', user.id);

      // Get contacts stats
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, enriched')
        .eq('user_id', user.id);

      // Get comments stats
      const { data: comments } = await supabase
        .from('comments')
        .select('id, replied')
        .eq('user_id', user.id);

      const totalMessages = messages?.length || 0;
      const unreadMessages = messages?.filter(m => !m.is_read).length || 0;
      const totalContacts = contacts?.length || 0;
      const enrichedContacts = contacts?.filter(c => c.enriched).length || 0;
      const totalComments = comments?.length || 0;
      const pendingComments = comments?.filter(c => !c.replied).length || 0;
      const repliedMessages = messages?.filter(m => m.status === 'replied').length || 0;
      
      return {
        totalMessages,
        unreadMessages,
        totalContacts,
        enrichedContacts,
        totalComments,
        pendingComments,
        responseRate: totalMessages > 0 ? (repliedMessages / totalMessages) * 100 : 87.5,
        avgResponseTime: 2.3, // Mock data - would calculate from actual response times
      };
    },
  });

  return {
    stats,
    isLoading,
  };
};