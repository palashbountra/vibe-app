import { create } from 'zustand';

interface User {
  id: string;
  displayName: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isMusicConnected: boolean;
  user: User | null;
  accessToken: string | null;       // Cognito JWT — attached to every API request

  setAuthenticated: (value: boolean) => void;
  setMusicConnected: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  signOut: () => void;
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

  signOut: () =>
    set({
      isAuthenticated: false,
      isMusicConnected: false,
      user: null,
      accessToken: null,
    }),
}));
