import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          id: string;
          artist_id: string;
          title: string;
          release_year: number;
          created_at: string;
          is_featured: boolean;
          popularity_score: number;
          cover_url: string;
        };
        Insert: Omit<Database['public']['Tables']['albums']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['albums']['Insert']>;
      };
      artists: {
        Row: {
          id: string;
          name: string;
          genre: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['artists']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['artists']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          album_id: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          album_id: string;
          text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
    };
  };
};