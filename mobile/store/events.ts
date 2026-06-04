import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid/non-secure';

export type ActivityCategory = 'study' | 'coding' | 'reading';

export interface SessionEvent {
  id: string;
  type: 'session';
  category: ActivityCategory;
  startedAt: string;
  endedAt?: string;
  pausedDurations?: Array<{from: string; to?: string}>;
  xpEarned?: number;
  manual?: boolean;
  note?: string;
}

type EventsState = {
  events: SessionEvent[];
  addEvent: (e: Omit<SessionEvent, 'id'>) => SessionEvent;
  updateEvent: (id: string, patch: Partial<SessionEvent>) => void;
  deleteEvent: (id: string) => void;
  replaceEvents: (events: SessionEvent[]) => void;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (e) => {
        const ev = { ...e, id: nanoid() } as SessionEvent;
        set({ events: [...get().events, ev] });
        return ev;
      },
      updateEvent: (id, patch) => set({ events: get().events.map(ev => ev.id === id ? {...ev, ...patch} : ev)}),
      deleteEvent: (id) => set({ events: get().events.filter(ev => ev.id !== id)}),
      replaceEvents: (events) => set({ events }),
    }),
    {
      name: 'levelyn:events',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
