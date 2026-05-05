/**
 * Chat service — message history + WebSocket real-time delivery.
 * Mock returns static messages; real impl connects to API Gateway WebSocket.
 */

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  sentAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

// ── Mock ─────────────────────────────────────────────────────────────────────
const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    matchId: 'match-1',
    senderId: 'user-2',
    text: 'omg you like Frank Ocean too??',
    sentAt: new Date(Date.now() - 60000).toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-2',
    matchId: 'match-1',
    senderId: 'mock-user-1',
    text: 'Blonde is genuinely top 3 albums ever made',
    sentAt: new Date(Date.now() - 30000).toISOString(),
    status: 'read',
  },
];

export const chatService = {
  getMessages: async (matchId: string): Promise<Message[]> => {
    // TODO: return (await api.get<Message[]>(`/chat/${matchId}/messages`)).data ?? [];
    return MOCK_MESSAGES.filter(m => m.matchId === matchId);
  },

  /**
   * Connect to the WebSocket for real-time messages.
   * Returns an unsubscribe function.
   */
  subscribeToMatch: (
    _matchId: string,
    _onMessage: (msg: Message) => void,
  ): (() => void) => {
    // TODO: connect to WS API URL from config
    // const ws = new WebSocket(`${WS_URL}?matchId=${matchId}&token=${token}`);
    // ws.onmessage = (e) => onMessage(JSON.parse(e.data));
    // return () => ws.close();
    console.log('[mock] WebSocket subscription (no-op in mock mode)');
    return () => {};
  },
};
