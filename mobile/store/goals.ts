import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid/non-secure';

export interface Goal {
  id: string;
  title: string;
  category: 'coding' | 'study' | 'reading';
  targetMinutes: number;
  currentMinutes: number;
  completed: boolean;
  createdAt: string;
}

type GoalsState = {
  activeGoal: Goal | null;
  completedGoalsCount: number;
  setActiveGoal: (goalData: { title: string; category: 'coding' | 'study' | 'reading'; targetMinutes: number } | null) => void;
  addProgress: (category: 'coding' | 'study' | 'reading', minutes: number) => void;
  clearActiveGoal: () => void;
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      activeGoal: null,
      completedGoalsCount: 0,
      setActiveGoal: (goalData) => {
        if (!goalData) {
          set({ activeGoal: null });
          return;
        }
        const newGoal: Goal = {
          id: nanoid(),
          title: goalData.title,
          category: goalData.category,
          targetMinutes: goalData.targetMinutes,
          currentMinutes: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set({ activeGoal: newGoal });
      },
      addProgress: (category, minutes) => {
        const active = get().activeGoal;
        if (!active || active.category !== category || active.completed) return;

        const nextMinutes = Math.min(active.targetMinutes, active.currentMinutes + minutes);
        const isCompleted = nextMinutes >= active.targetMinutes;

        set({
          activeGoal: {
            ...active,
            currentMinutes: nextMinutes,
            completed: isCompleted,
          },
          completedGoalsCount: get().completedGoalsCount + (isCompleted ? 1 : 0),
        });
      },
      clearActiveGoal: () => set({ activeGoal: null }),
    }),
    {
      name: 'levelyn:goals',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useGoalsStore;
