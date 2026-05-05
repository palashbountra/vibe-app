/**
 * Database types — mirrors the Supabase schema.
 * Regenerate with: npx supabase gen types typescript --project-id YOUR_ID > src/lib/database.types.ts
 *
 * IMPORTANT: supabase-js v2.x GenericTable requires a `Relationships` field on every table.
 * Without it TypeScript collapses every .from() return to `never`.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          age: number | null;
          gender: string | null;
          pronouns: string | null;
          bio: string | null;
          height: string | null;
          job: string | null;
          school: string | null;
          location: string | null;
          avatar_color: string;
          profile_complete: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          age?: number | null;
          gender?: string | null;
          pronouns?: string | null;
          bio?: string | null;
          height?: string | null;
          job?: string | null;
          school?: string | null;
          location?: string | null;
          avatar_color?: string;
          profile_complete?: number;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          age?: number | null;
          gender?: string | null;
          pronouns?: string | null;
          bio?: string | null;
          height?: string | null;
          job?: string | null;
          school?: string | null;
          location?: string | null;
          avatar_color?: string;
          profile_complete?: number;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          order: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          url: string;
          order: number;
        };
        Update: {
          user_id?: string;
          url?: string;
          order?: number;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          answer: string;
          order: number;
        };
        Insert: {
          user_id: string;
          question: string;
          answer: string;
          order: number;
        };
        Update: {
          user_id?: string;
          question?: string;
          answer?: string;
          order?: number;
        };
        Relationships: [];
      };
      music_connections: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          access_token: string | null;
          refresh_token: string | null;
          expires_at: string | null;
          connected_at: string;
        };
        Insert: {
          user_id: string;
          platform: string;
          access_token?: string | null;
          refresh_token?: string | null;
          expires_at?: string | null;
        };
        Update: {
          user_id?: string;
          platform?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      top_artists: {
        Row: {
          id: string;
          user_id: string;
          artist_name: string;
          artist_id: string | null;
          rank: number;
          platform: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          artist_name: string;
          artist_id?: string | null;
          rank: number;
          platform?: string;
        };
        Update: {
          user_id?: string;
          artist_name?: string;
          artist_id?: string | null;
          rank?: number;
          platform?: string;
        };
        Relationships: [];
      };
      top_genres: {
        Row: {
          id: string;
          user_id: string;
          genre: string;
          rank: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          genre: string;
          rank: number;
        };
        Update: {
          user_id?: string;
          genre?: string;
          rank?: number;
        };
        Relationships: [];
      };
      current_tracks: {
        Row: {
          user_id: string;
          title: string;
          artist: string;
          album_art: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          artist: string;
          album_art: string;
        };
        Update: {
          user_id?: string;
          title?: string;
          artist?: string;
          album_art?: string;
        };
        Relationships: [];
      };
      connections: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          status: 'pending' | 'accepted' | 'declined';
          compliment_prompt: string | null;
          compliment_message: string | null;
          created_at: string;
        };
        Insert: {
          requester_id: string;
          recipient_id: string;
          status?: string;
          compliment_prompt?: string | null;
          compliment_message?: string | null;
        };
        Update: {
          requester_id?: string;
          recipient_id?: string;
          status?: string;
          compliment_prompt?: string | null;
          compliment_message?: string | null;
        };
        Relationships: [];
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          genre: string | null;
          cover_color: string;
          member_count: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          genre?: string | null;
          cover_color?: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          genre?: string | null;
          cover_color?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      community_members: {
        Row: {
          community_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          community_id: string;
          user_id: string;
        };
        Update: {
          community_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          connection_id: string;
          sender_id: string;
          content: string;
        };
        Update: {
          connection_id?: string;
          sender_id?: string;
          content?: string;
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
