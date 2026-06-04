import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useEventsStore } from '../store/events';
import { useTheme, SURFACE } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'all' | 'coding' | 'study' | 'reading';
  targetMinutes: number;
  rewardXp: number;
  badge: string;
}

const CHALLENGES_POOL: Challenge[] = [
  {
    id: 'ch-monarch-code',
    title: 'Monarch of Code',
    description: 'Devote yourself to S-Rank code bases. Accumulate focus hours in Coding.',
    category: 'coding',
    targetMinutes: 180,
    rewardXp: 300,
    badge: '💻 S-Monarch'
  },
  {
    id: 'ch-scholar-ascent',
    title: 'Scholarly Dedication',
    description: 'Surmount structural theory and engineering concepts. Accumulate Study focus.',
    category: 'study',
    targetMinutes: 120,
    rewardXp: 200,
    badge: '📚 Archmage'
  },
  {
    id: 'ch-iron-focus',
    title: 'Iron Mind Ascent',
    description: 'Achieve total focus absorption across any and all categories.',
    category: 'all',
    targetMinutes: 300,
    rewardXp: 500,
    badge: '🧠 Unyielding'
  }
];

export default function ChallengesScreen() {
  const { activeColor } = useTheme();
  const events = useEventsStore((s) => s.events);

  const getProgressMins = (category: 'all' | 'coding' | 'study' | 'reading') => {
    const completed = events.filter((e) => e.endedAt);
    let totalSeconds = 0;
    
    completed.forEach((ev) => {
      if (category === 'all' || ev.category === category) {
        const diff = (new Date(ev.endedAt!).getTime() - new Date(ev.startedAt).getTime()) / 1000;
        totalSeconds += diff;
      }
    });

    return Math.round(totalSeconds / 60);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]" style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScreenHeader
        subtitle="Quest Ledger"
        title="Active Quests"
        badge={`Quests: ${CHALLENGES_POOL.length}`}
        badgeColor="#F59E0B"
      />

      <ScrollView 
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[#6C758A] text-[10px] font-black uppercase tracking-wider mb-4">
          Current Quest Objectives
        </Text>

        {CHALLENGES_POOL.map((ch) => {
          const currentMins = getProgressMins(ch.category);
          const pct = Math.min(1, currentMins / ch.targetMinutes);
          const isCompleted = pct >= 1;

          return (
            <View 
              key={ch.id}
              className={`w-full p-5 mb-4 rounded-3xl bg-[#11131A] border relative overflow-hidden ${
                isCompleted ? 'border-amber-500/50' : 'border-[#1F2330]'
              }`}
            >
              {isCompleted && (
                <View className="absolute right-0 top-0 bg-amber-500 border-b border-l border-amber-400/20 px-3 py-1 rounded-bl-2xl z-10">
                  <Text className="text-[#05040A] text-[8px] font-black uppercase tracking-widest">
                    COMPLETED
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-start mb-2 pr-12">
                <View>
                  <Text className="text-white text-base font-black">{ch.title}</Text>
                  <Text className="text-[#6C758A] text-[8px] font-black uppercase tracking-widest mt-0.5">
                    Category: {ch.category}
                  </Text>
                </View>
              </View>

              <Text className="text-[#A8B0C2] text-xs font-semibold leading-relaxed mb-4 italic">
                "{ch.description}"
              </Text>

              {/* Progress bar */}
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#6C758A] text-[8px] font-black uppercase">Quest Progress</Text>
                  <Text className="text-white text-[9px] font-black">
                    {currentMins} / {ch.targetMinutes} Mins ({Math.round(pct * 100)}%)
                  </Text>
                </View>
                <View className="h-2 w-full bg-[#050C19] border border-[#1F2330] rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full" 
                    style={{ 
                      backgroundColor: isCompleted ? '#F59E0B' : activeColor, 
                      width: `${pct * 100}%` 
                    }} 
                  />
                </View>
              </View>

              {/* Reward row */}
              <View className="flex-row justify-between items-center pt-3.5 border-t border-[#1F2330]/60">
                <View className="flex-row items-center gap-1.5">
                  <View className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    <Text className="text-amber-500 text-[8px] font-black uppercase tracking-widest">
                      Quest Badge
                    </Text>
                  </View>
                  <Text className="text-white text-[10px] font-black">{ch.badge}</Text>
                </View>

                <View className="bg-emerald-500/10 border border-emerald-500/35 px-2.5 py-1 rounded-xl">
                  <Text className="text-emerald-400 text-[9px] font-black">
                    +{ch.rewardXp} Quest XP
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
