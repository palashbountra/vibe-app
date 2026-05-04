/**
 * User service — profile CRUD + photo upload.
 * Currently returns mock data; swap api.get() calls for real when backend is live.
 */

import { api } from './apiClient';

export interface UserProfile {
  id: string;
  displayName: string;
  age: number;
  bio: string;
  photoUrls: string[];
  location: string;
  topArtists: string[];
  topGenres: string[];
  currentTrack: { title: string; artist: string; albumArt: string } | null;
  compatibilityScore?: number; // only present when viewing another user's profile
}

// ── Mock data (used until backend is deployed) ────────────────────────────────
const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-1',
  displayName: 'Palash',
  age: 22,
  bio: 'Finding my frequency 🎵',
  photoUrls: [],
  location: 'Mumbai, IN',
  topArtists: ['Frank Ocean', 'Tyler, the Creator', 'BROCKHAMPTON'],
  topGenres: ['neo-soul', 'hip-hop', 'alternative r&b'],
  currentTrack: {
    title: 'Nights',
    artist: 'Frank Ocean',
    albumArt: 'https://placeholder.vibe.local/blonded.jpg',
  },
};

export const userService = {
  getMyProfile: async (): Promise<UserProfile> => {
    // TODO: swap to api.get<UserProfile>('/users/me') when backend is live
    return MOCK_PROFILE;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    // TODO: return (await api.put<UserProfile>('/users/me', data)).data!;
    return { ...MOCK_PROFILE, ...data };
  },

  uploadPhoto: async (_uri: string): Promise<string> => {
    // TODO: multipart upload to /users/me/photo, return CDN URL
    return 'https://placeholder.vibe.local/photo.jpg';
  },
};
