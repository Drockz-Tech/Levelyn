import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface GuildMember {
  id: string;
  username: string;
  avatar: string;
  level: number;
  weeklyContribution: number;
}

export interface GuildChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  avatar: string;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  members: GuildMember[];
  weeklyGoal: number; // XP target
  guildXp: number;
  chatMessages: GuildChatMessage[];
  bannerColor: string;
}

interface GuildsState {
  guildsList: Guild[];
  joinedGuildId: string | null;
  loading: boolean;
  
  // Actions
  fetchGuilds: () => Promise<void>;
  checkMyGuildMembership: (userId: string) => Promise<void>;
  joinGuild: (guildId: string, userId: string) => Promise<void>;
  leaveGuild: (guildId: string, userId: string) => Promise<void>;
  fetchRosterAndContributions: (guildId: string) => Promise<void>;
  sendChatMessage: (guildId: string, userId: string, text: string) => Promise<void>;
  fetchChatMessages: (guildId: string) => Promise<void>;
  subscribeToGuildMessages: (guildId: string) => () => void;
  resetGuilds: () => void;
}

function mapAvatarToEmoji(avatar: string): string {
  const mapping: Record<string, string> = {
    astronaut: '🧑‍🚀',
    rocket: '🚀',
    cypher: '🕵️',
    phoenix: '🔥',
    '🔥': '🔥',
    '⚔️': '⚔️',
    '🛡️': '🛡️',
    '🦁': '🦁',
    '🦅': '🦅',
    '✨': '✨'
  };
  return mapping[avatar] || '🧑‍🚀';
}

export const useGuildsStore = create<GuildsState>()(
  persist(
    (set, get) => ({
      guildsList: [],
      joinedGuildId: null,
      loading: false,

      fetchGuilds: async () => {
        set({ loading: true });
        try {
          const { data: remoteGuilds, error } = await supabase
            .from('guilds')
            .select('*');

          if (error) throw error;
          if (remoteGuilds) {
            const mapped: Guild[] = remoteGuilds.map((g: any) => ({
              id: g.id,
              name: g.name,
              description: g.description || '',
              bannerColor: g.banner_color || '#00F0FF',
              weeklyGoal: g.weekly_goal || 1000,
              guildXp: 0,
              members: [],
              chatMessages: []
            }));

            // Preserve local member lists if already fetched, or set empty
            const existingList = get().guildsList;
            const finalized = mapped.map((newG) => {
              const match = existingList.find((ex) => ex.id === newG.id);
              return match ? { ...newG, members: match.members, chatMessages: match.chatMessages, guildXp: match.guildXp } : newG;
            });

            set({ guildsList: finalized });
          }
        } catch (e) {
          console.error('[GuildsStore] fetchGuilds failed:', e);
        } finally {
          set({ loading: false });
        }
      },

      checkMyGuildMembership: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('guild_members')
            .select('guild_id')
            .eq('user_id', userId)
            .maybeSingle();

          if (error) throw error;
          set({ joinedGuildId: data ? data.guild_id : null });
        } catch (e) {
          console.error('[GuildsStore] checkMyGuildMembership failed:', e);
        }
      },

      joinGuild: async (guildId, userId) => {
        try {
          const { error } = await supabase
            .from('guild_members')
            .insert({ guild_id: guildId, user_id: userId, role: 'member' });

          if (error) throw error;
          set({ joinedGuildId: guildId });
          
          // Refresh details
          await get().fetchRosterAndContributions(guildId);
          await get().fetchChatMessages(guildId);
        } catch (e) {
          console.error('[GuildsStore] joinGuild failed:', e);
        }
      },

      leaveGuild: async (guildId, userId) => {
        try {
          const { error } = await supabase
            .from('guild_members')
            .delete()
            .match({ guild_id: guildId, user_id: userId });

          if (error) throw error;
          set({ joinedGuildId: null });
        } catch (e) {
          console.error('[GuildsStore] leaveGuild failed:', e);
        }
      },

      fetchRosterAndContributions: async (guildId) => {
        try {
          // Fetch members of the guild
          const { data: membersRows, error: rosterError } = await supabase
            .from('guild_members')
            .select(`
              role,
              user_id,
              profiles:user_id (id, username, avatar, level)
            `)
            .eq('guild_id', guildId);

          if (rosterError) throw rosterError;

          if (membersRows) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
            
            const members: GuildMember[] = await Promise.all(
              membersRows.map(async (row: any) => {
                const profile = row.profiles;
                
                // Fetch sum of xp_earned in sessions over last 7 days
                const { data: sessions, error: sessionError } = await supabase
                  .from('sessions')
                  .select('xp_earned')
                  .eq('user_id', row.user_id)
                  .gt('ended_at', sevenDaysAgo);

                let weeklyXP = 0;
                if (!sessionError && sessions) {
                  weeklyXP = sessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
                }

                return {
                  id: row.user_id,
                  username: profile?.username || 'Focus Cadet',
                  avatar: mapAvatarToEmoji(profile?.avatar || 'astronaut'),
                  level: profile?.level || 1,
                  weeklyContribution: weeklyXP
                };
              })
            );

            // Compute total Guild XP as sum of weekly contributions
            const totalGuildXp = members.reduce((sum, m) => sum + m.weeklyContribution, 0);

            set({
              guildsList: get().guildsList.map((g) => {
                if (g.id !== guildId) return g;
                return { ...g, members, guildXp: totalGuildXp };
              })
            });
          }
        } catch (e) {
          console.error('[GuildsStore] fetchRosterAndContributions failed:', e);
        }
      },

      sendChatMessage: async (guildId, userId, text) => {
        try {
          const { error } = await supabase
            .from('guild_messages')
            .insert({ guild_id: guildId, user_id: userId, text });

          if (error) throw error;
        } catch (e) {
          console.error('[GuildsStore] sendChatMessage failed:', e);
        }
      },

      fetchChatMessages: async (guildId) => {
        try {
          const { data, error } = await supabase
            .from('guild_messages')
            .select(`
              id,
              text,
              created_at,
              profiles:user_id (username, avatar)
            `)
            .eq('guild_id', guildId)
            .order('created_at', { ascending: true })
            .limit(50);

          if (error) throw error;

          if (data) {
            const chatMessages: GuildChatMessage[] = data.map((msg: any) => ({
              id: msg.id,
              username: msg.profiles?.username || 'Focus Cadet',
              avatar: mapAvatarToEmoji(msg.profiles?.avatar || 'astronaut'),
              text: msg.text,
              timestamp: msg.created_at
            }));

            set({
              guildsList: get().guildsList.map((g) => {
                if (g.id !== guildId) return g;
                return { ...g, chatMessages };
              })
            });
          }
        } catch (e) {
          console.error('[GuildsStore] fetchChatMessages failed:', e);
        }
      },

      subscribeToGuildMessages: (guildId) => {
        const chatChannel = supabase
          .channel(`public:guild_messages:${guildId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'guild_messages', filter: `guild_id=eq.${guildId}` },
            () => {
              get().fetchChatMessages(guildId);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(chatChannel);
        };
      },

      resetGuilds: () => set({
        guildsList: [],
        joinedGuildId: null
      })
    }),
    {
      name: 'levelyn:guilds',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
