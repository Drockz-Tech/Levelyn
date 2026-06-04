import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Alert, Platform } from 'react-native';
import { useEventsStore } from '../../store/events';
import { hoursByWeek } from '../../features/stats/selectors';
import BarChart from '../../components/BarChart';
import AchievementsDeck from '../../components/AchievementsDeck';
import CustomQuestModal from '../../components/CustomQuestModal';
import { useTheme, CATEGORY_COLORS, SURFACE } from '../../constants/theme';

export default function Stats() {
  const events = useEventsStore((s) => s.events);
  const deleteEvent = useEventsStore((s) => s.deleteEvent);
  const days = hoursByWeek(events);

  const { activeColor } = useTheme();
  const [showQuestModal, setShowQuestModal] = useState(false);

  // Calculate totals by category
  const categoryTotals = { study: 0, coding: 0, reading: 0 };
  let totalTimeHours = 0;

  events.forEach((ev) => {
    if (ev.endedAt && ev.category) {
      const durHrs = (new Date(ev.endedAt).getTime() - new Date(ev.startedAt).getTime()) / 3600000;
      categoryTotals[ev.category] = (categoryTotals[ev.category] || 0) + durHrs;
      totalTimeHours += durHrs;
    }
  });

  const completedSessions = events.filter((e) => e.endedAt).reverse();

  function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this focus log? The XP earned from this session will be deducted from your total.'
      );
      if (confirmDelete) {
        deleteEvent(id);
      }
    } else {
      Alert.alert(
        'Delete Focus Log',
        'Are you sure you want to delete this focus log? The XP earned from this session will be deducted from your total.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Log',
            style: 'destructive',
            onPress: () => {
              deleteEvent(id);
            },
          },
        ]
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: SURFACE.bg }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, paddingHorizontal: 20, backgroundColor: SURFACE.bg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-[#6C758A] text-xs font-extrabold uppercase tracking-widest mb-1">
            Data Deck
          </Text>
          <Text className="text-white text-2xl font-black tracking-wide">
            Performance <Text style={{ color: activeColor }}>Lab</Text>
          </Text>
        </View>

        {/* Weekly Focus Chart Card */}
        <View className="w-full p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] items-center mb-6 shadow-lg">
          <Text className="text-white text-sm font-extrabold tracking-wider self-start mb-4 uppercase">
            Weekly Focus Velocity
          </Text>
          <BarChart values={days} width={300} height={140} />
        </View>

        {/* Milestone Vault Section Title & Custom Quest Trigger Button */}
        <View className="flex-row justify-between items-center mb-1.5 mt-2">
          <Text className="text-[#6C758A] text-[10px] font-extrabold uppercase tracking-widest">
            Milestone Vault
          </Text>
          <Pressable
            onPress={() => setShowQuestModal(true)}
            className="px-3 py-1 rounded-full border border-dashed active:opacity-85"
            style={{ borderColor: activeColor }}
          >
            <Text className="text-[9.5px] font-black uppercase tracking-wider" style={{ color: activeColor }}>
              + Design Custom Quest
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Achievements / Badge Milestones Deck */}
        <AchievementsDeck />

        <CustomQuestModal visible={showQuestModal} onClose={() => setShowQuestModal(false)} />

        {/* Category Breakdown Progress Deck */}
        <View className="w-full p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6 shadow-lg">
          <Text className="text-white text-sm font-extrabold tracking-wider mb-4 uppercase">
            Category Breakdown
          </Text>

          {(['coding', 'study', 'reading'] as const).map((cat) => {
            const catHrs = categoryTotals[cat];
            const pct = totalTimeHours > 0 ? catHrs / totalTimeHours : 0;
            const catColor = CATEGORY_COLORS[cat].hex;

            return (
              <View key={cat} className="mb-3.5 last:mb-0">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-white text-xs font-bold capitalize tracking-wide">{cat}</Text>
                  <Text className="text-xs font-semibold text-[#889]">
                    {catHrs.toFixed(1)}h <Text className="text-[#4E546A]">({Math.round(pct * 100)}%)</Text>
                  </Text>
                </View>
                <View className="h-2 w-full bg-[#050508] rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: catColor }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Focus Logs / Recent Sessions */}
        <View className="w-full">
          <Text className="text-white text-sm font-extrabold tracking-wider mb-4 uppercase">
            Focus Log History
          </Text>

          {completedSessions.length === 0 ? (
            <View className="w-full p-6 rounded-2xl bg-[#11131A]/40 border border-[#1F2330]/50 items-center justify-center">
              <Text className="text-[#4E546A] text-xs font-semibold uppercase tracking-wider text-center">
                No Completed Logs
              </Text>
            </View>
          ) : (
            completedSessions.map((session) => {
              const minutes = Math.round(
                (new Date(session.endedAt!).getTime() - new Date(session.startedAt).getTime()) / 60000
              );
              const dateStr = new Date(session.endedAt!).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const categoryColors = {
                coding: { text: 'text-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10' },
                study: { text: 'text-[#B77BFF]', bg: 'bg-[#B77BFF]/10' },
                reading: { text: 'text-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10' },
              };
              const style = categoryColors[session.category] || categoryColors.coding;

              return (
                <View
                  key={session.id}
                  className="w-full p-4 rounded-2xl bg-[#11131A] border border-[#1F2330] flex-row justify-between items-center mb-3 shadow-md"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    {/* Visual Tag */}
                    <View className={`px-2.5 py-1 rounded-full ${style.bg}`}>
                      <Text className={`text-[9px] font-black uppercase tracking-wider ${style.text}`}>
                        {session.category}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-white text-xs font-extrabold tracking-wide">
                          Focused for {minutes}m
                        </Text>
                        {session.manual && (
                          <View className="px-1.5 py-0.2 bg-[#FF9F1C]/15 rounded border border-[#FF9F1C]/35">
                            <Text className="text-[#FF9F1C] text-[8px] font-black uppercase tracking-widest">
                              Manual
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[#4E546A] text-[9px] font-semibold mt-0.5">
                        {dateStr}
                      </Text>
                      {session.note && (
                        <Text className="text-[#A8B0C2] text-[10px] font-semibold italic mt-1" numberOfLines={1}>
                          “{session.note}”
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View className="bg-[#050508] px-2.5 py-1 rounded-lg border border-[#1F2330]">
                      <Text className="text-white text-[10px] font-bold" style={{ color: activeColor }}>
                        +{session.xpEarned || 0} XP
                      </Text>
                    </View>

                    {/* Styled Red Log Delete Trigger Button */}
                    <Pressable
                      onPress={() => handleDelete(session.id)}
                      className="w-8 h-8 rounded-lg bg-[#E63946]/10 border border-[#E63946]/30 justify-center items-center"
                    >
                      <Text className="text-[#E63946] text-xs font-bold">✕</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
