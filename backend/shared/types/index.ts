// Vibe — Shared Types
// Keep in sync with mobile/src/types/index.ts

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { data, error: null, meta };
}

export function err(message: string): ApiResponse<null> {
  return { data: null, error: message };
}

export type Gender = 'man' | 'woman' | 'nonbinary' | 'other';
export type MusicPlatform = 'spotify' | 'apple_music' | 'youtube';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string;
  bio: string | null;
  gender: Gender;
  genderPreference: Gender[];
  locationCity: string | null;
  locationLat: number | null;
  locationLng: number | null;
  profilePhotos: string[];
  isProfileComplete: boolean;
  isPaused: boolean;
  minAgePreference: number;
  maxAgePreference: number;
  distanceRadiusKm: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  platform: MusicPlatform;
  imageUrl: string | null;
  genres: string[];
}

export interface GenreWeight {
  genre: string;
  weight: number;
}

export interface AudioFeatures {
  avgEnergy: number;
  avgValence: number;
  avgDanceability: number;
  avgTempo: number;
  avgAcousticness: number;
}

export interface NowPlaying {
  trackName: string;
  artistName: string;
  albumArtUrl: string | null;
  platform: MusicPlatform;
  isPlaying: boolean;
  updatedAt: string;
}

export interface MusicProfile {
  userId: string;
  spotifyConnected: boolean;
  appleMusicConnected: boolean;
  youtubeConnected: boolean;
  primaryPlatform: MusicPlatform;
  topArtists: Artist[];
  topGenres: GenreWeight[];
  audioFeatures: AudioFeatures | null;
  lastSyncedAt: string | null;
  nowPlaying: NowPlaying | null;
}

export interface Match {
  id: string;
  userA: string;
  userB: string;
  compatibilityScore: number;
  sharedArtists: Artist[];
  sharedGenres: string[];
  createdAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface FeedCandidate {
  user: Pick<User, 'id' | 'name' | 'dateOfBirth' | 'locationCity' | 'profilePhotos' | 'bio'>;
  musicProfile: Pick<MusicProfile, 'topArtists' | 'topGenres' | 'primaryPlatform' | 'nowPlaying'>;
  compatibilityScore: number;
  sharedArtists: Artist[];
  sharedGenres: string[];
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  reactions: { userId: string; emoji: string }[];
  createdAt: string;
  updatedAt: string;
}

export type WsEventType = 'message' | 'typing' | 'read' | 'match' | 'nowPlaying' | 'presence';

export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
}
