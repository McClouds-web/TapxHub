import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    // Only subscribe to Postgres changes when a user is authenticated
    if (!user) return;

    // Create a single channel for all our table subscriptions
    const channel = supabase.channel('tapxhub-realtime-global');

    // 1. Task Synchronization
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        console.log('[Realtime] Tasks updated', payload);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    );

    // 2. File / Vault Synchronization
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'files' },
      (payload) => {
        console.log('[Realtime] Files updated', payload);
        queryClient.invalidateQueries({ queryKey: ['files'] });
      }
    );

    // 3. Conversation & Message Synchronization
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      (payload) => {
        console.log('[Realtime] Messages updated', payload);
        
        // Invalidate the generic lists and counters
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['unread_messages'] });
        
        // Target the specific conversation cache for instant chat update
        const newRecord = payload.new as any;
        if (newRecord?.conversation_id) {
           queryClient.invalidateQueries({ queryKey: ['messages', newRecord.conversation_id] });
        }
      }
    );

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversations' },
      (payload) => {
        console.log('[Realtime] Conversations updated', payload);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    );

    // 4. CRM Synchronization (Companies, Bookings, Notifications)
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'companies' },
      (payload) => {
        console.log('[Realtime] Companies CRM updated', payload);
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
    );

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      (payload) => {
        console.log('[Realtime] Bookings updated', payload);
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    );
    
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notifications' },
      (payload) => {
        console.log('[Realtime] Notifications updated', payload);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    );

    // Start listening
    channel.subscribe((status) => {
      console.log(`[Realtime] Sync status: ${status}`);
    });

    // Cleanup logic when user logs out or app unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
};
