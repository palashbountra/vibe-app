/**
 * Spotify service — PKCE OAuth token exchange + data ingestion.
 * OAuth dance (useAuthRequest hook) lives in connect-music.tsx.
 * This file handles token exchange, API calls, and DB writes.
 */
import { supabase } from '@/lib/supabase';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!;
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
}

// ── Token exchange ─────────────────────────────────────────────────────────────

/**
 * Exchange an authorization code for access + refresh tokens (PKCE).
 * No client_secret needed — only client_id + code_verifier.
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<SpotifyTokens> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token exchange failed: ${err}`);
  }

  const json = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
}

// ── API helpers ────────────────────────────────────────────────────────────────

async function apiGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Data fetching ──────────────────────────────────────────────────────────────

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
}

interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  item: SpotifyTrack | null;
}

export async function fetchTopArtists(accessToken: string, limit = 10): Promise<SpotifyArtist[]> {
  const data = await apiGet<{ items: SpotifyArtist[] }>(
    `/me/top/artists?limit=${limit}&time_range=medium_term`,
    accessToken,
  );
  return data.items ?? [];
}

export async function fetchTopTracks(accessToken: string, limit = 10): Promise<SpotifyTrack[]> {
  const data = await apiGet<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?limit=${limit}&time_range=medium_term`,
    accessToken,
  );
  return data.items ?? [];
}

export async function fetchCurrentlyPlaying(accessToken: string): Promise<SpotifyCurrentlyPlaying | null> {
  try {
    const data = await apiGet<SpotifyCurrentlyPlaying>(
      '/me/player/currently-playing',
      accessToken,
    );
    return data;
  } catch {
    return null; // 204 No Content when nothing is playing
  }
}

// ── DB writes ──────────────────────────────────────────────────────────────────

/**
 * Full ingestion pipeline:
 * 1. Fetch top artists + tracks from Spotify
 * 2. Derive top genres from artists
 * 3. Fetch currently playing track
 * 4. Write everything to Supabase
 * 5. Save connection record (platform + refresh token)
 */
export async function ingestSpotifyData(tokens: SpotifyTokens): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { accessToken, refreshToken, expiresAt } = tokens;

  // Fetch data in parallel
  const [artists, tracks, nowPlaying] = await Promise.all([
    fetchTopArtists(accessToken, 10),
    fetchTopTracks(accessToken, 10),
    fetchCurrentlyPlaying(accessToken),
  ]);

  // Derive genres: flatten from top artists, deduplicate, cap at 10
  const genreMap = new Map<string, number>();
  artists.forEach((artist, rank) => {
    artist.genres.forEach((genre) => {
      const weight = 10 - rank; // higher-ranked artists count more
      genreMap.set(genre, (genreMap.get(genre) ?? 0) + weight);
    });
  });
  const topGenres = [...genreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre]) => genre);

  // Write to Supabase in sequence (tables depend on prior clears)
  await Promise.all([
    // Top artists
    (async () => {
      await supabase.from('top_artists').delete().eq('user_id', user.id);
      if (artists.length > 0) {
        await supabase.from('top_artists').insert(
          artists.map((a, rank) => ({
            user_id: user.id,
            artist_name: a.name,
            artist_id: a.id,
            rank,
            platform: 'spotify',
          }))
        );
      }
    })(),

    // Top genres
    (async () => {
      await supabase.from('top_genres').delete().eq('user_id', user.id);
      if (topGenres.length > 0) {
        await supabase.from('top_genres').insert(
          topGenres.map((genre, rank) => ({
            user_id: user.id,
            genre,
            rank,
          }))
        );
      }
    })(),

    // Save music connection record (upsert on platform)
    supabase.from('music_connections').upsert({
      user_id: user.id,
      platform: 'spotify',
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(expiresAt).toISOString(),
    }, { onConflict: 'user_id,platform' }),
  ]);

  // Currently playing (upsert)
  if (nowPlaying?.is_playing && nowPlaying.item) {
    const track = nowPlaying.item;
    await supabase.from('current_tracks').upsert({
      user_id: user.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album_art: track.album.images[0]?.url ?? '',
    }, { onConflict: 'user_id' });
  }
}
