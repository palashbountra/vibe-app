/**
 * Chat service — message history + Supabase Realtime delivery.
 * All calls go to Supabase. Realtime channel replaces WebSocket mock.
 */
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  sentAt: string;
  readAt: string | null;
}

export const chatService = {
  /** Fetch message history for a connection (most recent first, then caller reverses) */
  getMessages: async (connectionId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, connection_id, sender_id, content, created_at, read_at')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map(m => ({
      id: m.id,
      connectionId: m.connection_id,
      senderId: m.sender_id,
      text: m.content,
      sentAt: m.created_at,
      readAt: m.read_at,
    }));
  },

  /** Send a message in a connection thread */
  sendMessage: async (connectionId: string, text: string): Promise<Message | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        connection_id: connectionId,
        sender_id: user.id,
        content: text.trim(),
      })
      .select('id, connection_id, sender_id, content, created_at, read_at')
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      connectionId: data.connection_id,
      senderId: data.sender_id,
      text: data.content,
      sentAt: data.created_at,
      readAt: data.read_at,
    };
  },

  /** Mark all unread messages in a connection as read */
  markAsRead: async (connectionId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('connection_id', connectionId)
      .neq('sender_id', user.id)
      .is('read_at', null);
  },

  /**
   * Subscribe to new messages in a connection via Supabase Realtime.
   * Returns an unsubscribe function — call it on component unmount.
   */
  subscribeToConnection: (
    connectionId: string,
    onMessage: (msg: Message) => void,
  ): (() => void) => {
    const channel: RealtimeChannel = supabase
      .channel(`messages:${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            connection_id: string;
            sender_id: string;
            content: string;
            created_at: string;
            read_at: string | null;
          };
          onMessage({
            id: row.id,
            connectionId: row.connection_id,
            senderId: row.sender_id,
            text: row.content,
            sentAt: row.created_at,
            readAt: row.read_at,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Subscribe to read-receipt updates in a connection.
   * Fires when a message's read_at transitions from null → timestamp.
   */
  subscribeToReadReceipts: (
    connectionId: string,
    onUpdated: (messageId: string, readAt: string) => void,
  ): (() => void) => {
    const channel: RealtimeChannel = supabase
      .channel(`read_receipts:${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; read_at: string | null };
          if (row.read_at) {
            onUpdated(row.id, row.read_at);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
