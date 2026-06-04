/**
 * Offline-first sync engine for Levelyn.
 *
 * Architecture:
 *   Zustand stores remain the source of truth for UI.
 *   This module syncs local state ↔ Supabase when online.
 *
 *   - On login:  pull remote → hydrate Zustand stores
 *   - On action: debounced push to Supabase (fire-and-forget, retry on fail)
 *   - On reconnect: diff-sync any offline changes
 */

import { supabase } from './supabase';
import { useProfileStore } from '../store/profile';
import { useEventsStore } from '../store/events';
import { useSoloLevelingStore } from '../store/soloLeveling';
import { useSocialStore } from '../store/social';
import type { User } from '@supabase/supabase-js';

// ─── Debounce helper ─────────────────────────────────────────
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DELAY_MS = 2000;

function debouncedSync(fn: () => Promise<void>) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    fn().catch(console.error);
  }, SYNC_DELAY_MS);
}

// ─── Pull: Remote → Local ────────────────────────────────────

/** Called once after successful login to hydrate local stores from Supabase */
export async function pullFromSupabase(user: User) {
  try {
    // 1. Pull profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      useProfileStore.getState().setProfile({
        username: profile.username,
        display_name: profile.display_name,
        avatar: profile.avatar as 'astronaut' | 'rocket' | 'cypher' | 'phoenix',
        theme: profile.theme as 'blue' | 'purple' | 'teal',
        isPrivate: profile.is_private ?? false,
      });

      // Hydrate solo leveling store
      const attrs = (profile.attributes || {}) as Record<string, number>;
      useSoloLevelingStore.setState({
        jobClass: profile.job_class,
        title: profile.title,
        strength: attrs.strength ?? 10,
        agility: attrs.agility ?? 10,
        vitality: attrs.vitality ?? 10,
        intelligence: attrs.intelligence ?? 10,
        sense: attrs.sense ?? 10,
        statPoints: profile.stat_points,
        fatigue: profile.fatigue,
        skills: ((profile.skills as Array<{ id: string; name: string; type: string; level: number }>) || []).map(s => ({
          ...s,
          type: s.type as 'active' | 'passive',
        })),
      });
    }

    // 2. Pull sessions → events
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(500);

    if (sessions && sessions.length > 0) {
      const events = sessions.map((s) => ({
        id: s.id,
        type: 'session' as const,
        category: s.category as 'coding' | 'study' | 'reading',
        startedAt: s.started_at,
        endedAt: s.ended_at || undefined,
        xpEarned: s.xp_earned,
        note: s.note || undefined,
      }));
      useEventsStore.getState().replaceEvents(events);
    }

    // 3. Pull follows
    const { data: followRows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (followRows) {
      const followingIds = followRows.map((f) => f.following_id);
      useSocialStore.setState({ following: followingIds });
    }

    // 4. Pull followers count
    const { data: followerRows } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', user.id);

    if (followerRows) {
      const followerIds = followerRows.map((f) => f.follower_id);
      useSocialStore.setState({ followers: followerIds });
    }

    console.log('[Sync] Pull from Supabase complete');
  } catch (err) {
    console.error('[Sync] Pull failed:', err);
  }
}

// ─── Push: Local → Remote ────────────────────────────────────

/** Push a single completed session to Supabase */
export async function pushSession(userId: string, event: {
  id: string;
  category: string;
  startedAt: string;
  endedAt?: string;
  xpEarned?: number;
  note?: string;
}) {
  debouncedSync(async () => {
    const durationSeconds = event.endedAt
      ? Math.round((new Date(event.endedAt).getTime() - new Date(event.startedAt).getTime()) / 1000)
      : null;

    const { error } = await supabase.from('sessions').upsert({
      id: event.id,
      user_id: userId,
      category: event.category,
      started_at: event.startedAt,
      ended_at: event.endedAt || null,
      duration_seconds: durationSeconds,
      xp_earned: event.xpEarned || 0,
      note: event.note || null,
    });

    if (error) console.error('[Sync] Push session failed:', error.message);
  });
}

/** Push profile updates to Supabase */
export async function pushProfile(userId: string) {
  debouncedSync(async () => {
    const profile = useProfileStore.getState().profile;
    const solo = useSoloLevelingStore.getState();
    const events = useEventsStore.getState().events;

    // Compute total XP locally
    let totalXp = 0;
    events.forEach((e) => { totalXp += e.xpEarned || 0; });

    const { error } = await supabase.from('profiles').update({
      username: profile?.username,
      display_name: profile?.display_name,
      avatar: profile?.avatar,
      theme: profile?.theme,
      is_private: profile?.isPrivate ?? false,
      job_class: solo.jobClass,
      title: solo.title,
      total_xp: totalXp,
      attributes: {
        strength: solo.strength,
        agility: solo.agility,
        vitality: solo.vitality,
        intelligence: solo.intelligence,
        sense: solo.sense,
      },
      stat_points: solo.statPoints,
      fatigue: solo.fatigue,
      skills: solo.skills,
    }).eq('id', userId);

    if (error) console.error('[Sync] Push profile failed:', error.message);
  });
}

/** Push a follow action */
export async function pushFollow(userId: string, targetId: string) {
  const { error } = await supabase.from('follows').insert({
    follower_id: userId,
    following_id: targetId,
  });
  if (error) console.error('[Sync] Push follow failed:', error.message);
}

/** Push an unfollow action */
export async function pushUnfollow(userId: string, targetId: string) {
  const { error } = await supabase.from('follows').delete().match({
    follower_id: userId,
    following_id: targetId,
  });
  if (error) console.error('[Sync] Push unfollow failed:', error.message);
}

/** Post a social activity (session complete, level up, achievement) */
export async function pushActivity(userId: string, activity: {
  type: 'session' | 'levelup' | 'achievement';
  category?: string;
  duration?: number;
  xp?: number;
  level?: number;
  note?: string;
}) {
  const { error } = await supabase.from('activities').insert({
    user_id: userId,
    type: activity.type,
    category: activity.category || null,
    duration: activity.duration || null,
    xp: activity.xp || null,
    level: activity.level || null,
    note: activity.note || null,
  });
  if (error) console.error('[Sync] Push activity failed:', error.message);
}

/** Push a reaction to an activity */
export async function pushReaction(userId: string, activityId: string, reactionType: string) {
  const { error } = await supabase.from('reactions').upsert({
    activity_id: activityId,
    user_id: userId,
    type: reactionType,
  });
  if (error) console.error('[Sync] Push reaction failed:', error.message);
}

// ─── Real-time Subscriptions ─────────────────────────────────

/** Subscribe to real-time feed updates from followed users */
export function subscribeToFeed(onNewActivity: (activity: Record<string, unknown>) => void) {
  const channel = supabase
    .channel('feed-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activities' },
      (payload) => {
        onNewActivity(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Subscribe to real-time guild chat messages */
export function subscribeToGuildChat(
  guildId: string,
  onNewMessage: (message: Record<string, unknown>) => void
) {
  const channel = supabase
    .channel(`guild-chat-${guildId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'guild_messages',
        filter: `guild_id=eq.${guildId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Set up presence tracking for focus sessions */
export function setupPresenceChannel(
  userId: string,
  onPresenceSync: (state: Record<string, unknown[]>) => void
) {
  const channel = supabase.channel('focus-presence', {
    config: { presence: { key: userId } },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onPresenceSync(state as Record<string, unknown[]>);
    })
    .subscribe();

  return {
    track: async (data: { category: string; started_at: string }) => {
      await channel.track({ user_id: userId, ...data });
    },
    untrack: async () => {
      await channel.untrack();
    },
    cleanup: () => {
      supabase.removeChannel(channel);
    },
  };
}

/** Fetch leaderboard from the Supabase view */
export async function fetchLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Sync] Fetch leaderboard failed:', error.message);
    return [];
  }
  return data || [];
}
