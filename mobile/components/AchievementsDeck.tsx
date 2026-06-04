import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../utils/achievements';
import { useEventsStore } from '../store/events';
import { useProfileStore } from '../store/profile';
import { useAchievementsStore } from '../store/achievements';
import { totalXp, calculateStreak } from '../utils/aggregates';

export default function AchievementsDeck() {
  const events = useEventsStore((s) => s.events);
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const customAchievements = useAchievementsStore((s) => s.customAchievements);
  const deleteCustomAchievement = useAchievementsStore((s) => s.deleteCustomAchievement);
  const unlockedIdsInStore = useAchievementsStore((s) => s.unlockedIds);

  const xp = totalXp(events);
  const streak = calculateStreak(events);
  
  // Reconcile dynamic and store-based unlocks
  const standardUnlocked = getUnlockedAchievements(events, streak, xp);
  const unlockedSet = new Set([...unlockedIdsInStore, ...standardUnlocked]);

  const themeColors = {
    blue: '#7BE7FF',
    purple: '#B77BFF',
    teal: '#0DF5C4',
  };
  const activeColor = themeColors[activeTheme];

  // Merge standard and custom achievements
  const allAchievements = [...ACHIEVEMENTS, ...customAchievements];

  const unlockedCount = allAchievements.filter(ach => unlockedSet.has(ach.id)).length;
  const totalCount = allAchievements.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Pagination state
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(allAchievements.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedItems = allAchievements.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Compute completed sessions count for progress indicators
  const completedSessionsCount = events.filter((e) => e.endedAt).length;

  function getCustomProgress(ach: any) {
    if (!ach.isCustom) return null;
    let current = 0;
    if (ach.targetType === 'sessions') current = completedSessionsCount;
    else if (ach.targetType === 'xp') current = xp;
    else if (ach.targetType === 'streak') current = streak;
    return { current, target: ach.targetValue };
  }

  return (
    <View className="w-full my-4">
      {/* Deck Header & Completion Stats */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white text-sm font-extrabold tracking-wider uppercase">
          Focus Milestones
        </Text>
        <Text className="text-xs font-bold tracking-wide" style={{ color: activeColor }}>
          {unlockedCount}/{totalCount} <Text className="text-[#4E546A] font-semibold">({pct}%)</Text>
        </Text>
      </View>

      {/* Dynamic Progress indicator */}
      <View className="h-1.5 w-full bg-[#050508] rounded-full mb-5 overflow-hidden border border-[#1F2330]">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: activeColor }}
        />
      </View>

      {/* Grid Layout (exactly 6 items per page) */}
      <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
        {paginatedItems.map((ach) => {
          const isUnlocked = unlockedSet.has(ach.id);
          const isSecret = ach.isHidden && !isUnlocked;
          const isCustom = !!(ach as any).isCustom;

          const color = isUnlocked ? ach.themeColor : '#232736';

          const displayIcon = isSecret ? '🔒' : ach.icon;
          const displayTitle = isSecret ? 'Secret Milestone' : ach.title;
          const displayDescription = isSecret
            ? '??? Complete hidden criteria to identify this quest.'
            : ach.description;

          const progress = getCustomProgress(ach);

          return (
            <View
              key={ach.id}
              className="w-[48.5%] p-4 rounded-2xl bg-[#11131A] border items-center justify-between min-h-[175px] relative"
              style={{
                borderColor: isUnlocked ? ach.themeColor : '#1F2330',
                shadowColor: isUnlocked ? ach.themeColor : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isUnlocked ? 0.25 : 0,
                shadowRadius: 10,
                elevation: isUnlocked ? 3 : 0,
                opacity: isUnlocked ? 1 : 0.55,
              }}
            >
              {/* Optional Delete Button for Custom Quests */}
              {isCustom && (
                <Pressable
                  onPress={() => deleteCustomAchievement(ach.id)}
                  hitSlop={8}
                  className="absolute top-2.5 right-2.5 w-6 h-6 items-center justify-center rounded-md bg-[#0A0A0F] border border-[#E63946]/35 active:bg-[#E63946]/20 z-10"
                >
                  <Text className="text-[#E63946] text-[10px] font-black">✕</Text>
                </Pressable>
              )}

              {/* Badge Icon circle */}
              <View
                className="w-11 h-11 rounded-full items-center justify-center mb-2.5 border"
                style={{
                  backgroundColor: isUnlocked ? `${ach.themeColor}15` : '#0A0A0F',
                  borderColor: isUnlocked ? ach.themeColor : '#1F2330',
                }}
              >
                <Text style={{ fontSize: 20 }}>{displayIcon}</Text>
              </View>

              {/* Title & Description */}
              <View className="items-center w-full flex-1 justify-center">
                <Text
                  className="text-white text-xs font-black text-center mb-1 tracking-wide uppercase max-h-9 overflow-hidden"
                  numberOfLines={2}
                  style={isUnlocked ? { color: ach.themeColor } : {}}
                >
                  {displayTitle}
                </Text>
                <Text
                  className="text-[#6C758A] text-[9px] text-center font-semibold leading-relaxed px-0.5"
                  numberOfLines={3}
                >
                  {displayDescription}
                </Text>
              </View>

              {/* Progress Tracker for Custom Locked Milestones */}
              {progress && !isUnlocked && (
                <Text className="text-[#B77BFF] text-[8px] font-black mt-2 tracking-wide">
                  PROGRESS: {progress.current} / {progress.target}
                </Text>
              )}

              {/* Locked/Unlocked HUD Status */}
              <View
                className="mt-2 px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: isUnlocked ? `${ach.themeColor}10` : '#050508',
                  borderColor: isUnlocked ? `${ach.themeColor}30` : '#1F2330',
                }}
              >
                <Text
                  className="text-[7.5px] font-black uppercase tracking-widest"
                  style={{ color: isUnlocked ? ach.themeColor : '#4E546A' }}
                >
                  {isUnlocked ? 'COMPLETED' : 'LOCKED'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Cybernetic Pagination Control Bar */}
      {totalPages > 1 && (
        <View className="flex-row items-center justify-between w-full bg-[#0A0A0F] py-2 px-3 rounded-xl border border-[#1F2330]">
          {/* Previous Page Button */}
          <Pressable
            disabled={currentPage === 0}
            onPress={() => setPage(currentPage - 1)}
            className={`py-2 px-3 rounded-lg border ${
              currentPage === 0
                ? 'border-transparent bg-transparent'
                : 'border-[#1F2330] bg-[#11131A] active:bg-[#181A24]'
            }`}
          >
            <Text
              className="text-[10px] font-black tracking-wider"
              style={{ color: currentPage === 0 ? '#2E3345' : activeColor }}
            >
              ← PREV
            </Text>
          </Pressable>

          {/* Page Display */}
          <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest">
            PAGE {currentPage + 1} OF {totalPages}
          </Text>

          {/* Next Page Button */}
          <Pressable
            disabled={currentPage === totalPages - 1}
            onPress={() => setPage(currentPage + 1)}
            className={`py-2 px-3 rounded-lg border ${
              currentPage === totalPages - 1
                ? 'border-transparent bg-transparent'
                : 'border-[#1F2330] bg-[#11131A] active:bg-[#181A24]'
            }`}
          >
            <Text
              className="text-[10px] font-black tracking-wider"
              style={{ color: currentPage === totalPages - 1 ? '#2E3345' : activeColor }}
            >
              NEXT →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
