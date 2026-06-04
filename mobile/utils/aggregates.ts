import { SessionEvent } from '../store/events';

export function totalXp(events: SessionEvent[]) {
  return events.reduce((sum, ev) => sum + (ev.xpEarned || 0), 0);
}

export function totalSeconds(events: SessionEvent[]) {
  return events.reduce((sum, ev) => {
    if (!ev.endedAt) return sum;
    const s = (new Date(ev.endedAt).getTime() - new Date(ev.startedAt).getTime()) / 1000;
    const pausedSecs = ev.pausedDurations?.reduce((ps, p) => {
      const start = new Date(p.from).getTime();
      const end = p.to ? new Date(p.to).getTime() : Date.now();
      return ps + (end - start) / 1000;
    }, 0) || 0;
    return sum + Math.max(0, s - pausedSecs);
  }, 0);
}

export function totalHours(events: SessionEvent[]) {
  return totalSeconds(events) / 3600;
}

export function daysWithActivity(events: SessionEvent[], days = 30) {
  const set = new Set<string>();
  for (const ev of events) {
    if (!ev.endedAt) continue;
    const d = new Date(ev.endedAt);
    const key = d.toISOString().slice(0, 10);
    set.add(key);
  }
  return Array.from(set).slice(-days).length;
}

export function calculateStreak(events: SessionEvent[]): number {
  if (events.length === 0) return 0;
  
  const activeDates = new Set<string>();
  for (const ev of events) {
    if (!ev.endedAt) continue;
    const d = new Date(ev.endedAt);
    const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    activeDates.add(localDate);
  }
  
  if (activeDates.size === 0) return 0;
  
  const today = new Date();
  const getLocalDateStr = (d: Date) => 
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const todayStr = getLocalDateStr(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateStr(yesterday);
  
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0;
  }
  
  let streak = 0;
  const currentCheck = activeDates.has(todayStr) ? new Date(today) : new Date(yesterday);
  
  while (true) {
    const checkStr = getLocalDateStr(currentCheck);
    if (activeDates.has(checkStr)) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
