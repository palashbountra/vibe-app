import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  age?: number;
  gender?: string;
  pronouns?: string;
  bio?: string;
  height?: string;
  job?: string;
  school?: string;
  location?: string;
  photos?: string[];
  prompts?: Prompt[];
  profileComplete?: number;
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
  signOut: () => Promise<void>;
  initSession: () => Promise<void>;
}

export function calcProfileCompletion(user: User): number {
  let score = 0;
  if (user.displayName) score += 10;
  if (user.age) score += 10;
  if (user.gender) score += 10;
  if (user.photos && user.photos.length >= 1) score += 15;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isMusicConnected: false,
  user: null,
  accessToken: null,

  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setMusicConnected: (value) => set({ isMusicConnected: value }),
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, isMusicConnected: false, user: null, accessToken: null });
  },

  /**
   * Called once on app boot — restores session from AsyncStorage and
   * loads the user's profile from Supabase if a session exists.
   */
  initSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      // Authenticated but no profile yet — just mark as authenticated
      set({ isAuthenticated: true, accessToken: session.access_token });
      return;
    }

    // Load photos
    const { data: photos } = await supabase
      .from('photos')
      .select('url')
      .eq('user_id', session.user.id)
      .order('order');

    // Load prompts
    const { data: prompts } = await supabase
      .from('prompts')
      .select('question, answer')
      .eq('user_id', session.user.id)
      .order('order');

    // Check music connection
    const { data: musicConn } = await supabase
      .from('music_connections')
      .select('platform')
      .eq('user_id', session.user.id)
      .limit(1);

    const user: User = {
      id: profile.id,
      displayName: profile.display_name,
      username: profile.username,
      avatarColor: profile.avatar_color,
      age: profile.age ?? undefined,
      gender: profile.gender ?? undefined,
      pronouns: profile.pronouns ?? undefined,
      bio: profile.bio ?? undefined,
      height: profile.height ?? undefined,
      job: profile.job ?? undefined,
      school: profile.school ?? undefined,
      location: profile.location ?? undefined,
      photos: photos?.map(p => p.url) ?? [],
      prompts: prompts ?? [],
      profileComplete: profile.profile_complete,
    };

    set({
      isAuthenticated: true,
      accessToken: session.access_token,
      isMusicConnected: (musicConn?.length ?? 0) > 0,
      user,
    });
  },
}));

// Keep session in sync when Supabase auth state changes (token refresh, sign out)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ isAuthenticated: false, isMusicConnected: false, user: null, accessToken: null });
  } else if (session) {
    useAuthStore.setState({ isAuthenticated: true, accessToken: session.access_token });
  }
});
