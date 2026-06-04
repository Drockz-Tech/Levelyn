import { getUnlockedAchievements } from '../utils/achievements';
import { SessionEvent } from '../store/events';

describe('Achievements Engine', () => {
  const baseEvent: SessionEvent = {
    id: '1',
    type: 'session',
    category: 'coding',
    startedAt: '2026-05-20T10:00:00.000Z',
    endedAt: '2026-05-20T10:30:00.000Z', // 30 minutes
    xpEarned: 25,
    pausedDurations: [],
  };

  test('no completed sessions returns empty unlocked achievements', () => {
    const unlocked = getUnlockedAchievements([], 0, 0);
    expect(unlocked.size).toBe(0);
  });

  test('completing first session unlocks first_session', () => {
    const unlocked = getUnlockedAchievements([baseEvent], 1, 25);
    expect(unlocked.has('first_session')).toBe(true);
    expect(unlocked.has('consistent_cadet')).toBe(false);
  });

  test('having a streak of 3 unlocks consistent_cadet', () => {
    const unlocked = getUnlockedAchievements([baseEvent], 3, 25);
    expect(unlocked.has('consistent_cadet')).toBe(true);
  });

  test('having total XP >= 500 unlocks xp_centurion', () => {
    const unlocked = getUnlockedAchievements([baseEvent], 1, 550);
    expect(unlocked.has('xp_centurion')).toBe(true);
  });

  test('having coding session of >= 45 mins unlocks deep_diver', () => {
    const deepCoding: SessionEvent = {
      ...baseEvent,
      endedAt: '2026-05-20T10:45:00.000Z', // 45 mins
    };
    const unlocked = getUnlockedAchievements([deepCoding], 1, 40);
    expect(unlocked.has('deep_diver')).toBe(true);
  });

  test('logging study, coding, and reading unlocks polymath_pro', () => {
    const events: SessionEvent[] = [
      { ...baseEvent, category: 'coding' },
      { ...baseEvent, id: '2', category: 'study' },
      { ...baseEvent, id: '3', category: 'reading' },
    ];
    const unlocked = getUnlockedAchievements(events, 1, 100);
    expect(unlocked.has('polymath_pro')).toBe(true);
  });
});
