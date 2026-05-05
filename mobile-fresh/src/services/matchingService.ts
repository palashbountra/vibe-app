/**
 * Matching service — discover feed + connection actions.
 * Fetches real data from Supabase. Compatibility is computed client-side
 * until the recommendation model (Sprint 4) is ready.
 */
import { supabase } from '@/lib/supabase';
import type { UserProfile } from './userService';

export interface FeedCandidate extends UserProfile {
  compatibilityScore: number;
  compatibilityBreakdown: { genre: number; artist: number; audio: number };
}

export interface Connection {
  connectionId: string;
  connectedAt: string;
  user: UserProfile;
  lastMessage?: { text: string; sentAt: string };
  unreadCount: number;
}

/** Simple client-side compatibility: genre + artist overlap */
function computeScore(
  myGenres: string[],
  myArtists: string[],
  theirGenres: string[],
  theirArtists: string[]
): { score: number; breakdown: { genre: number; artist: number; audio: number } } {
  const genreSet = new Set(myGenres.map(g => g.toLowerCase()));
  const artistSet = new Set(myArtists.map(a => a.toLowerCase()));

  const genreOverlap = theirGenres.filter(g => genreSet.has(g.toLowerCase())).length;
  const artistOverlap = theirArtists.filter(a => artistSet.has(a.toLowerCase())).length;

  const genreScore = myGenres.length ? genreOverlap / Math.max(myGenres.length, theirGenres.length) : 0;
  const artistScore = myArtists.length ? artistOverlap / Math.max(myArtists.length, theirArtists.length) : 0;
  // audio features TBD — placeholder until recommendation model
  const audioScore = (genreScore + artistScore) / 2;

  const total = Math.round((genreScore * 0.5 + artistScore * 0.35 + audioScore * 0.15) * 100);
  return {
    score: Math.max(total, 10), // floor at 10 so no one shows 0%
    breakdown: {
      genre: Math.round(genreScore * 100) / 100,
      artist: Math.round(artistScore * 100) / 100,
      audio: Math.round(audioScore * 100) / 100,
    },
  };
}

export const matchingService = {
  getFeed: async (): Promise<FeedCandidate[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Load my own music taste for scoring
    const [myArtistsRes, myGenresRes] = await Promise.all([
      supabase.from('top_artists').select('artist_name').eq('user_id', user.id).order('rank').limit(10),
      supabase.from('top_genres').select('genre').eq('user_id', user.id).order('rank').limit(10),
    ]);
    const myArtists = myArtistsRes.data?.map(a => a.artist_name) ?? [];
    const myGenres = myGenresRes.data?.map(g => g.genre) ?? [];

    // Fetch other profiles (exclude self and already-connected)
    const { data: connectedRes } = await supabase
      .from('connections')
      .select('recipient_id, requester_id')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

    const connectedIds = new Set<string>([user.id]);
    connectedRes?.forEach(c => {
      connectedIds.add(c.requester_id);
      connectedIds.add(c.recipient_id);
    });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${[...connectedIds].join(',')})`);

    if (!profiles || profiles.length === 0) return [];

    // Batch-fetch related data for all profiles
    const ids = profiles.map(p => p.id);

    const [photosRes, artistsRes, genresRes, tracksRes, promptsRes] = await Promise.all([
      supabase.from('photos').select('user_id, url, "order"').in('user_id', ids).order('order'),
      supabase.from('top_artists').select('user_id, artist_name, rank').in('user_id', ids).order('rank'),
      supabase.from('top_genres').select('user_id, genre, rank').in('user_id', ids).order('rank'),
      supabase.from('current_tracks').select('*').in('user_id', ids),
      supabase.from('prompts').select('user_id, question, answer, "order"').in('user_id', ids).order('order'),
    ]);

    // Index by user_id
    const photosByUser: Record<string, string[]> = {};
    photosRes.data?.forEach(ph => {
      if (!photosByUser[ph.user_id]) photosByUser[ph.user_id] = [];
      photosByUser[ph.user_id].push(ph.url);
    });

    const artistsByUser: Record<string, string[]> = {};
    artistsRes.data?.forEach(a => {
      if (!artistsByUser[a.user_id]) artistsByUser[a.user_id] = [];
      artistsByUser[a.user_id].push(a.artist_name);
    });

    const genresByUser: Record<string, string[]> = {};
    genresRes.data?.forEach(g => {
      if (!genresByUser[g.user_id]) genresByUser[g.user_id] = [];
      genresByUser[g.user_id].push(g.genre);
    });

    const trackByUser: Record<string, { title: string; artist: string; albumArt: string }> = {};
    tracksRes.data?.forEach(t => {
      trackByUser[t.user_id] = { title: t.title, artist: t.artist, albumArt: t.album_art };
    });

    const promptsByUser: Record<string, { question: string; answer: string }[]> = {};
    promptsRes.data?.forEach(pr => {
      if (!promptsByUser[pr.user_id]) promptsByUser[pr.user_id] = [];
      promptsByUser[pr.user_id].push({ question: pr.question, answer: pr.answer });
    });

    const feed: FeedCandidate[] = profiles.map(p => {
      const theirArtists = artistsByUser[p.id] ?? [];
      const theirGenres = genresByUser[p.id] ?? [];
      const { score, breakdown } = computeScore(myGenres, myArtists, theirGenres, theirArtists);

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
        photos: photosByUser[p.id] ?? [],
        topArtists: theirArtists.slice(0, 5),
        topGenres: theirGenres.slice(0, 5),
        currentTrack: trackByUser[p.id] ?? null,
        prompts: promptsByUser[p.id] ?? [],
        profileComplete: p.profile_complete,
        compatibilityScore: score,
        compatibilityBreakdown: breakdown,
      };
    });

    // Sort by compatibility score descending
    return feed.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  },

  sendConnectionRequest: async (
    targetUserId: string,
    compliment?: { promptQuestion: string; message: string }
  ): Promise<{ sent: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { sent: false };

    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      recipient_id: targetUserId,
      compliment_prompt: compliment?.promptQuestion ?? null,
      compliment_message: compliment?.message ?? null,
    });

    return { sent: !error };
  },

  getConnections: async (): Promise<Connection[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: conns } = await supabase
      .from('connections')
      .select('*')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (!conns || conns.length === 0) return [];

    // For each connection, get the other person's profile + last message
    const results: (Connection | null)[] = await Promise.all(conns.map(async (conn) => {
      const otherId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;

      const [profileRes, photosRes, artistsRes, genresRes, trackRes, lastMsgRes, unreadRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', otherId).single(),
        supabase.from('photos').select('url').eq('user_id', otherId).order('order').limit(1),
        supabase.from('top_artists').select('artist_name').eq('user_id', otherId).order('rank').limit(3),
        supabase.from('top_genres').select('genre').eq('user_id', otherId).order('rank').limit(3),
        supabase.from('current_tracks').select('*').eq('user_id', otherId).single(),
        supabase.from('messages').select('content, created_at').eq('connection_id', conn.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('messages').select('id', { count: 'exact' }).eq('connection_id', conn.id).is('read_at', null).neq('sender_id', user.id),
      ]);

      const p = profileRes.data;
      if (!p) return null;

      return {
        connectionId: conn.id,
        connectedAt: conn.created_at,
        user: {
          id: p.id,
          displayName: p.display_name,
          username: p.username,
          avatarColor: p.avatar_color,
          photos: photosRes.data?.map(ph => ph.url) ?? [],
          topArtists: artistsRes.data?.map(a => a.artist_name) ?? [],
          topGenres: genresRes.data?.map(g => g.genre) ?? [],
          currentTrack: trackRes.data
            ? { title: trackRes.data.title, artist: trackRes.data.artist, albumArt: trackRes.data.album_art }
            : null,
          profileComplete: p.profile_complete,
        } as UserProfile,
        lastMessage: lastMsgRes.data?.[0]
          ? { text: lastMsgRes.data[0].content, sentAt: lastMsgRes.data[0].created_at }
          : undefined,
        unreadCount: unreadRes.count ?? 0,
      };
    }));

    return results.filter((r): r is Connection => r !== null);
  },

  respondToRequest: async (connectionId: string, accept: boolean): Promise<void> => {
    await supabase
      .from('connections')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', connectionId);
  },

  getPendingRequests: async (): Promise<Connection[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: pending } = await supabase
      .from('connections')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!pending || pending.length === 0) return [];

    const results: (Connection | null)[] = await Promise.all(pending.map(async (conn) => {
      const profileRes = await supabase.from('profiles').select('*').eq('id', conn.requester_id).single();
      const p = profileRes.data;
      if (!p) return null;

      return {
        connectionId: conn.id,
        connectedAt: conn.created_at,
        user: {
          id: p.id,
          displayName: p.display_name,
          username: p.username,
          avatarColor: p.avatar_color,
          photos: [],
          topArtists: [],
          topGenres: [],
          currentTrack: null,
          profileComplete: p.profile_complete,
        } as UserProfile,
        unreadCount: 0,
      };
    }));

    return results.filter((r): r is Connection => r !== null);
  },
};

// Keep MOCK_FEED exported so existing screens don't break during transition
export const MOCK_FEED: FeedCandidate[] = [];
export const MOCK_CONNECTIONS: Connection[] = [];
