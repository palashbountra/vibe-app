/**
 * Music service — Spotify / Apple Music OAuth + now playing.
 * OAuth flows handled via expo-auth-session in the onboarding screen.
 * This service manages token storage and API calls post-auth.
 */

export interface NowPlaying {
  title: string;
  artist: string;
  albumArt: string;
  platform: 'spotify' | 'apple_music' | 'youtube_music';
  previewUrl?: string;
}

export interface MusicProfile {
  platform: 'spotify' | 'apple_music' | 'youtube_music';
  topArtists: string[];
  topGenres: string[];
  audioFeatures: {
    avgTempo: number;
    avgEnergy: number;
    avgValence: number;
    avgDanceability: number;
  };
}

export const musicService = {
  /**
   * Trigger a server-side sync — pulls listening data from music platform
   * and stores it in Aurora for the matching algorithm.
   */
  syncProfile: async (): Promise<void> => {
    // TODO: await api.post('/music/sync', {});
    console.log('[mock] music sync (no-op)');
  },

  getNowPlaying: async (): Promise<NowPlaying | null> => {
    // TODO: return (await api.get<NowPlaying>('/music/now-playing')).data;
    return {
      title: 'Nights',
      artist: 'Frank Ocean',
      albumArt: 'https://placeholder.vibe.local/blonded.jpg',
      platform: 'spotify',
    };
  },
};
