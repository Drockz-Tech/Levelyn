import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid/non-secure';
import { SessionEvent } from './events';
import { Achievement, ACHIEVEMENTS, getUnlockedAchievements } from '../utils/achievements';

export interface CustomAchievement extends Achievement {
  isCustom: true;
  targetValue: number;
  targetType: 'sessions' | 'xp' | 'streak';
  currentValue: number;
}

interface AchievementsState {
  customAchievements: CustomAchievement[];
  unlockedIds: string[];
  popupQueue: Achievement[];
  
  // Actions
  addCustomAchievement: (ach: Omit<CustomAchievement, 'id' | 'isCustom' | 'currentValue'>) => void;
  deleteCustomAchievement: (id: string) => void;
  dequeuePopup: () => Achievement | null;
  checkAchievements: (events: SessionEvent[], streak: number, totalXp: number) => Achievement[];
  resetAchievements: () => void;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      customAchievements: [],
      unlockedIds: [],
      popupQueue: [],

      addCustomAchievement: (ach) => {
        const newAch: CustomAchievement = {
          ...ach,
          id: `custom_${nanoid()}`,
          isCustom: true,
          currentValue: 0,
        };
        set((s) => ({
          customAchievements: [...s.customAchievements, newAch]
        }));
      },

      deleteCustomAchievement: (id) => {
        set((s) => ({
          customAchievements: s.customAchievements.filter(ach => ach.id !== id),
          unlockedIds: s.unlockedIds.filter(uid => uid !== id)
        }));
      },

      dequeuePopup: () => {
        const queue = get().popupQueue;
        if (queue.length === 0) return null;
        const [next, ...rest] = queue;
        set({ popupQueue: rest });
        return next;
      },

      checkAchievements: (events, streak, totalXp) => {
        const prevUnlocked = new Set(get().unlockedIds);
        const newUnlocked = new Set<string>();

        // 1. Check standard achievements
        const standardUnlocked = getUnlockedAchievements(events, streak, totalXp);
        standardUnlocked.forEach(id => newUnlocked.add(id));

        // 2. Check custom achievements
        const completedSessionsCount = events.filter(e => e.endedAt).length;
        const customAchievements = get().customAchievements;

        customAchievements.forEach((ach) => {
          let meetsThreshold = false;
          if (ach.targetType === 'sessions') {
            meetsThreshold = completedSessionsCount >= ach.targetValue;
          } else if (ach.targetType === 'xp') {
            meetsThreshold = totalXp >= ach.targetValue;
          } else if (ach.targetType === 'streak') {
            meetsThreshold = streak >= ach.targetValue;
          }

          if (meetsThreshold) {
            newUnlocked.add(ach.id);
          }
        });

        // 3. Find newly unlocked achievement IDs
        const newlyUnlockedIds = [...newUnlocked].filter(id => !prevUnlocked.has(id));

        if (newlyUnlockedIds.length === 0) return [];

        // 4. Resolve full Achievement objects
        const newlyUnlockedObjects: Achievement[] = [];
        newlyUnlockedIds.forEach(id => {
          // Check standard
          const std = ACHIEVEMENTS.find(a => a.id === id);
          if (std) {
            newlyUnlockedObjects.push(std);
          } else {
            // Check custom
            const cust = customAchievements.find(a => a.id === id);
            if (cust) {
              newlyUnlockedObjects.push(cust);
            }
          }
        });

        // 5. Update state
        set((s) => ({
          unlockedIds: [...s.unlockedIds, ...newlyUnlockedIds],
          popupQueue: [...s.popupQueue, ...newlyUnlockedObjects]
        }));

        return newlyUnlockedObjects;
      },

      resetAchievements: () => set({
        customAchievements: [],
        unlockedIds: [],
        popupQueue: []
      })
    }),
    {
      name: 'levelyn:achievements',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
