import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { usePresenceStore, ActiveFriendPresence } from '../store/presence';
import { useTheme } from '../constants/theme';

type FriendRowProps = {
  friend: ActiveFriendPresence;
};

function FriendPresenceRow({ friend }: FriendRowProps) {
  const { sendFriendReaction } = usePresenceStore();

  const handleReact = (reactionType: string) => {
    sendFriendReaction(friend.id, reactionType);
    Alert.alert('SYSTEM MESSAGE', `You sent ${reactionType} to ${friend.username}!`);
  };

  const categoryEmojis = {
    coding: '💻',
    study: '📚',
    reading: '📖'
  };

  return (
    <View className="w-full py-2.5 border-b border-[#1F2330]/40 flex-row justify-between items-center">
      {/* Profile info left side */}
      <View className="flex-row items-center gap-2.5 flex-1 pr-2">
        <View className="relative">
          <View className="w-9 h-9 rounded-xl bg-[#0A0A0F] border border-[#1F2330] items-center justify-center">
            <Text style={{ fontSize: 18 }}>{friend.avatar}</Text>
          </View>
          {/* Active Glowing Green presence dot indicator */}
          <View className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#11131A] shadow-md shadow-emerald-400" />
        </View>

        <View className="flex-1">
          <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <Text className="text-white text-xs font-black">{friend.username}</Text>
            <Text className="text-[#0DF5C4] text-[9px] font-bold">
              {categoryEmojis[friend.category] || '⏱️'} {friend.category}
            </Text>
          </View>
          <Text className="text-[#6C758A] text-[9px] font-bold mt-0.5" numberOfLines={1}>
            {friend.note || 'Focusing...'} • {friend.elapsedMins}m elapsed
          </Text>
          {friend.lastReactionReceived && (
            <Text className="text-amber-400 text-[8px] font-bold mt-0.5">
              {friend.lastReactionReceived}
            </Text>
          )}
        </View>
      </View>

      {/* Quick Reaction Action Deck */}
      <View className="flex-row gap-1">
        <Pressable 
          onPress={() => handleReact('⚡')}
          className="w-7 h-7 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/25 items-center justify-center active:bg-[#00F0FF]/25"
        >
          <Text className="text-[10px]">⚡</Text>
        </Pressable>
        <Pressable 
          onPress={() => handleReact('👍')}
          className="w-7 h-7 rounded-lg bg-[#0DF5C4]/10 border border-[#0DF5C4]/25 items-center justify-center active:bg-[#0DF5C4]/25"
        >
          <Text className="text-[10px]">👍</Text>
        </Pressable>
        <Pressable 
          onPress={() => handleReact('🔥')}
          className="w-7 h-7 rounded-lg bg-[#B77BFF]/10 border border-[#B77BFF]/25 items-center justify-center active:bg-[#B77BFF]/25"
        >
          <Text className="text-[10px]">🔥</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function LiveFocusCard() {
  const { activeColor } = useTheme();

  const { isUserActive, activeCategory, activeFriends } = usePresenceStore();

  return (
    <View className="w-full p-4 rounded-2xl bg-[#11131A] border border-[#1F2330] shadow-sm">
      {/* Header Row */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          {/* Active pulse tag */}
          <View className="w-2 h-2 rounded-full bg-[#0DF5C4] animate-pulse" />
          <Text className="text-white text-xs font-black uppercase tracking-wider">
            🟢 Friends Now Focusing
          </Text>
        </View>
        <View className="bg-[#0DF5C4]/10 border border-[#0DF5C4]/35 px-1.5 py-0.2 rounded">
          <Text className="text-[#0DF5C4] text-[7px] font-black uppercase tracking-widest">
            {activeFriends.length} Live
          </Text>
        </View>
      </View>

      {/* Self status row if currently focusing */}
      {isUserActive && (
        <View className="p-2.5 mb-3 rounded-2xl bg-[#0DF5C4]/5 border border-[#0DF5C4]/25 flex-row justify-between items-center">
          <Text className="text-[#0DF5C4] text-[9px] font-black uppercase tracking-wider">📡 Broadcasting Live Presence</Text>
          <Text className="text-white text-[9px] font-black uppercase">Category: {activeCategory}</Text>
        </View>
      )}

      {/* Friends Active list */}
      <View className="w-full">
        {activeFriends.length === 0 ? (
          <Text className="text-[#4E546A] text-[9px] italic py-2">All guild friends are currently offline.</Text>
        ) : (
          activeFriends.map((friend) => (
            <FriendPresenceRow key={friend.id} friend={friend} />
          ))
        )}
      </View>
    </View>
  );
}
