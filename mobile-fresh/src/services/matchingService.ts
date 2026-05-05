/**
 * Matching service — feed + swipe + match list.
 * Returns mock data until the matching Lambda + Aurora are deployed.
 */

import { api } from './apiClient';
import type { UserProfile } from './userService';

export type SwipeDirection = 'like' | 'pass';

export interface FeedCandidate extends UserProfile {
  compatibilityScore: number;
  compatibilityBreakdown: {
    genre: number;   // 0–1
    artist: number;  // 0–1
    audio: number;   // 0–1
  };
}

export interface Match {
  matchId: string;
  matchedAt: string; // ISO date
  user: UserProfile;
  lastMessage?: { text: string; sentAt: string };
  unreadCount: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_FEED: FeedCandidate[] = [
  {
    id: 'user-2',
    displayName: 'Aanya',
    age: 21,
    bio: 'Always got AirPods in 🎧',
    photoUrls: [],
    location: 'Delhi, IN',
    topArtists: ['Frank Ocean', 'SZA', 'Jhené Aiko'],
    topGenres: ['neo-soul', 'r&b', 'alternative'],
    currentTrack: { title: 'Saturn', artist: 'SZA', albumArt: '' },
    compatibilityScore: 91,
    compatibilityBreakdown: { genre: 0.94, artist: 0.88, audio: 0.91 },
  },
  {
    id: 'user-3',
    displayName: 'Rohan',
    age: 23,
    bio: 'Concert photographer by day',
    photoUrls: [],
    location: 'Bangalore, IN',
    topArtists: ['Tyler, the Creator', 'Earl Sweatshirt', 'Vince Staples'],
    topGenres: ['hip-hop', 'alternative rap', 'lo-fi'],
    currentTrack: { title: 'SORRY NOT SORRY', artist: 'Tyler, the Creator', albumArt: '' },
    compatibilityScore: 84,
    compatibilityBreakdown: { genre: 0.82, artist: 0.90, audio: 0.78 },
  },
];

const MOCK_MATCHES: Match[] = [
  {
    matchId: 'match-1',
    matchedAt: new Date(Date.now() - 86400000).toISOString(),
    user: MOCK_FEED[0],
    lastMessage: { text: 'omg you like Frank Ocean too??', sentAt: new Date().toISOString() },
    unreadCount: 1,
  },
];

export const matchingService = {
  getFeed: async (): Promise<FeedCandidate[]> => {
    // TODO: return (await api.get<FeedCandidate[]>('/matching/feed')).data ?? [];
    return MOCK_FEED;
  },

  swipe: async (targetUserId: string, direction: SwipeDirection): Promise<{ matched: boolean }> => {
    // TODO: return (await api.post('/matching/swipe', { targetUserId, direction })).data!;
    console.log(`[mock] swipe ${direction} on ${targetUserId}`);
    return { matched: direction === 'like' && Math.random() > 0.5 };
  },

  getMatches: async (): Promise<Match[]> => {
    // TODO: return (await api.get<Match[]>('/matching/matches')).data ?? [];
    return MOCK_MATCHES;
  },
};
