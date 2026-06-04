import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SessionEvent } from '../store/events';
import { useProfileStore } from '../store/profile';

type Props = {
  events: SessionEvent[];
};

export default function FocusHeatmap({ events }: Props) {
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';
  
  const themeColors = {
    blue: { primary: '#7BE7FF', glow: '#00F0FF', bg: 'rgba(0, 240, 255, 0.1)' },
    purple: { primary: '#B77BFF', glow: '#E2B3FF', bg: 'rgba(183, 123, 255, 0.1)' },
    teal: { primary: '#0DF5C4', glow: '#00FFC2', bg: 'rgba(13, 245, 196, 0.1)' }
  };
  const theme = themeColors[activeTheme];

  // 1. Group focus durations by YYYY-MM-DD
  const durationByDate: Record<string, number> = {};
  events.forEach((ev) => {
    if (ev.endedAt) {
      const dateKey = new Date(ev.endedAt).toISOString().split('T')[0];
      const mins = (new Date(ev.endedAt).getTime() - new Date(ev.startedAt).getTime()) / 60000;
      durationByDate[dateKey] = (durationByDate[dateKey] || 0) + mins;
    }
  });

  // 2. Generate past 20 weeks (140 days) to keep it perfect and crisp on mobile view without massive scroll lag
  // 20 columns x 7 rows is ideal for mobile! We can do 26 weeks (half year) horizontally scrollable.
  const WEEKS_COUNT = 24;
  const daysGrid: string[][] = []; // 24 columns, each has 7 days
  
  const today = new Date();
  // Find the most recent Sunday to align columns correctly
  const endDay = new Date(today);
  const dayOfWeek = endDay.getDay(); // 0 is Sunday
  endDay.setDate(endDay.getDate() + (6 - dayOfWeek)); // align to Saturday of current week

  for (let w = WEEKS_COUNT - 1; w >= 0; w--) {
    const weekDays: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const targetDate = new Date(endDay);
      targetDate.setDate(targetDate.getDate() - (w * 7 + d));
      weekDays.push(targetDate.toISOString().split('T')[0]);
    }
    daysGrid.push(weekDays);
  }

  // Helper to resolve cell color intensity depending on focus duration
  const getCellColor = (dateStr: string) => {
    const mins = durationByDate[dateStr] || 0;
    if (mins === 0) return '#0D0E13'; // Empty cell color
    if (mins < 30) return `${theme.glow}30`; // Light intensity
    if (mins < 90) return `${theme.glow}60`; // Medium intensity
    if (mins < 180) return `${theme.glow}a0`; // High intensity
    return theme.glow; // S-Rank intensity
  };

  const daysLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View className="w-full p-4 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6">
      {/* Title Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white text-xs font-black uppercase tracking-wider">
          🛰️ focus Grid Heatmap
        </Text>
        <Text className="text-[#6C758A] text-[9px] font-black uppercase">
          Past 24 Weeks
        </Text>
      </View>

      {/* Grid Canvas Wrapper */}
      <View className="flex-row">
        {/* Days of week indicators left column */}
        <View className="justify-between pr-2.5 py-1" style={{ height: 126 }}>
          {daysLabel.map((lbl, idx) => (
            <Text key={idx} className="text-[#4E546A] text-[8px] font-black text-center" style={{ height: 12, lineHeight: 12 }}>
              {lbl}
            </Text>
          ))}
        </View>

        {/* Scrollable grid cells */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          <View className="flex-row gap-[4px]">
            {daysGrid.map((week, weekIdx) => (
              <View key={weekIdx} className="flex-col gap-[4px]">
                {week.map((dateStr) => {
                  const hasFocus = (durationByDate[dateStr] || 0) > 0;
                  return (
                    <View
                      key={dateStr}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3.5,
                        backgroundColor: getCellColor(dateStr),
                        borderWidth: 0.5,
                        borderColor: hasFocus ? theme.glow : '#181A24',
                        shadowColor: hasFocus ? theme.glow : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: hasFocus ? 0.6 : 0,
                        shadowRadius: 2,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Grid Legend Row */}
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-[#1F2330]/60">
        <Text className="text-[#4E546A] text-[8px] font-bold">Less</Text>
        <View className="flex-row gap-1 items-center">
          <View style={{ width: 10, height: 10, borderRadius: 2.5, backgroundColor: '#0D0E13' }} />
          <View style={{ width: 10, height: 10, borderRadius: 2.5, backgroundColor: `${theme.glow}30` }} />
          <View style={{ width: 10, height: 10, borderRadius: 2.5, backgroundColor: `${theme.glow}60` }} />
          <View style={{ width: 10, height: 10, borderRadius: 2.5, backgroundColor: `${theme.glow}a0` }} />
          <View style={{ width: 10, height: 10, borderRadius: 2.5, backgroundColor: theme.glow }} />
        </View>
        <Text className="text-[#4E546A] text-[8px] font-bold">More (S-Rank)</Text>
      </View>
    </View>
  );
}
