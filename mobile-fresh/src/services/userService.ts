/**
 * User service — profile CRUD + photo upload.
 * Swap api calls for real endpoints when Supabase is live.
 */
import { api } from './apiClient';
import type { Prompt } from '@/store/authStore';

export interface UserProfile {
  id: string;
  displayName: string;
  username?: string;
  age: number;
  gender?: string;
  pronouns?: string;
  bio: string;
  avatarColor?: string;
  height?: string;
  job?: string;
  school?: string;
  photos: string[];
  location: string;
  topArtists: string[];
  topGenres: string[];
  currentTrack: { title: string; artist: string; albumArt: string } | null;
  prompts?: Prompt[];
  profileComplete?: number;
  compatibilityScore?: number;
}

const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-1',
  displayName: 'Palash',
  username: 'palash.wav',
  age: 22,
  gender: 'Man',
  pronouns: 'he/him',
  bio: 'Finding my frequency',
  avatarColor: '#8B5CF6',
  height: "5'10\"",
  job: 'Student',
  school: 'BITS Pilani',
  photos: [],
  location: 'Pilani, IN',
  topArtists: ['Frank Ocean', 'Tyler, the Creator', 'BROCKHAMPTON'],
  topGenres: ['neo-soul', 'hip-hop', 'alternative r&b'],
  currentTrack: { title: 'Nights', artist: 'Frank Ocean', albumArt: '' },
  prompts: [
    { question: 'The song that changed my life...', answer: 'Nights by Frank Ocean. That beat switch.' },
    { question: 'My unpopular music take is...', answer: 'Channel Orange > Blonde. There, I said it.' },
  ],
  profileComplete: 78,
};

export const userService = {
  getMyProfile: async (): Promise<UserProfile> => {
    // TODO: return (await api.get<UserProfile>('/users/me')).data!;
    return MOCK_PROFILE;
  },
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    // TODO: return (await api.put<UserProfile>('/users/me', data)).data!;
    return { ...MOCK_PROFILE, ...data };
  },
  uploadPhoto: async (_uri: string): Promise<string> => {
    // TODO: multipart upload to /users/me/photo -> CDN URL
    return _uri; // return local URI for now
  },
};
