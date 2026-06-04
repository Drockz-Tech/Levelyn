import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid/non-secure';

export interface Skill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  level: number;
}

export type StatName = 'strength' | 'agility' | 'vitality' | 'intelligence' | 'sense';

type SoloLevelingState = {
  jobClass: string;
  title: string;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
  statPoints: number;
  fatigue: number;
  skills: Skill[];
  lastLevel: number;
  
  // Actions
  updateField: (key: string, value: any) => void;
  incrementStat: (stat: StatName) => void;
  addSkill: (name: string, type: 'active' | 'passive') => void;
  upgradeSkill: (id: string) => void;
  deleteSkill: (id: string) => void;
  levelUp: (newLevel: number, points: number) => void;
  rest: () => void;
  addFatigue: (amount: number) => void;
  resetStatus: () => void;
};

const DEFAULT_SKILLS: Skill[] = [
  { id: 'focus_burst', name: 'Focus Burst', type: 'active', level: 1 },
  { id: 'shadow_coding', name: 'Shadow Coding', type: 'active', level: 2 },
  { id: 'unyielding_will', name: 'Unyielding Will', type: 'passive', level: 1 }
];

export const useSoloLevelingStore = create<SoloLevelingState>()(
  persist(
    (set, get) => ({
      jobClass: 'Focus Cadet',
      title: 'One Who Surmounted Adversity',
      strength: 10,
      agility: 10,
      vitality: 10,
      intelligence: 10,
      sense: 10,
      statPoints: 5,
      fatigue: 0,
      skills: DEFAULT_SKILLS,
      lastLevel: 1,
      
      updateField: (key, value) => set({ [key]: value }),
      
      incrementStat: (stat) => {
        const points = get().statPoints;
        if (points <= 0) return;
        set({
          statPoints: points - 1,
          [stat]: (get()[stat] as number) + 1,
        });
      },
      
      addSkill: (name, type) => {
        if (!name.trim()) return;
        const newSkill: Skill = {
          id: nanoid(),
          name: name.trim(),
          type,
          level: 1
        };
        set({ skills: [...get().skills, newSkill] });
      },
      
      upgradeSkill: (id) => {
        set({
          skills: get().skills.map(s => s.id === id ? { ...s, level: s.level + 1 } : s)
        });
      },
      
      deleteSkill: (id) => {
        set({
          skills: get().skills.filter(s => s.id !== id)
        });
      },
      
      levelUp: (newLevel, points) => {
        set({
          lastLevel: newLevel,
          statPoints: get().statPoints + points
        });
      },
      
      rest: () => set({ fatigue: 0 }),
      
      addFatigue: (amount) => set({ fatigue: Math.min(100, get().fatigue + amount) }),
      
      resetStatus: () => set({
        jobClass: 'Focus Cadet',
        title: 'One Who Surmounted Adversity',
        strength: 10,
        agility: 10,
        vitality: 10,
        intelligence: 10,
        sense: 10,
        statPoints: 5,
        fatigue: 0,
        skills: DEFAULT_SKILLS,
        lastLevel: 1
      }),
    }),
    {
      name: 'levelyn:sololeveling',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSoloLevelingStore;
