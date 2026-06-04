import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useLeaderboardStore, LeaderboardUser } from '../store/leaderboard';
import { useProfileStore } from '../store/profile';

type RowProps = {
  user: LeaderboardUser;
  rank: number;
  activeColor: string;
  displayType: 'xp' | 'streak' | 'coding' | 'study';
};

function LeaderboardRow({ user, rank, activeColor, displayType }: RowProps) {
  // Top 3 Highlights styling
  const isTop3 = rank <= 3;
  const rankColors = {
    1: { bg: 'bg-[#FFD700]/10', border: 'border-[#FFD700]/50', text: 'text-[#FFD700]', label: '🥇' },
    2: { bg: 'bg-[#C0C0C0]/10', border: 'border-[#C0C0C0]/50', text: 'text-[#C0C0C0]', label: '🥈' },
    3: { bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/50', text: 'text-[#CD7F32]', label: '🥉' }
  };
  const highlight = isTop3 ? rankColors[rank as 1 | 2 | 3] : null;

  // Determine numeric display value
  const getDisplayVal = () => {
    if (displayType === 'xp') return `${user.totalXp} XP`;
    if (displayType === 'streak') return `${user.streak} Days`;
    if (displayType === 'coding') return `${user.codingXp} XP`;
    if (displayType === 'study') return `${user.studyXp} XP`;
    return `${user.totalXp} XP`;
  };

  // Determine rank badge
  const getRankBadge = () => {
    if (user.totalXp > 20000) return { text: 'S-RANK', color: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-400/10' };
    if (user.totalXp > 10000) return { text: 'A-RANK', color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' };
    if (user.totalXp > 5000) return { text: 'B-RANK', color: 'text-[#B77BFF]', border: 'border-[#B77BFF]/30', bg: 'bg-[#B77BFF]/10' };
    return { text: 'C-RANK', color: 'text-[#6C758A]', border: 'border-[#6C758A]/30', bg: 'bg-[#6C758A]/10' };
  };
  const badge = getRankBadge();

  return (
    <View 
      className={`w-full p-3.5 mb-2.5 rounded-2xl flex-row justify-between items-center ${
        highlight ? `${highlight.bg} border-2 ${highlight.border}` : 'bg-[#11131A] border border-[#1F2330]'
      }`}
    >
      {/* Left side: Rank + Avatar + Name */}
      <View className="flex-row items-center gap-3">
        <View className="w-6 items-center">
          {highlight ? (
            <Text style={{ fontSize: 16 }}>{highlight.label}</Text>
          ) : (
            <Text className="text-[#6C758A] text-xs font-black">#{rank}</Text>
          )}
        </View>

        <View className="w-8 h-8 rounded-xl bg-[#0A0A0F] border border-[#1F2330] items-center justify-center">
          <Text style={{ fontSize: 16 }}>{user.avatar}</Text>
        </View>

        <View>
          <Text className="text-white text-xs font-black tracking-wide">{user.username}</Text>
          <Text className="text-[#6C758A] text-[9px] font-bold mt-0.5">{user.title}</Text>
        </View>
      </View>

      {/* Right side: Badge + XP Score */}
      <View className="items-end gap-1">
        <View className={`px-1.5 py-0.2 rounded border ${badge.bg} ${badge.border}`}>
          <Text className={`text-[7px] font-black tracking-widest ${badge.color}`}>
            {badge.text}
          </Text>
        </View>
        <Text className="text-white text-[11px] font-black" style={{ color: highlight ? highlight.text : activeColor }}>
          {getDisplayVal()}
        </Text>
      </View>
    </View>
  );
}

export default function LeaderboardCard() {
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';
  
  const themeColors = {
    blue: '#7BE7FF',
    purple: '#B77BFF',
    teal: '#0DF5C4'
  };
  const activeColor = themeColors[activeTheme];

  const { getRankings, fetchGlobalLeaderboard } = useLeaderboardStore();
  
  // Tabs for sorting and friendship filtering
  const [activeSort, setActiveSort] = useState<'totalXp' | 'codingXp' | 'studyXp' | 'streak'>('totalXp');
  const [friendsOnly, setFriendsOnly] = useState(false);

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  const rankings = getRankings(activeSort, friendsOnly);

  return (
    <View className="w-full">
      {/* Scope Toggles (Friends vs Global) */}
      <View className="flex-row bg-[#11131A] p-1 rounded-2xl border border-[#1F2330] mb-4">
        <Pressable 
          onPress={() => setFriendsOnly(false)}
          className={`flex-1 py-2 rounded-xl items-center justify-center ${!friendsOnly ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
        >
          <Text className={`text-[10px] font-black uppercase tracking-wider ${!friendsOnly ? 'text-white' : 'text-[#6C758A]'}`}>
            🌍 Global Rankings
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => setFriendsOnly(true)}
          className={`flex-1 py-2 rounded-xl items-center justify-center ${friendsOnly ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
        >
          <Text className={`text-[10px] font-black uppercase tracking-wider ${friendsOnly ? 'text-white' : 'text-[#6C758A]'}`}>
            👥 Friends Only
          </Text>
        </Pressable>
      </View>

      {/* Sort Categories Pill Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4 w-full">
        {(['totalXp', 'codingXp', 'studyXp', 'streak'] as const).map((sort) => {
          const isSelected = activeSort === sort;
          const labelMap = { totalXp: '🏆 Total XP', codingXp: '💻 Coding XP', studyXp: '📚 Study XP', streak: '🔥 Streak' };
          return (
            <Pressable
              key={sort}
              onPress={() => setActiveSort(sort)}
              className="px-3 py-1.5 rounded-full border mr-2 items-center justify-center"
              style={{
                borderColor: isSelected ? activeColor : '#1F2330',
                backgroundColor: isSelected ? `${activeColor}15` : '#11131A',
              }}
            >
              <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: isSelected ? activeColor : '#6C758A' }}>
                {labelMap[sort]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Rankings List */}
      <View className="w-full">
        {rankings.length === 0 ? (
          <Text className="text-[#4E546A] text-[10px] italic text-center py-8">No hunters found in this ranking tier.</Text>
        ) : (
          rankings.map((user, idx) => (
            <LeaderboardRow 
              key={user.id} 
              user={user} 
              rank={idx + 1} 
              activeColor={activeColor} 
              displayType={activeSort === 'totalXp' ? 'xp' : activeSort === 'streak' ? 'streak' : activeSort === 'codingXp' ? 'coding' : 'study'}
            />
          ))
        )}
      </View>
    </View>
  );
}
