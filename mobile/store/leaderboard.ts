import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useProfileStore } from './profile';
import { useEventsStore } from './events';
import { totalXp, calculateStreak } from '../utils/aggregates';
import { supabase } from '../lib/supabase';

export interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  totalXp: number;
  codingXp: number;
  studyXp: number;
  streak: number;
  title: string;
  jobClass: string;
}

interface LeaderboardState {
  globalUsers: LeaderboardUser[];
  loading: boolean;
  
  // Actions
  fetchGlobalLeaderboard: () => Promise<void>;
  getRankings: (type: 'totalXp' | 'codingXp' | 'studyXp' | 'streak', filterFriendsOnly: boolean) => LeaderboardUser[];
  resetLeaderboard: () => void;
}

const MOCK_GLOBAL_USERS: LeaderboardUser[] = [
  { id: 'jinwoo', username: 'Sung Jin-Woo', avatar: '🔥', totalXp: 28400, codingXp: 18200, studyXp: 10200, streak: 15, title: 'Shadow Monarch', jobClass: 'S-Rank Assassin' },
  { id: 'haein', username: 'Cha Hae-In', avatar: '⚔️', totalXp: 19500, codingXp: 4500, studyXp: 15000, streak: 12, title: 'Sword Dancer', jobClass: 'S-Rank Fighter' },
  { id: 'gunhee', username: 'Go Gun-Hee', avatar: '🦅', totalXp: 18200, codingXp: 10200, studyXp: 8000, streak: 8, title: 'Association Chairman', jobClass: 'S-Rank Fighter' },
  { id: 'byunggu', username: 'Min Byung-Gu', avatar: '✨', totalXp: 11200, codingXp: 2200, studyXp: 9000, streak: 5, title: 'Saint of Light', jobClass: 'S-Rank Healer' },
  { id: 'jinho', username: 'Yoo Jin-Ho', avatar: '🛡️', totalXp: 3500, codingXp: 1800, studyXp: 1700, streak: 4, title: 'Guild Vice-Master', jobClass: 'D-Rank Tanker' },
  { id: 'chul', username: 'Kim Chul', avatar: '🛡️', totalXp: 9200, codingXp: 4200, studyXp: 5000, streak: 3, title: 'Iron Shield', jobClass: 'A-Rank Tanker' },
  { id: 'dongwook', username: 'Hwang Dong-Su', avatar: '🦁', totalXp: 14500, codingXp: 6500, studyXp: 8000, streak: 7, title: 'Vengeful Tiger', jobClass: 'S-Rank Fighter' },
];

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      globalUsers: MOCK_GLOBAL_USERS,
      loading: false,

      fetchGlobalLeaderboard: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar, level, total_xp, title, job_class, sessions(xp_earned, ended_at, category)')
            .order('total_xp', { ascending: false })
            .limit(50);

          if (error) throw error;
          if (data) {
            const mapped: LeaderboardUser[] = data.map((p: any) => {
              const completed = (p.sessions || []).filter((s: any) => s.ended_at);
              
              // Calculate streak (days with activity)
              const activeDates = new Set(completed.map((s: any) => new Date(s.ended_at).toDateString()));
              const streak = activeDates.size;

              const codingXp = completed
                .filter((s: any) => s.category === 'coding')
                .reduce((sum: number, s: any) => sum + (s.xp_earned || 0), 0);

              const studyXp = completed
                .filter((s: any) => s.category === 'study')
                .reduce((sum: number, s: any) => sum + (s.xp_earned || 0), 0);

              const avatarMap = { astronaut: '👨‍🚀', rocket: '🚀', cypher: '👾', phoenix: '🔥' };
              const emoji = avatarMap[p.avatar as keyof typeof avatarMap] || '🛰️';

              return {
                id: p.id,
                username: p.display_name || p.username || 'Focus Cadet',
                avatar: emoji,
                totalXp: p.total_xp || 0,
                codingXp,
                studyXp,
                streak,
                title: p.title || 'Ascending Hunter',
                jobClass: p.job_class || 'Focus Cadet'
              };
            });
            set({ globalUsers: mapped });
          }
        } catch (e) {
          console.error('[LeaderboardStore] fetchGlobalLeaderboard failed:', e);
        } finally {
          set({ loading: false });
        }
      },

      getRankings: (type, filterFriendsOnly) => {
        // 1. Fetch current user metrics dynamically
        const profile = useProfileStore.getState().profile;
        const events = useEventsStore.getState().events;
        
        const myXp = totalXp(events);
        const myStreak = calculateStreak(events);
        
        const myCodingXp = events
          .filter(e => e.endedAt && e.category === 'coding')
          .reduce((sum, e) => sum + (e.xpEarned || 0), 0);
          
        const myStudyXp = events
          .filter(e => e.endedAt && e.category === 'study')
          .reduce((sum, e) => sum + (e.xpEarned || 0), 0);
        
        const avatarMap = { astronaut: '👨‍🚀', rocket: '🚀', cypher: '👾', phoenix: '🔥' };
        const myAvatar = profile?.avatar ? avatarMap[profile.avatar] : '🛰️';

        const me: LeaderboardUser = {
          id: 'me',
          username: (profile?.display_name || profile?.username || 'Focus Cadet') + ' (You)',
          avatar: myAvatar,
          totalXp: myXp,
          codingXp: myCodingXp,
          studyXp: myStudyXp,
          streak: myStreak,
          title: 'Ascending Hunter',
          jobClass: 'Focus Cadet'
        };

        // 2. Fetch follow network
        const following = useSocialStore.getState().following;

        // 3. Assemble complete candidate list
        let candidates = [...get().globalUsers];
        
        // Remove 'me' placeholder if present, then add actual 'me'
        candidates = candidates.filter(c => c.id !== 'me');
        candidates.push(me);

        // 4. Filter by friendship if selected
        if (filterFriendsOnly) {
          candidates = candidates.filter(c => c.id === 'me' || following.includes(c.id));
        }

        // 5. Sort depending on category
        return candidates.sort((a, b) => {
          if (type === 'totalXp') return b.totalXp - a.totalXp;
          if (type === 'codingXp') return b.codingXp - a.codingXp;
          if (type === 'studyXp') return b.studyXp - a.studyXp;
          if (type === 'streak') return b.streak - a.streak;
          return b.totalXp - a.totalXp;
        });
      },

      resetLeaderboard: () => set({
        globalUsers: MOCK_GLOBAL_USERS
      })
    }),
    {
      name: 'levelyn:leaderboard',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

// Lazy-loaded import to avoid circular dependency
import { useSocialStore } from './social';
