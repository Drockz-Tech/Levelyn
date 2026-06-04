import { SessionEvent } from '../store/events';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji
  category: 'general' | 'duration' | 'streak' | 'xp' | 'multi';
  themeColor: string;
  isHidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    title: 'First Contact',
    description: 'Complete your first focused study, coding, or reading session.',
    icon: '🚀',
    category: 'general',
    themeColor: '#7BE7FF', // Blue
  },
  {
    id: 'hour_power',
    title: 'Hour of Power',
    description: 'Complete a single focus session of 60 minutes or more.',
    icon: '⚡',
    category: 'duration',
    themeColor: '#B77BFF', // Purple
  },
  {
    id: 'consistent_cadet',
    title: 'Consistent Cadet',
    description: 'Maintain a continuous daily focus streak of 3 days or more.',
    icon: '🔥',
    category: 'streak',
    themeColor: '#0DF5C4', // Teal
  },
  {
    id: 'polymath_pro',
    title: 'Polymath Pro',
    description: 'Diversify your mind! Log a session in Study, Coding, and Reading.',
    icon: '🧠',
    category: 'multi',
    themeColor: '#FF758F', // Pink
  },
  {
    id: 'xp_centurion',
    title: 'XP Centurion',
    description: 'Level up to greatness! Accumulate a total of 500 or more XP.',
    icon: '👑',
    category: 'xp',
    themeColor: '#FF9F1C', // Orange
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Initiate a deep hack. Log a Coding session of 45+ minutes.',
    icon: '👾',
    category: 'duration',
    themeColor: '#39FF14', // Neon Green
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Fuel the nocturnal fire! Complete a focus session between 12:00 AM and 4:00 AM.',
    icon: '🦉',
    category: 'general',
    themeColor: '#4361EE', // Deep Blue
    isHidden: true,
  },
  {
    id: 'hyper_focus',
    title: 'Hyper Focus',
    description: 'Level past limits! Complete a single focus session of 120 minutes or more.',
    icon: '🧘',
    category: 'duration',
    themeColor: '#F72585', // Magenta
    isHidden: true,
  },
  {
    id: 'boss_slayer',
    title: 'Boss Slayer',
    description: 'Cleanse the timeline threat! Defeat a total of 5 Raid Bosses.',
    icon: '👹',
    category: 'general',
    themeColor: '#E63946', // Red
    isHidden: true,
  },
  {
    id: 'grandmaster',
    title: 'Grandmaster Focus',
    description: 'The ultimate pinnacle! Complete a total of 50 focus sessions.',
    icon: '🏆',
    category: 'general',
    themeColor: '#FFD700', // Gold
  },
];

export function getUnlockedAchievements(events: SessionEvent[], streak: number, totalXp: number): Set<string> {
  const unlocked = new Set<string>();
  const completed = events.filter(e => e.endedAt);
  
  if (completed.length === 0) return unlocked;

  // 1. First Contact
  unlocked.add('first_session');

  // Helper to get session duration in minutes
  const getDurationMin = (e: SessionEvent) => {
    if (!e.endedAt) return 0;
    const totalSecs = (new Date(e.endedAt).getTime() - new Date(e.startedAt).getTime()) / 1000;
    const pausedSecs = e.pausedDurations?.reduce((ps, p) => {
      const start = new Date(p.from).getTime();
      const end = p.to ? new Date(p.to).getTime() : Date.now();
      return ps + (end - start) / 1000;
    }, 0) || 0;
    return Math.max(0, totalSecs - pausedSecs) / 60;
  };

  // 2. Hour of Power (>= 60 mins)
  const hasHourSession = completed.some(e => getDurationMin(e) >= 60);
  if (hasHourSession) {
    unlocked.add('hour_power');
  }

  // 3. Consistent Cadet (Streak >= 3)
  if (streak >= 3) {
    unlocked.add('consistent_cadet');
  }

  // 4. Polymath Pro (Study, Coding, Reading all tracked)
  const categories = new Set(completed.map(e => e.category));
  if (categories.has('study') && categories.has('coding') && categories.has('reading')) {
    unlocked.add('polymath_pro');
  }

  // 5. XP Centurion (Total XP >= 500)
  if (totalXp >= 500) {
    unlocked.add('xp_centurion');
  }

  // 6. Deep Diver (Coding >= 45 mins)
  const hasDeepCoding = completed.some(e => e.category === 'coding' && getDurationMin(e) >= 45);
  if (hasDeepCoding) {
    unlocked.add('deep_diver');
  }

  // 7. Night Owl (Session ends between 12 AM and 4 AM)
  const hasNightOwl = completed.some(e => {
    const endHour = new Date(e.endedAt!).getHours();
    return endHour >= 0 && endHour < 4;
  });
  if (hasNightOwl) {
    unlocked.add('night_owl');
  }

  // 8. Hyper Focus (Session >= 120 mins)
  const hasHyperFocus = completed.some(e => getDurationMin(e) >= 120);
  if (hasHyperFocus) {
    unlocked.add('hyper_focus');
  }

  // 9. Boss Slayer (victoryLogCount >= 5)
  try {
    const bossCount = require('../store/boss').useBossStore.getState().victoryLogCount || 0;
    if (bossCount >= 5) {
      unlocked.add('boss_slayer');
    }
  } catch (e) {
    console.warn('Boss Slayer check deferred:', e);
  }

  // 10. Grandmaster Focus (completed >= 50)
  if (completed.length >= 50) {
    unlocked.add('grandmaster');
  }

  return unlocked;
}
