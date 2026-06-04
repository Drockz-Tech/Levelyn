import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Animated } from 'react-native';
import { useSocialStore, FeedItem } from '../store/social';
import { useProfileStore } from '../store/profile';
import { useAuth } from '../lib/AuthContext';

type FeedCardProps = {
  item: FeedItem;
};

function ActivityCard({ item }: FeedCardProps) {
  const profile = useProfileStore((s) => s.profile);
  const { user } = useAuth();
  const activeTheme = profile?.theme || 'blue';
  
  const themeColors = {
    blue: '#7BE7FF',
    purple: '#B77BFF',
    teal: '#0DF5C4'
  };
  const activeColor = themeColors[activeTheme];

  const { addReaction, addComment } = useSocialStore();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Reaction buttons logic
  const handleReact = (type: 'respect' | 'energy' | 'keepgoing') => {
    if (!user) return;
    addReaction(user.id, item.id, type);
  };

  const handleSendComment = () => {
    if (!user || !commentText.trim()) return;
    addComment(user.id, item.id, commentText.trim());
    setCommentText('');
  };

  const categoryColors = {
    coding: { border: 'border-[#7BE7FF]/35', bg: 'bg-[#7BE7FF]/10', text: 'text-[#7BE7FF]' },
    study: { border: 'border-[#B77BFF]/35', bg: 'bg-[#B77BFF]/10', text: 'text-[#B77BFF]' },
    reading: { border: 'border-[#0DF5C4]/35', bg: 'bg-[#0DF5C4]/10', text: 'text-[#0DF5C4]' }
  };
  const catStyle = item.category ? categoryColors[item.category] : null;

  // Format creation time
  const timeStr = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <View 
      className="w-full p-4 mb-4 rounded-3xl bg-[#11131A] border border-[#1F2330]"
      style={{
        shadowColor: activeColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }}
    >
      {/* Header Profile Row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2.5">
          <View className="w-10 h-10 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] items-center justify-center">
            <Text style={{ fontSize: 20 }}>{item.avatar}</Text>
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-white text-xs font-black tracking-wide">{item.username}</Text>
              {item.level && (
                <View className="px-1.5 py-0.2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded">
                  <Text className="text-[#00F0FF] text-[7px] font-black">LV {item.level}</Text>
                </View>
              )}
            </View>
            <Text className="text-[#4E546A] text-[9px] font-bold mt-0.5">
              {dateStr} • {timeStr}
            </Text>
          </View>
        </View>

        {/* Action Type Badge Tag */}
        <View className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
          <Text className="text-white text-[7px] font-black uppercase tracking-widest">
            {item.type}
          </Text>
        </View>
      </View>

      {/* Dynamic Content Segment */}
      {item.type === 'session' && (
        <View className="mb-2">
          <View className="flex-row items-center gap-2 mb-2 flex-wrap">
            {catStyle && (
              <View className={`px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.border}`}>
                <Text className={`text-[8px] font-black uppercase tracking-wider ${catStyle.text}`}>
                  {item.category}
                </Text>
              </View>
            )}
            <Text className="text-white text-xs font-black">
              Focused for {item.duration}m
            </Text>
            {item.xp && (
              <Text className="text-emerald-400 text-xs font-black">
                +{item.xp} XP
              </Text>
            )}
          </View>
        </View>
      )}

      {item.note && (
        <Text className="text-[#A8B0C2] text-xs font-semibold leading-relaxed mb-3 italic">
          “{item.note}”
        </Text>
      )}

      {/* Metrics Row (Streak/LevelUp details) */}
      {item.type === 'levelup' && item.level && (
        <View className="mb-3 p-2.5 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] flex-row justify-between items-center">
          <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-wider">Levelyn Rank</Text>
          <Text className="text-[#00F0FF] text-xs font-black">S-Rank Level {item.level}</Text>
        </View>
      )}

      {/* Interactions Action Deck */}
      <View className="flex-row justify-between items-center pt-3 border-t border-[#1F2330]/50">
        <View className="flex-row gap-1.5">
          {/* Respect Button */}
          <Pressable 
            onPress={() => handleReact('respect')} 
            className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#181A24] border border-[#1F2330] active:bg-[#1F2330]"
          >
            <Text className="text-[10px]">👍</Text>
            <Text className="text-[#A8B0C2] text-[9px] font-black">{item.reactions.respect}</Text>
          </Pressable>

          {/* Energy Button */}
          <Pressable 
            onPress={() => handleReact('energy')} 
            className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#181A24] border border-[#1F2330] active:bg-[#1F2330]"
          >
            <Text className="text-[10px]">⚡</Text>
            <Text className="text-[#A8B0C2] text-[9px] font-black">{item.reactions.energy}</Text>
          </Pressable>

          {/* Keepgoing Button */}
          <Pressable 
            onPress={() => handleReact('keepgoing')} 
            className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#181A24] border border-[#1F2330] active:bg-[#1F2330]"
          >
            <Text className="text-[10px]">🔥</Text>
            <Text className="text-[#A8B0C2] text-[9px] font-black">{item.reactions.keepgoing}</Text>
          </Pressable>
        </View>

        {/* Toggle Comments Trigger */}
        <Pressable 
          onPress={() => setShowComments(!showComments)}
          className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 active:bg-white/10"
        >
          <Text className="text-[#A8B0C2] text-[9px] font-black uppercase tracking-wider">
            💬 Comments ({item.comments.length})
          </Text>
        </Pressable>
      </View>

      {/* Expandable comments board */}
      {showComments && (
        <View className="mt-3 pt-3 border-t border-[#1F2330]/50">
          {item.comments.length === 0 ? (
            <Text className="text-[#4E546A] text-[9px] italic mb-3">No tactical reports logged in comments feed.</Text>
          ) : (
            item.comments.map((comm) => (
              <View key={comm.id} className="mb-2 p-2 rounded-xl bg-[#0A0A0F] border border-[#181A24]">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#00F0FF] text-[9px] font-black">{comm.username}</Text>
                  <Text className="text-[#4E546A] text-[7px] font-bold">
                    {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text className="text-white text-[10px] font-semibold">{comm.text}</Text>
              </View>
            ))
          )}

          {/* Input field overlay */}
          <View className="flex-row gap-2 mt-2">
            <TextInput
              placeholder="Transmit comment log..."
              placeholderTextColor="#4E546A"
              value={commentText}
              onChangeText={setCommentText}
              maxLength={120}
              className="flex-1 bg-[#050B14] border border-[#1F2330] rounded-xl px-3 py-1.5 text-white text-[11px] font-semibold"
            />
            <Pressable 
              onPress={handleSendComment}
              className="px-3 rounded-xl bg-[#11131A] border border-[#1F2330] items-center justify-center active:bg-[#181A24]"
            >
              <Text className="text-[#00F0FF] text-[9px] font-black uppercase">Send</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

type Props = {
  limit?: number;
};

export default function ActivityFeed({ limit }: Props) {
  const { user } = useAuth();
  const { activities, following, fetchFeed, subscribeToFeedRealtime } = useSocialStore();
  const profile = useProfileStore((s) => s.profile);
  
  useEffect(() => {
    if (user) {
      fetchFeed(user.id);
      const unsubscribe = subscribeToFeedRealtime(user.id);
      return () => unsubscribe();
    }
  }, [user]);

  // Filter activities: include my activities plus followed friends
  const myUsername = profile?.username || 'Focus Cadet';
  const displayedActivities = activities.filter(
    (act) => act.username === myUsername || following.includes(act.userId)
  );

  const sliced = limit ? displayedActivities.slice(0, limit) : displayedActivities;

  return (
    <View className="w-full">
      {sliced.length === 0 ? (
        <View className="w-full p-8 rounded-3xl bg-[#11131A]/40 border border-[#1F2330]/50 items-center justify-center">
          <Text style={{ fontSize: 24 }} className="mb-2">📡</Text>
          <Text className="text-[#6C758A] text-xs font-black uppercase tracking-widest text-center mb-1">
            Feed transmission empty
          </Text>
          <Text className="text-[#4E546A] text-[10px] text-center">
            Follow S-Rank hunters in the People Hub or start focusing to populate the feed!
          </Text>
        </View>
      ) : (
        sliced.map((act) => <ActivityCard key={act.id} item={act} />)
      )}
    </View>
  );
}
