import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { levelFromXp } from '../utils/levels';
import { useProfileStore } from '../store/profile';

export default function XPBar({ xp }: { xp: number }){
  const { level, progress, next } = levelFromXp(xp);
  const pct = Math.min(1, progress / Math.max(1, next));
  const width = useSharedValue(0);

  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const themeColors = {
    blue: '#7BE7FF',
    purple: '#B77BFF',
    teal: '#0DF5C4',
  };
  const activeColor = themeColors[activeTheme];

  useEffect(() => { 
    width.value = withTiming(pct, { duration: 800 }); 
  }, [pct]);

  const progressStyle = useAnimatedStyle(() => ({ 
    width: `${Math.round(width.value * 100)}%`,
    backgroundColor: activeColor,
  }));

  return (
    <View className="w-full px-5 py-4 my-2 rounded-2xl bg-[#11131A]/70 border border-[#1F2330]">
      <View className="flex-row justify-between items-center mb-2.5">
        <View className="flex-row items-center gap-2">
          <View className="px-2.5 py-0.5 rounded-full bg-[#0A0A0F] border border-[#1F2330]">
            <Text className="text-white text-xs font-black uppercase tracking-wider" style={{ color: activeColor }}>
              LVL {level}
            </Text>
          </View>
        </View>
        <Text className="text-xs font-semibold text-[#889] tracking-wide">
          {progress} <Text className="text-[#4E546A]">/ {next} XP</Text>
        </Text>
      </View>

      <View className="relative h-4 w-full bg-[#050508] rounded-full overflow-hidden border border-[#1A1C24]">
        {/* Animated Progress Bar */}
        <Animated.View style={[{ height: '100%', borderRadius: 999 }, progressStyle]} />
        
        {/* Ambient Glow */}
        <View className="absolute inset-0 bg-transparent opacity-20" />
      </View>

      <View className="flex-row justify-between items-center mt-2 px-0.5">
        <Text className="text-[10px] font-bold text-[#4E546A] tracking-wider uppercase">Base Stage</Text>
        <Text className="text-[11px] font-extrabold tracking-wider" style={{ color: activeColor }}>
          {Math.round(pct * 100)}% Leveled
        </Text>
        <Text className="text-[10px] font-bold text-[#4E546A] tracking-wider uppercase">Next Rank</Text>
      </View>
    </View>
  );
}
