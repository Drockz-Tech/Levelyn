import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useEventsStore } from '../store/events';
import { useProfileStore } from '../store/profile';
import { useGoalsStore } from '../store/goals';
import { totalHours, calculateStreak } from '../utils/aggregates';
import { hoursByWeek } from '../features/stats/selectors';

type Props = {
  onRecordPress: () => void;
};

const GOAL_PRESETS = [
  { title: 'Code like a pro today', category: 'coding' as const, targetMinutes: 60, display: 'Code 60 mins' },
  { title: 'Deep study focus session', category: 'study' as const, targetMinutes: 45, display: 'Study 45 mins' },
  { title: 'Read and absorb knowledge', category: 'reading' as const, targetMinutes: 30, display: 'Read 30 mins' },
  { title: 'Master algorithm challenges', category: 'coding' as const, targetMinutes: 90, display: 'Code 90 mins' },
  { title: 'Review educational videos', category: 'study' as const, targetMinutes: 60, display: 'Study 60 mins' },
  { title: 'Absorb technical manuals', category: 'reading' as const, targetMinutes: 45, display: 'Read 45 mins' },
];

export default function DashboardCarousel({ onRecordPress }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 40; // home screen padding is 20 on each side

  const [activeIndex, setActiveIndex] = useState(0);
  const [presetIndex, setPresetIndex] = useState(0);

  // Core stores
  const events = useEventsStore((s) => s.events);
  const profile = useProfileStore((s) => s.profile);
  const { activeGoal, setActiveGoal, clearActiveGoal } = useGoalsStore();

  const streak = calculateStreak(events);
  const focusHours = totalHours(events);
  const completedSessions = events.filter((e) => e.endedAt).length;

  // Active theme calculations
  const activeTheme = profile?.theme || 'blue';
  const themeColors = {
    blue: { primary: '#7BE7FF', text: 'text-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10', border: 'border-[#7BE7FF]/20', hex: '#7BE7FF' },
    purple: { primary: '#B77BFF', text: 'text-[#B77BFF]', bg: 'bg-[#B77BFF]/10', border: 'border-[#B77BFF]/20', hex: '#B77BFF' },
    teal: { primary: '#0DF5C4', text: 'text-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10', border: 'border-[#0DF5C4]/20', hex: '#0DF5C4' },
  };
  const theme = themeColors[activeTheme];

  const categoryThemeColors = {
    coding: themeColors.blue,
    study: themeColors.purple,
    reading: themeColors.teal,
  };

  // Weekly stats calculations
  const weeklyFocus = hoursByWeek(events);
  const activeDaysCount = weeklyFocus.filter((h) => h > 0).length;

  // Days of the week labels ending with today
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const last7DaysLabels = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return dayNames[d.getDay()];
  });

  const getWeeklyInsight = (activeCount: number) => {
    if (activeCount >= 5) return 'Elite consistency! Focus velocity is peaking.';
    if (activeCount >= 3) return "Solid pace! You're building strong momentum.";
    if (activeCount > 0) return 'Initiate focus to accelerate your velocity!';
    return 'Systems online. Start a session to light up the grid!';
  };

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / cardWidth);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const currentPreset = GOAL_PRESETS[presetIndex];

  return (
    <View className="w-full mb-4">
      {/* Scrollable Container */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={cardWidth}
        decelerationRate="fast"
        style={{ width: cardWidth }}
      >
        {/* CARD 1: STREAK CARD */}
        <View 
          style={{ width: cardWidth }} 
          className="p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] flex-row justify-between items-center min-h-[145px] shadow-lg"
        >
          <View className="flex-1 pr-2">
            <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-wider mb-1">
              Active Focus Flame
            </Text>
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Text style={{ fontSize: 22 }}>🔥</Text>
              <Text className="text-white text-xl font-black">
                {streak > 0 ? `${streak}-Day Streak` : 'No Active Streak'}
              </Text>
            </View>
            <Text className="text-[#6C758A] text-[10px] font-semibold leading-relaxed" numberOfLines={2}>
              {streak > 0 
                ? 'Keep the combustion going! Your focus engine is running hot.'
                : 'Power down detected. Engage focus chamber to start a streak.'}
            </Text>
            <Text className="text-[9px] font-extrabold text-[#4E546A] mt-2 uppercase tracking-wide">
              Total Focus: {focusHours.toFixed(1)}h  •  {completedSessions} Logs
            </Text>
          </View>

          {/* Record Quick CTA */}
          <Pressable
            onPress={onRecordPress}
            className="px-4 py-2.5 rounded-2xl bg-[#11131A] border border-[#1F2330] flex-row items-center justify-center shadow-md active:bg-[#181A24]"
            style={{ borderColor: theme.hex }}
          >
            <Text className={`text-[12px] font-black uppercase tracking-wider ${theme.text}`}>
              Record
            </Text>
          </Pressable>
        </View>

        {/* CARD 2: GOAL SUGGESTION CARD */}
        <View 
          style={{ width: cardWidth }} 
          className="p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] justify-between min-h-[145px] py-4.5 shadow-lg"
        >
          {!activeGoal ? (
            // No Active Goal State
            <View className="flex-1 justify-between">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-wider mb-1">
                    Daily Focus Objective
                  </Text>
                  <Text className="text-white text-base font-extrabold" numberOfLines={1}>
                    {currentPreset.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <View className={`px-2 py-0.5 rounded-md ${categoryThemeColors[currentPreset.category].bg} border ${categoryThemeColors[currentPreset.category].border}`}>
                      <Text className={`text-[8px] font-black uppercase tracking-wider ${categoryThemeColors[currentPreset.category].text}`}>
                        {currentPreset.category}
                      </Text>
                    </View>
                    <Text className="text-[#6C758A] text-[10px] font-semibold">
                      Target: {currentPreset.targetMinutes} minutes
                    </Text>
                  </View>
                </View>

                {/* Shuffle Button */}
                <Pressable
                  onPress={() => setPresetIndex((prev) => (prev + 1) % GOAL_PRESETS.length)}
                  className="w-8 h-8 rounded-xl bg-[#050508]/60 border border-[#1F2330] items-center justify-center active:bg-[#1C1E26]"
                >
                  <Text style={{ fontSize: 13 }}>🔄</Text>
                </Pressable>
              </View>

              {/* Set Goal CTA */}
              <Pressable
                onPress={() => setActiveGoal(currentPreset)}
                className="w-full py-2.5 rounded-xl bg-[#181A24] border border-[#232736] items-center justify-center active:bg-[#202433]"
                style={{
                  backgroundColor: categoryThemeColors[currentPreset.category].hex,
                }}
              >
                <Text className="text-[#05040A] text-[11px] font-black uppercase tracking-widest">
                  Set Mission Goal
                </Text>
              </Pressable>
            </View>
          ) : activeGoal.completed ? (
            // Goal Completed State
            <View className="flex-1 justify-between">
              <View>
                <Text className="text-[#0DF5C4] text-[9px] font-black uppercase tracking-widest mb-0.5">
                  ✓ MISSION COMPLETE
                </Text>
                <Text className="text-white text-base font-black">
                  Daily Target Achieved! 🎉
                </Text>
                <Text className="text-[#6C758A] text-[10px] font-medium mt-1">
                  You successfully completed: "{activeGoal.title}"!
                </Text>
              </View>

              {/* Reset to set next goal */}
              <Pressable
                onPress={clearActiveGoal}
                className="w-full py-2 rounded-xl bg-[#0DF5C4]/10 border border-[#0DF5C4]/35 items-center justify-center"
              >
                <Text className="text-[#0DF5C4] text-[10px] font-extrabold uppercase tracking-wider">
                  Initialize Next Mission
                </Text>
              </Pressable>
            </View>
          ) : (
            // Active Goal Progress State
            <View className="flex-1 justify-between">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-4">
                  <Text className="text-[#FFB703] text-[9px] font-black uppercase tracking-wider mb-0.5">
                    ⚡ ACTIVE OBJECTIVE
                  </Text>
                  <Text className="text-white text-xs font-black" numberOfLines={1}>
                    {activeGoal.title}
                  </Text>
                  <Text className="text-[#6C758A] text-[9px] mt-0.5">
                    {activeGoal.currentMinutes}m of {activeGoal.targetMinutes}m complete
                  </Text>
                </View>

                {/* Abandon Goal Button */}
                <Pressable
                  onPress={clearActiveGoal}
                  className="w-6 h-6 rounded-lg bg-[#E63946]/10 border border-[#E63946]/25 items-center justify-center active:bg-[#E63946]/20"
                >
                  <Text className="text-[#E63946] text-[10px] font-bold">✕</Text>
                </Pressable>
              </View>

              {/* Progress HUD element */}
              <View className="w-full">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[8px] font-bold text-[#6C758A] uppercase">Mission Progress</Text>
                  <Text className="text-[9px] font-black text-white">
                    {Math.min(100, Math.round((activeGoal.currentMinutes / activeGoal.targetMinutes) * 100))}%
                  </Text>
                </View>
                {/* Visual Bar */}
                <View className="h-2 w-full bg-[#050508] rounded-full overflow-hidden border border-[#1F2330]">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (activeGoal.currentMinutes / activeGoal.targetMinutes) * 100)}%`,
                      backgroundColor: categoryThemeColors[activeGoal.category].hex,
                    }}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* CARD 3: WEEKLY SNAPSHOT CARD */}
        <View 
          style={{ width: cardWidth }} 
          className="p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] justify-between min-h-[145px] py-4.5 shadow-lg"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-wider mb-0.5">
                Weekly Summary HUD
              </Text>
              <Text className="text-white text-base font-black">
                Active <Text style={{ color: theme.hex }}>{activeDaysCount}/7 Days</Text>
              </Text>
            </View>
            <View className="bg-[#181A24] px-2 py-1 rounded-lg border border-[#232736]">
              <Text className="text-white text-[9px] font-black uppercase tracking-wide">
                SYS ONLINE
              </Text>
            </View>
          </View>

          {/* 7-Day Performance Grid */}
          <View className="flex-row justify-between items-center gap-1 my-1">
            {weeklyFocus.map((hours, idx) => {
              const isActive = hours > 0;
              const label = last7DaysLabels[idx];
              return (
                <View
                  key={idx}
                  className="flex-1 items-center"
                >
                  <View
                    className={`w-7 h-7 rounded-xl items-center justify-center border ${
                      isActive 
                        ? `${theme.bg} ${theme.border}` 
                        : 'bg-[#050508] border-[#1F2330]'
                    }`}
                    style={isActive ? { borderColor: theme.hex } : undefined}
                  >
                    <Text className={`text-[10px] font-black ${isActive ? theme.text : 'text-[#4E546A]'}`}>
                      {label}
                    </Text>
                  </View>
                  {/* Hours badge */}
                  <Text className="text-[7px] text-[#6C758A] font-bold mt-1">
                    {hours > 0 ? `${hours.toFixed(1)}h` : '0h'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Quick Motivational Insight */}
          <Text className="text-[#6C758A] text-[9px] font-semibold italic text-center" numberOfLines={1}>
            “{getWeeklyInsight(activeDaysCount)}”
          </Text>
        </View>
      </ScrollView>

      {/* Pagination Indicators / Swipe Dots */}
      <View className="flex-row justify-center items-center gap-1.5 mt-3.5">
        {[0, 1, 2].map((idx) => {
          const isActive = idx === activeIndex;
          return (
            <View
              key={idx}
              className={`rounded-full ${
                isActive 
                  ? 'w-5 h-1.5' 
                  : 'w-1.5 h-1.5 bg-[#1F2330]'
              }`}
              style={isActive ? { backgroundColor: theme.hex } : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}
