import { create } from 'zustand';

export interface Prompt {
  question: string;
  answer: string;
}

export interface User {
  id: string;
  displayName: string;
  email?: string;
  username?: string;
  avatarColor?: string;
  // detailed profile
  age?: number;
  gender?: string;
  pronouns?: string;
  bio?: string;
  height?: string;
  job?: string;
  school?: string;
  location?: string;
  photos?: string[];       // local URIs for now, CDN URLs after Sprint 3
  prompts?: Prompt[];      // up to 3 Q&A prompts
  profileComplete?: number; // 0-100 completion %
}

interface AuthState {
  isAuthenticated: boolean;
  isMusicConnected: boolean;
  user: User | null;
  accessToken: string | null;

  setAuthenticated: (value: boolean) => void;
  setMusicConnected: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  signOut: () => void;
}

export function calcProfileCompletion(user: User): number {
  let score = 0;
  // mandatory (45%)
  if (user.displayName) score += 10;
  if (user.age) score += 10;
  if (user.gender) score += 10;
  if (user.photos && user.photos.length >= 1) score += 15;
  // optional
  if (user.bio) score += 10;
  const promptCount = user.prompts?.filter(p => p.answer.trim()).length ?? 0;
  score += Math.min(promptCount, 3) * 5;
  if (user.photos && user.photos.length >= 3) score += 5;
  if (user.photos && user.photos.length >= 6) score += 5;
  if (user.job) score += 5;
  if (user.school) score += 5;
  if (user.height) score += 5;
  if (user.pronouns) score += 5;
  if (user.location) score += 5;
  return Math.min(score, 100);
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isMusicConnected: false,
  user: null,
  accessToken: null,

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setMusicConnected: (value) => set({ isMusicConnected: value }),
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  signOut: () => set({ isAuthenticated: false, isMusicConnected: false, user: null, accessToken: null }),
}));
