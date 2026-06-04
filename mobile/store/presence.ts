import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ActiveFriendPresence {
  id: string;
  username: string;
  avatar: string;
  category: 'coding' | 'study' | 'reading';
  elapsedMins: number;
  note?: string;
  lastReactionReceived?: string;
}

interface PresenceState {
  isUserActive: boolean;
  activeCategory: 'coding' | 'study' | 'reading' | null;
  activeFriends: ActiveFriendPresence[];
  channelInstance: RealtimeChannel | null;
  
  // Actions
  initPresence: (userId: string) => void;
  setUserPresence: (active: boolean, category?: 'coding' | 'study' | 'reading' | null) => Promise<void>;
  sendFriendReaction: (friendId: string, reactionType: string) => void;
  receiveReaction: (reactionType: string) => void;
  cleanupPresence: () => void;
  resetPresence: () => void;
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

export const usePresenceStore = create<PresenceState>()(
  persist(
    (set, get) => ({
      isUserActive: false,
      activeCategory: null,
      activeFriends: [],
      channelInstance: null,

      initPresence: (userId) => {
        const existing = get().channelInstance;
        if (existing) return;

        const channel = supabase.channel('focus-presence', {
          config: { presence: { key: userId } },
        });

        channel
          .on('presence', { event: 'sync' }, async () => {
            const state = channel.presenceState() as Record<string, any[]>;
            
            const keys = Object.keys(state).filter((k) => k !== userId);
            if (keys.length === 0) {
              set({ activeFriends: [] });
              return;
            }

            try {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, avatar')
                .in('id', keys);

              const activeFriendsList: ActiveFriendPresence[] = keys
                .map((key): ActiveFriendPresence | null => {
                  const profile = (profiles || []).find((p: any) => p.id === key);
                  const presenceSegments = state[key];
                  if (!presenceSegments || presenceSegments.length === 0) return null;
                  
                  const presenceData = presenceSegments[0];

                  return {
                    id: key,
                    username: profile?.username || 'Focus Cadet',
                    avatar: mapAvatarToEmoji(profile?.avatar || 'astronaut'),
                    category: presenceData.category || 'coding',
                    elapsedMins: Math.max(1, Math.round((Date.now() - new Date(presenceData.started_at).getTime()) / 60000)),
                    note: presenceData.note || 'Deep Focus'
                  };
                })
                .filter((item): item is ActiveFriendPresence => item !== null);

              set({ activeFriends: activeFriendsList });
            } catch (e) {
              console.error('[PresenceStore] error mapping presence profiles:', e);
            }
          })
          .subscribe();

        set({ channelInstance: channel });
      },

      setUserPresence: async (active, category = null) => {
        const channel = get().channelInstance;
        if (!channel) return;

        set({ isUserActive: active, activeCategory: category });

        try {
          if (active && category) {
            await channel.track({
              category,
              started_at: new Date().toISOString(),
              note: `Broadcasting S-Rank ${category}`
            });
          } else {
            await channel.untrack();
          }
        } catch (e) {
          console.error('[PresenceStore] track failed:', e);
        }
      },

      sendFriendReaction: (friendId, reactionType) => {
        set({
          activeFriends: get().activeFriends.map((f) => {
            if (f.id !== friendId) return f;
            return {
              ...f,
              lastReactionReceived: `You sent: ${reactionType}`
            };
          })
        });
      },

      receiveReaction: (reactionType) => {
        // Local reaction state handle
      },

      cleanupPresence: () => {
        const channel = get().channelInstance;
        if (channel) {
          supabase.removeChannel(channel);
          set({ channelInstance: null, activeFriends: [] });
        }
      },

      resetPresence: () => {
        get().cleanupPresence();
        set({
          isUserActive: false,
          activeCategory: null,
          activeFriends: []
        });
      }
    }),
    {
      name: 'levelyn:presence',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isUserActive: state.isUserActive,
        activeCategory: state.activeCategory
      }) // avoid persisting channelInstance
    }
  )
);
