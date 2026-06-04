import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar: string;
          theme: string;
          job_class: string;
          title: string;
          level: number;
          total_xp: number;
          attributes: Record<string, number>;
          stat_points: number;
          fatigue: number;
          skills: Array<{ id: string; name: string; type: string; level: number }>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; username: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          xp_earned: number;
          note: string | null;
          manual: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sessions']['Row']> & {
          user_id: string;
          category: string;
          started_at: string;
        };
        Update: Partial<Database['public']['Tables']['sessions']['Row']>;
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string };
        Update: Partial<Database['public']['Tables']['follows']['Row']>;
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          category: string | null;
          duration: number | null;
          xp: number | null;
          level: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['activities']['Row']> & {
          user_id: string;
          type: string;
        };
        Update: Partial<Database['public']['Tables']['activities']['Row']>;
      };
      reactions: {
        Row: {
          id: string;
          activity_id: string;
          user_id: string;
          type: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reactions']['Row']> & {
          activity_id: string;
          user_id: string;
          type: string;
        };
        Update: Partial<Database['public']['Tables']['reactions']['Row']>;
      };
      guilds: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          banner_color: string;
          weekly_goal: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['guilds']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['guilds']['Row']>;
      };
      guild_members: {
        Row: {
          guild_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: { guild_id: string; user_id: string; role?: string };
        Update: Partial<Database['public']['Tables']['guild_members']['Row']>;
      };
      guild_messages: {
        Row: {
          id: string;
          guild_id: string;
          user_id: string;
          text: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['guild_messages']['Row']> & {
          guild_id: string;
          user_id: string;
          text: string;
        };
        Update: Partial<Database['public']['Tables']['guild_messages']['Row']>;
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          username: string;
          avatar: string;
          level: number;
          total_xp: number;
          coding_xp: number;
          study_xp: number;
          reading_xp: number;
          active_days: number;
        };
      };
    };
  };
};
