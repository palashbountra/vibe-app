-- ============================================================
-- Vibe — Initial Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── Profiles ──────────────────────────────────────────────
create table profiles (
  id            uuid references auth.users on delete cascade primary key,
  username      text unique not null,
  display_name  text not null,
  age           integer,
  gender        text,
  pronouns      text,
  bio           text,
  height        text,
  job           text,
  school        text,
  location      text,
  avatar_color  text not null default '#8B5CF6',
  profile_complete integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ── Photos ────────────────────────────────────────────────
create table photos (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  url        text not null,
  "order"    integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Prompts ───────────────────────────────────────────────
create table prompts (
  id       uuid default uuid_generate_v4() primary key,
  user_id  uuid references profiles(id) on delete cascade not null,
  question text not null,
  answer   text not null,
  "order"  integer not null default 0
);

-- ── Music Connections (Spotify / Apple Music tokens) ──────
create table music_connections (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references profiles(id) on delete cascade not null,
  platform      text not null,
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  connected_at  timestamptz not null default now(),
  unique(user_id, platform)
);

-- ── Top Artists ───────────────────────────────────────────
create table top_artists (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  artist_name text not null,
  artist_id   text,
  rank        integer not null,
  platform    text not null default 'spotify',
  updated_at  timestamptz not null default now()
);

-- ── Top Genres ────────────────────────────────────────────
create table top_genres (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references profiles(id) on delete cascade not null,
  genre      text not null,
  rank       integer not null,
  updated_at timestamptz not null default now()
);

-- ── Current Track (Now Playing) ───────────────────────────
create table current_tracks (
  user_id    uuid references profiles(id) on delete cascade primary key,
  title      text not null,
  artist     text not null,
  album_art  text not null default '',
  updated_at timestamptz not null default now()
);

-- ── Connections (follow requests) ─────────────────────────
create table connections (
  id                uuid default uuid_generate_v4() primary key,
  requester_id      uuid references profiles(id) on delete cascade not null,
  recipient_id      uuid references profiles(id) on delete cascade not null,
  status            text not null default 'pending',
  compliment_prompt text,
  compliment_message text,
  created_at        timestamptz not null default now(),
  unique(requester_id, recipient_id)
);

-- ── Communities ───────────────────────────────────────────
create table communities (
  id           uuid default uuid_generate_v4() primary key,
  name         text not null,
  description  text,
  genre        text,
  cover_color  text not null default '#8B5CF6',
  member_count integer not null default 0,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now()
);

-- ── Community Members ─────────────────────────────────────
create table community_members (
  community_id uuid references communities(id) on delete cascade,
  user_id      uuid references profiles(id) on delete cascade,
  joined_at    timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ── Messages ──────────────────────────────────────────────
create table messages (
  id            uuid default uuid_generate_v4() primary key,
  connection_id uuid references connections(id) on delete cascade not null,
  sender_id     uuid references profiles(id) on delete cascade not null,
  content       text not null,
  created_at    timestamptz not null default now(),
  read_at       timestamptz
);

-- ── Row Level Security ────────────────────────────────────
alter table profiles          enable row level security;
alter table photos            enable row level security;
alter table prompts           enable row level security;
alter table music_connections enable row level security;
alter table top_artists       enable row level security;
alter table top_genres        enable row level security;
alter table current_tracks    enable row level security;
alter table connections       enable row level security;
alter table communities       enable row level security;
alter table community_members enable row level security;
alter table messages          enable row level security;

-- Profiles
create policy "profiles_select_all"  on profiles for select using (true);
create policy "profiles_insert_own"  on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"  on profiles for update using (auth.uid() = id);

-- Photos
create policy "photos_select_all"    on photos for select using (true);
create policy "photos_all_own"       on photos for all using (auth.uid() = user_id);

-- Prompts
create policy "prompts_select_all"   on prompts for select using (true);
create policy "prompts_all_own"      on prompts for all using (auth.uid() = user_id);

-- Music connections (private)
create policy "music_conn_own"       on music_connections for all using (auth.uid() = user_id);

-- Top artists
create policy "artists_select_all"   on top_artists for select using (true);
create policy "artists_all_own"      on top_artists for all using (auth.uid() = user_id);

-- Top genres
create policy "genres_select_all"    on top_genres for select using (true);
create policy "genres_all_own"       on top_genres for all using (auth.uid() = user_id);

-- Current tracks
create policy "tracks_select_all"    on current_tracks for select using (true);
create policy "tracks_all_own"       on current_tracks for all using (auth.uid() = user_id);

-- Connections
create policy "connections_select_parties" on connections for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);
create policy "connections_insert_own" on connections for insert
  with check (auth.uid() = requester_id);
create policy "connections_update_recipient" on connections for update
  using (auth.uid() = recipient_id or auth.uid() = requester_id);

-- Communities
create policy "communities_select_all"  on communities for select using (true);
create policy "communities_insert_auth" on communities for insert
  with check (auth.uid() = created_by);
create policy "communities_update_owner" on communities for update
  using (auth.uid() = created_by);

-- Community members
create policy "cm_select_all"  on community_members for select using (true);
create policy "cm_all_own"     on community_members for all using (auth.uid() = user_id);

-- Messages
create policy "messages_select_parties" on messages for select
  using (
    exists (
      select 1 from connections c
      where c.id = connection_id
      and (c.requester_id = auth.uid() or c.recipient_id = auth.uid())
    )
  );
create policy "messages_insert_parties" on messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from connections c
      where c.id = connection_id
      and (c.requester_id = auth.uid() or c.recipient_id = auth.uid())
      and c.status = 'accepted'
    )
  );

-- ── Realtime ──────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table connections;
alter publication supabase_realtime add table current_tracks;

-- ── Storage bucket for profile photos ────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "avatars_select_all" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars_insert_auth" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "avatars_update_own" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_delete_own" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
