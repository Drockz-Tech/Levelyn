import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface Boss {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  rewardXp: number;
  expiresAt: string;
  avatar: string;
  flavorText: string;
}

interface BossState {
  activeBoss: Boss | null;
  victoryLogCount: number;
  lastDamageDealt: number;
  showDamageIndicator: boolean;
  loading: boolean;
  
  // Actions
  fetchActiveBoss: () => Promise<void>;
  attackBoss: (damage: number) => Promise<{ defeated: boolean; xpAwarded: number }>;
  spawnNewBoss: () => Promise<void>;
  subscribeToBossRealtime: () => () => void;
  resetBoss: () => void;
}

const BOSS_POOL: Omit<Boss, 'hp'>[] = [
  {
    id: 'boss-react-deadline',
    name: 'React Project Deadline',
    maxHp: 200,
    rewardXp: 500,
    expiresAt: '',
    avatar: '👹',
    flavorText: 'An incoming catastrophic production deadline. Extreme concentration required.'
  },
  {
    id: 'boss-technical-debt',
    name: 'Legacy Code Technical Debt',
    maxHp: 300,
    rewardXp: 750,
    expiresAt: '',
    avatar: '👾',
    flavorText: 'Vast spider-web archives of undocumented pasta code. Subdue it!'
  },
  {
    id: 'boss-imposter-syndrome',
    name: 'Imposter Syndrome Demon',
    maxHp: 150,
    rewardXp: 400,
    expiresAt: '',
    avatar: '🕷️',
    flavorText: 'Whispers self-doubt in your console logs. Expel it with focus!'
  }
];

export const useBossStore = create<BossState>()(
  persist(
    (set, get) => ({
      activeBoss: null,
      victoryLogCount: 0,
      lastDamageDealt: 0,
      showDamageIndicator: false,
      loading: false,

      fetchActiveBoss: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('bosses')
            .select('*')
            .gt('hp', 0)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            set({
              activeBoss: {
                id: data.id,
                name: data.name,
                hp: data.hp,
                maxHp: data.max_hp,
                rewardXp: data.reward_xp,
                expiresAt: data.expires_at,
                avatar: data.avatar,
                flavorText: data.flavor_text || ''
              }
            });
          } else {
            // No active boss found (slain or expired) -> Spawn a new one!
            await get().spawnNewBoss();
          }
        } catch (e) {
          console.error('[BossStore] fetchActiveBoss failed:', e);
        } finally {
          set({ loading: false });
        }
      },

      attackBoss: async (damage) => {
        const boss = get().activeBoss;
        if (!boss) return { defeated: false, xpAwarded: 0 };

        const newHp = Math.max(0, boss.hp - damage);
        const defeated = newHp <= 0;
        const xpAwarded = defeated ? boss.rewardXp : 0;

        try {
          // Perform collaborative damage deal in the database
          const { error } = await supabase
            .from('bosses')
            .update({ hp: newHp })
            .eq('id', boss.id);

          if (error) throw error;

          set({
            lastDamageDealt: damage,
            showDamageIndicator: true,
            activeBoss: defeated ? null : { ...boss, hp: newHp }
          });

          // Hide damage indicator floating tag after 3 seconds
          setTimeout(() => {
            set({ showDamageIndicator: false });
          }, 3000);

          if (defeated) {
            set((s) => ({ victoryLogCount: s.victoryLogCount + 1 }));
            
            // Insert boss defeated feed activity
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('activities').insert({
                user_id: user.id,
                type: 'achievement',
                note: `🎉 Collaboratively defeated Raid Boss [${boss.name}]!`
              });
            }
          }
        } catch (e) {
          console.error('[BossStore] attackBoss failed:', e);
        }

        return { defeated, xpAwarded };
      },

      spawnNewBoss: async () => {
        try {
          const nextIndex = Math.floor(Math.random() * BOSS_POOL.length);
          const selected = BOSS_POOL[nextIndex];
          const newExpiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

          const { data, error } = await supabase
            .from('bosses')
            .insert({
              name: selected.name,
              hp: selected.maxHp,
              max_hp: selected.maxHp,
              reward_xp: selected.rewardXp,
              expires_at: newExpiresAt,
              avatar: selected.avatar,
              flavor_text: selected.flavorText
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            set({
              activeBoss: {
                id: data.id,
                name: data.name,
                hp: data.hp,
                maxHp: data.max_hp,
                rewardXp: data.reward_xp,
                expiresAt: data.expires_at,
                avatar: data.avatar,
                flavorText: data.flavor_text || ''
              },
              lastDamageDealt: 0,
              showDamageIndicator: false
            });
          }
        } catch (e) {
          console.error('[BossStore] spawnNewBoss failed:', e);
        }
      },

      subscribeToBossRealtime: () => {
        const bossChannel = supabase
          .channel('public:bosses')
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'bosses' },
            (payload) => {
              const updated = payload.new;
              const current = get().activeBoss;

              if (current && updated && updated.id === current.id) {
                // If HP went down, trigger float indicator
                const hpDiff = current.hp - updated.hp;
                if (hpDiff > 0) {
                  set({
                    lastDamageDealt: hpDiff,
                    showDamageIndicator: true,
                    activeBoss: updated.hp <= 0 ? null : { ...current, hp: updated.hp }
                  });
                  setTimeout(() => {
                    set({ showDamageIndicator: false });
                  }, 3000);

                  if (updated.hp <= 0) {
                    set((s) => ({ victoryLogCount: s.victoryLogCount + 1 }));
                  }
                } else {
                  set({
                    activeBoss: updated.hp <= 0 ? null : { ...current, hp: updated.hp }
                  });
                }
              } else if (!current && updated && updated.hp > 0) {
                // If a new boss is spawned, load it
                set({
                  activeBoss: {
                    id: updated.id,
                    name: updated.name,
                    hp: updated.hp,
                    maxHp: updated.max_hp,
                    rewardXp: updated.reward_xp,
                    expiresAt: updated.expires_at,
                    avatar: updated.avatar,
                    flavorText: updated.flavor_text || ''
                  },
                  lastDamageDealt: 0,
                  showDamageIndicator: false
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(bossChannel);
        };
      },

      resetBoss: () => set({
        activeBoss: null,
        victoryLogCount: 0,
        lastDamageDealt: 0,
        showDamageIndicator: false
      })
    }),
    {
      name: 'levelyn:boss',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
