/**
 * Matching service — discover feed + connection actions.
 * Returns mock data until the matching Lambda + Aurora are deployed.
 */

import { api } from './apiClient';
import type { UserProfile } from './userService';

export interface FeedCandidate extends UserProfile {
  compatibilityScore: number;
  compatibilityBreakdown: {
    genre: number;
    artist: number;
    audio: number;
  };
}

export interface Connection {
  connectionId: string;
  connectedAt: string;
  user: UserProfile;
  lastMessage?: { text: string; sentAt: string };
  unreadCount: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────
export const MOCK_FEED: FeedCandidate[] = [
  {
    id: 'user-2',
    displayName: 'Aanya',
    username: 'aanya.wav',
    age: 21,
    bio: 'Always got AirPods in 🎧',
    avatarColor: '#EC4899',
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
    username: 'rohanbeats',
    age: 23,
    bio: 'Concert photographer by day 📸',
    avatarColor: '#3B82F6',
    photoUrls: [],
    location: 'Bangalore, IN',
    topArtists: ['Tyler, the Creator', 'Earl Sweatshirt', 'Vince Staples'],
    topGenres: ['hip-hop', 'alternative rap', 'lo-fi'],
    currentTrack: { title: 'SORRY NOT SORRY', artist: 'Tyler, the Creator', albumArt: '' },
    compatibilityScore: 84,
    compatibilityBreakdown: { genre: 0.82, artist: 0.90, audio: 0.78 },
  },
  {
    id: 'user-4',
    displayName: 'Priya',
    username: 'priya.keys',
    age: 22,
    bio: 'Jazz piano student, indie everything else',
    avatarColor: '#F59E0B',
    photoUrls: [],
    location: 'Mumbai, IN',
    topArtists: ['Norah Jones', 'Bon Iver', 'Phoebe Bridgers'],
    topGenres: ['jazz', 'indie folk', 'ambient'],
    currentTrack: { title: 'Holocene', artist: 'Bon Iver', albumArt: '' },
    compatibilityScore: 78,
    compatibilityBreakdown: { genre: 0.72, artist: 0.80, audio: 0.82 },
  },
  {
    id: 'user-5',
    displayName: 'Arjun',
    username: 'arjun.hz',
    age: 24,
    bio: 'Electronic music producer 🎛️',
    avatarColor: '#10B981',
    photoUrls: [],
    location: 'Pune, IN',
    topArtists: ['Four Tet', 'Jon Hopkins', 'Floating Points'],
    topGenres: ['electronic', 'ambient', 'techno'],
    currentTrack: { title: 'Cascade', artist: 'Four Tet', albumArt: '' },
    compatibilityScore: 73,
    compatibilityBreakdown: { genre: 0.70, artist: 0.75, audio: 0.74 },
  },
  {
    id: 'user-6',
    displayName: 'Meera',
    username: 'meeravibes',
    age: 20,
    bio: 'finding new music every day 🌙',
    avatarColor: '#8B5CF6',
    photoUrls: [],
    location: 'Chennai, IN',
    topArtists: ['Childish Gambino', 'Kali Uchis', 'Daniel Caesar'],
    topGenres: ['r&b', 'funk', 'soul'],
    currentTrack: { title: 'Telegraphe', artist: 'Kali Uchis', albumArt: '' },
    compatibilityScore: 68,
    compatibilityBreakdown: { genre: 0.65, artist: 0.72, audio: 0.67 },
  },
  {
    id: 'user-7',
    displayName: 'Kabir',
    username: 'kabir.loud',
    age: 25,
    bio: 'Bassist. Loud music, quiet person.',
    avatarColor: '#EF4444',
    photoUrls: [],
    location: 'Hyderabad, IN',
    topArtists: ['Arctic Monkeys', 'The Strokes', 'Radiohead'],
    topGenres: ['indie rock', 'alternative', 'post-punk'],
    currentTrack: { title: 'R U Mine?', artist: 'Arctic Monkeys', albumArt: '' },
    compatibilityScore: 62,
    compatibilityBreakdown: { genre: 0.60, artist: 0.65, audio: 0.61 },
  },
];

export const MOCK_CONNECTIONS: Connection[] = [
  {
    connectionId: 'conn-1',
    connectedAt: new Date(Date.now() - 86400000).toISOString(),
    user: MOCK_FEED[0],
    lastMessage: { text: 'omg you like Frank Ocean too??', sentAt: new Date(Date.now() - 3600000).toISOString() },
    unreadCount: 1,
  },
  {
    connectionId: 'conn-2',
    connectedAt: new Date(Date.now() - 172800000).toISOString(),
    user: MOCK_FEED[1],
    lastMessage: { text: 'have you heard the new Tyler album?', sentAt: new Date(Date.now() - 7200000).toISOString() },
    unreadCount: 0,
  },
];

export const matchingService = {
  getFeed: async (): Promise<FeedCandidate[]> => {
    // TODO: return (await api.get<FeedCandidate[]>('/matching/feed')).data ?? [];
    return MOCK_FEED;
  },

  sendConnectionRequest: async (targetUserId: string): Promise<{ sent: boolean }> => {
    // TODO: return (await api.post('/connections/request', { targetUserId })).data!;
    console.log(`[mock] connection request sent to ${targetUserId}`);
    return { sent: true };
  },

  getConnections: async (): Promise<Connection[]> => {
    // TODO: return (await api.get<Connection[]>('/connections')).data ?? [];
    return MOCK_CONNECTIONS;
  },
};
