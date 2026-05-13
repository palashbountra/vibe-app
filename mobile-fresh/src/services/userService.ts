/**
 * User service — profile CRUD + photo management.
 * All calls go to Supabase. Mock data removed.
 */
import { supabase } from '@/lib/supabase';
import type { Prompt } from '@/store/authStore';

export interface UserProfile {
  id: string;
  displayName: string;
  username?: string;
  age?: number;
  gender?: string;
  pronouns?: string;
  bio?: string;
  avatarColor?: string;
  height?: string;
  job?: string;
  school?: string;
  location?: string;
  photos: string[];
  topArtists: string[];
  topGenres: string[];
  currentTrack: { title: string; artist: string; albumArt: string } | null;
  prompts?: Prompt[];
  profileComplete?: number;
  compatibilityScore?: number;
}

export const userService = {
  getMyProfile: async (): Promise<UserProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [profileRes, photosRes, promptsRes, artistsRes, genresRes, trackRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('photos').select('url').eq('user_id', user.id).order('order'),
      supabase.from('prompts').select('question, answer').eq('user_id', user.id).order('order'),
      supabase.from('top_artists').select('artist_name').eq('user_id', user.id).order('rank').limit(5),
      supabase.from('top_genres').select('genre').eq('user_id', user.id).order('rank').limit(5),
      supabase.from('current_tracks').select('*').eq('user_id', user.id).single(),
    ]);

    if (!profileRes.data) return null;
    const p = profileRes.data;

    return {
      id: p.id,
      displayName: p.display_name,
      username: p.username,
      age: p.age ?? undefined,
      gender: p.gender ?? undefined,
      pronouns: p.pronouns ?? undefined,
      bio: p.bio ?? undefined,
      avatarColor: p.avatar_color,
      height: p.height ?? undefined,
      job: p.job ?? undefined,
      school: p.school ?? undefined,
      location: p.location ?? undefined,
      photos: photosRes.data?.map(ph => ph.url) ?? [],
      prompts: promptsRes.data ?? [],
      topArtists: artistsRes.data?.map(a => a.artist_name) ?? [],
      topGenres: genresRes.data?.map(g => g.genre) ?? [],
      currentTrack: trackRes.data
        ? { title: trackRes.data.title, artist: trackRes.data.artist, albumArt: trackRes.data.album_art }
        : null,
      profileComplete: p.profile_complete,
    };
  },

  updateProfile: async (data: {
    displayName?: string;
    bio?: string;
    gender?: string;
    pronouns?: string;
    height?: string;
    job?: string;
    school?: string;
    location?: string;
    profileComplete?: number;
  }): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({
      display_name: data.displayName,
      bio: data.bio,
      gender: data.gender,
      pronouns: data.pronouns,
      height: data.height,
      job: data.job,
      school: data.school,
      location: data.location,
      profile_complete: data.profileComplete,
    }).eq('id', user.id);
  },

  savePrompts: async (prompts: Prompt[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete existing then re-insert
    await supabase.from('prompts').delete().eq('user_id', user.id);
    if (prompts.length === 0) return;

    await supabase.from('prompts').insert(
      prompts.map((p, i) => ({
        user_id: user.id,
        question: p.question,
        answer: p.answer,
        order: i,
      }))
    );
  },

  uploadPhoto: async (base64: string, index: number): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const path = `${user.id}/${index}_${Date.now()}.jpg`;

    // Decode base64 string (from ImagePicker's base64 option) to Uint8Array for upload.
    // This avoids the 0-byte bug from reading local file:// URIs in React Native.
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  },

  savePhotos: async (urls: string[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('photos').delete().eq('user_id', user.id);
    if (urls.length === 0) return;

    await supabase.from('photos').insert(
      urls.map((url, i) => ({ user_id: user.id, url, order: i }))
    );
  },

  deleteAccount: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete storage files
    const { data: storageFiles } = await supabase.storage
      .from('avatars')
      .list(user.id);
    if (storageFiles && storageFiles.length > 0) {
      await supabase.storage
        .from('avatars')
        .remove(storageFiles.map(f => `${user.id}/${f.name}`));
    }

    // Delete all user rows from tables (order matters: leaf tables first)
    await Promise.all([
      supabase.from('photos').delete().eq('user_id', user.id),
      supabase.from('prompts').delete().eq('user_id', user.id),
      supabase.from('top_artists').delete().eq('user_id', user.id),
      supabase.from('top_genres').delete().eq('user_id', user.id),
      supabase.from('current_tracks').delete().eq('user_id', user.id),
      supabase.from('music_connections').delete().eq('user_id', user.id),
    ]);
    await supabase.from('connections').delete()
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
    await supabase.from('profiles').delete().eq('id', user.id);

    // Sign out — auth account persists but profile is gone,
    // so next login routes back through onboarding
    await supabase.auth.signOut();
  },
};
