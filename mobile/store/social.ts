import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  type: 'session' | 'levelup' | 'achievement';
  category?: 'coding' | 'study' | 'reading';
  duration?: number; // in minutes
  xp?: number;
  level?: number;
  streak?: number;
  note?: string;
  createdAt: string;
  reactions: {
    respect: number;
    energy: number;
    keepgoing: number;
  };
  comments: Comment[];
}

export interface SuggestedUser {
  id: string;
  username: string;
  avatar: string;
  title: string;
  jobClass: string;
  level: number;
  isPrivate: boolean;
}

interface SocialState {
  activities: FeedItem[];
  following: string[]; // user IDs
  followers: string[]; // user IDs
  suggestedUsers: SuggestedUser[];
  pendingFollowRequestsSent: string[]; // user IDs of private profiles we requested to follow
  incomingFollowRequests: { id: string; follower_id: string; username: string; avatar: string }[]; // requests we received
  loading: boolean;
  
  // Actions
  fetchSuggestedUsers: () => Promise<void>;
  fetchFriendsNetwork: (myId: string) => Promise<void>;
  followUser: (myId: string, targetId: string) => Promise<void>;
  unfollowUser: (myId: string, targetId: string) => Promise<void>;
  acceptFollowRequest: (myId: string, requestId: string, followerId: string) => Promise<void>;
  rejectFollowRequest: (myId: string, requestId: string) => Promise<void>;
  fetchFeed: (myId: string) => Promise<void>;
  addActivity: (userId: string, activity: {
    type: 'session' | 'levelup' | 'achievement';
    category?: 'coding' | 'study' | 'reading';
    duration?: number;
    xp?: number;
    level?: number;
    note?: string;
  }) => Promise<void>;
  addReaction: (userId: string, activityId: string, type: 'respect' | 'energy' | 'keepgoing') => Promise<void>;
  addComment: (userId: string, activityId: string, text: string) => Promise<void>;
  subscribeToFeedRealtime: (myId: string) => () => void;
  resetSocial: () => void;
}

function mapAvatarToEmoji(avatar: string): string {
  const mapping: Record<string, string> = {
    astronaut: '🧑‍🚀',
    rocket: '🚀',
    cypher: '🕵️',
    phoenix: '🔥',
    '🔥': '🔥',
    '⚔️': '⚔️',
    '🛡️': '🛡️',
    '🦅': '🦅',
    '✨': '✨'
  };
  return mapping[avatar] || '🧑‍🚀';
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      activities: [],
      following: [],
      followers: [],
      suggestedUsers: [],
      pendingFollowRequestsSent: [],
      incomingFollowRequests: [],
      loading: false,

      fetchSuggestedUsers: async () => {
        set({ loading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar, title, job_class, level, is_private')
            .limit(20);

          if (error) throw error;
          if (data) {
            const mapped: SuggestedUser[] = data
              .filter((p: any) => p.id !== user?.id)
              .map((p: any) => ({
                id: p.id,
                username: p.display_name || p.username || 'Hunter',
                avatar: mapAvatarToEmoji(p.avatar || 'astronaut'),
                title: p.title || 'Focus Cadet',
                jobClass: p.job_class || 'Novice Hunter',
                level: p.level || 1,
                isPrivate: p.is_private ?? false
              }));
            set({ suggestedUsers: mapped });
          }
        } catch (e) {
          console.error('[SocialStore] fetchSuggestedUsers failed:', e);
        } finally {
          set({ loading: false });
        }
      },

      fetchFriendsNetwork: async (myId) => {
        try {
          // 1. Fetch Following
          const { data: followingRows, error: followingError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', myId);

          if (followingError) throw followingError;
          const followingIds = (followingRows || []).map((f) => f.following_id);

          // 2. Fetch Followers
          const { data: followerRows, error: followerError } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', myId);

          if (followerError) throw followerError;
          const followerIds = (followerRows || []).map((f) => f.follower_id);

          // 3. Fetch Outgoing Follow Requests
          const { data: outgoingRows } = await supabase
            .from('follow_requests')
            .select('following_id')
            .eq('follower_id', myId)
            .eq('status', 'pending');
          const outgoingIds = (outgoingRows || []).map(r => r.following_id);

          // 4. Fetch Incoming Follow Requests
          const { data: incomingRows } = await supabase
            .from('follow_requests')
            .select(`
              id,
              follower_id,
              profiles:follower_id (username, display_name, avatar)
            `)
            .eq('following_id', myId)
            .eq('status', 'pending');

          const incomingMapped = (incomingRows || []).map((r: any) => ({
            id: r.id,
            follower_id: r.follower_id,
            username: r.profiles?.display_name || r.profiles?.username || 'Hunter',
            avatar: mapAvatarToEmoji(r.profiles?.avatar || 'astronaut')
          }));

          set({ 
            following: followingIds, 
            followers: followerIds,
            pendingFollowRequestsSent: outgoingIds,
            incomingFollowRequests: incomingMapped
          });
        } catch (e) {
          console.error('[SocialStore] fetchFriendsNetwork failed:', e);
        }
      },

      followUser: async (myId, targetId) => {
        try {
          // Find target user details in suggestedUsers
          const target = get().suggestedUsers.find(u => u.id === targetId);
          const isPrivate = target?.isPrivate ?? false;

          if (isPrivate) {
            // Send follow request
            const { error } = await supabase
              .from('follow_requests')
              .insert({ follower_id: myId, following_id: targetId, status: 'pending' });
            if (error) throw error;
            set({ pendingFollowRequestsSent: [...get().pendingFollowRequestsSent, targetId] });
          } else {
            // Direct follow
            const { error } = await supabase
              .from('follows')
              .insert({ follower_id: myId, following_id: targetId });
            if (error) throw error;
            set({ following: [...get().following, targetId] });
          }
        } catch (e) {
          console.error('[SocialStore] followUser failed:', e);
        }
      },

      unfollowUser: async (myId, targetId) => {
        try {
          // Check if it is a pending request
          if (get().pendingFollowRequestsSent.includes(targetId)) {
            const { error } = await supabase
              .from('follow_requests')
              .delete()
              .match({ follower_id: myId, following_id: targetId });
            if (error) throw error;
            set({ pendingFollowRequestsSent: get().pendingFollowRequestsSent.filter(id => id !== targetId) });
          } else {
            const { error } = await supabase
              .from('follows')
              .delete()
              .match({ follower_id: myId, following_id: targetId });
            if (error) throw error;
            set({ following: get().following.filter((id) => id !== targetId) });
          }
        } catch (e) {
          console.error('[SocialStore] unfollowUser failed:', e);
        }
      },

      acceptFollowRequest: async (myId, requestId, followerId) => {
        try {
          // 1. Add follow connection
          const { error: followError } = await supabase
            .from('follows')
            .insert({ follower_id: followerId, following_id: myId });
          if (followError) throw followError;

          // 2. Delete request
          const { error: deleteError } = await supabase
            .from('follow_requests')
            .delete()
            .eq('id', requestId);
          if (deleteError) throw deleteError;

          // 3. Update state
          set({
            followers: [...get().followers, followerId],
            incomingFollowRequests: get().incomingFollowRequests.filter(r => r.id !== requestId)
          });
        } catch (e) {
          console.error('[SocialStore] acceptFollowRequest failed:', e);
        }
      },

      rejectFollowRequest: async (myId, requestId) => {
        try {
          const { error } = await supabase
            .from('follow_requests')
            .delete()
            .eq('id', requestId);
          if (error) throw error;

          set({
            incomingFollowRequests: get().incomingFollowRequests.filter(r => r.id !== requestId)
          });
        } catch (e) {
          console.error('[SocialStore] rejectFollowRequest failed:', e);
        }
      },

      fetchFeed: async (myId) => {
        try {
          // Fetch activities of user and followed friends
          const { data: activitiesData, error } = await supabase
            .from('activities')
            .select(`
              *,
              profiles:user_id (id, username, avatar, level)
            `)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          if (activitiesData) {
            // Fetch all reactions
            const { data: reactionsData } = await supabase
              .from('reactions')
              .select('activity_id, type, user_id');

            // Fetch comments
            const { data: commentsData } = await supabase
              .from('activity_comments')
              .select(`
                *,
                profiles:user_id (username)
              `)
              .order('created_at', { ascending: true });

            const mapped: FeedItem[] = activitiesData.map((act: any) => {
              const actReactions = (reactionsData || []).filter((r: any) => r.activity_id === act.id);
              const respectCount = actReactions.filter((r: any) => r.type === 'respect').length;
              const energyCount = actReactions.filter((r: any) => r.type === 'energy').length;
              const keepgoingCount = actReactions.filter((r: any) => r.type === 'keepgoing').length;

              const actComments = (commentsData || [])
                .filter((c: any) => c.activity_id === act.id)
                .map((c: any) => ({
                  id: c.id,
                  username: c.profiles?.username || 'Anonymous Hunter',
                  text: c.text,
                  createdAt: c.created_at
                }));

              return {
                id: act.id,
                userId: act.user_id,
                username: act.profiles?.username || 'Focus Cadet',
                avatar: mapAvatarToEmoji(act.profiles?.avatar || 'astronaut'),
                type: act.type as 'session' | 'levelup' | 'achievement',
                category: act.category as any,
                duration: act.duration || 0,
                xp: act.xp || 0,
                level: act.level || act.profiles?.level || 1,
                note: act.note,
                createdAt: act.created_at,
                reactions: {
                  respect: respectCount,
                  energy: energyCount,
                  keepgoing: keepgoingCount
                },
                comments: actComments
              };
            });

            set({ activities: mapped });
          }
        } catch (e) {
          console.error('[SocialStore] fetchFeed failed:', e);
        }
      },

      addActivity: async (userId, activity) => {
        try {
          const { error } = await supabase
            .from('activities')
            .insert({
              user_id: userId,
              type: activity.type,
              category: activity.category,
              duration: activity.duration,
              xp: activity.xp,
              level: activity.level,
              note: activity.note
            });

          if (error) throw error;
        } catch (e) {
          console.error('[SocialStore] addActivity failed:', e);
        }
      },

      addReaction: async (userId, activityId, type) => {
        try {
          const { error } = await supabase
            .from('reactions')
            .insert({
              activity_id: activityId,
              user_id: userId,
              type: type
            });
          
          if (error && !error.message.includes('unique')) throw error;
          
          // Update locally
          set({
            activities: get().activities.map((act) => {
              if (act.id !== activityId) return act;
              return {
                ...act,
                reactions: {
                  ...act.reactions,
                  [type]: act.reactions[type] + 1
                }
              };
            })
          });
        } catch (e) {
          console.error('[SocialStore] addReaction failed:', e);
        }
      },

      addComment: async (userId, activityId, text) => {
        try {
          const { data, error } = await supabase
            .from('activity_comments')
            .insert({
              activity_id: activityId,
              user_id: userId,
              text: text
            })
            .select(`
              *,
              profiles:user_id (username)
            `)
            .single();

          if (error) throw error;

          if (data) {
            const newComment: Comment = {
              id: data.id,
              username: data.profiles?.username || 'Anonymous Hunter',
              text: data.text,
              createdAt: data.created_at
            };

            set({
              activities: get().activities.map((act) => {
                if (act.id !== activityId) return act;
                return {
                  ...act,
                  comments: [...act.comments, newComment]
                };
              })
            });
          }
        } catch (e) {
          console.error('[SocialStore] addComment failed:', e);
        }
      },

      subscribeToFeedRealtime: (myId) => {
        const activityChannel = supabase
          .channel('public:activities')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
            get().fetchFeed(myId);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
            get().fetchFeed(myId);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_comments' }, () => {
            get().fetchFeed(myId);
          })
          .subscribe();

        return () => {
          supabase.removeChannel(activityChannel);
        };
      },

      resetSocial: () => set({
        activities: [],
        following: [],
        followers: [],
        suggestedUsers: [],
        pendingFollowRequestsSent: [],
        incomingFollowRequests: []
      })
    }),
    {
      name: 'levelyn:social',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
