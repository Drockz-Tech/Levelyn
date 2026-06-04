import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { levelFromXp } from '../utils/levels';
import { useSoloLevelingStore } from '../store/soloLeveling';
import SoloLevelingModal from './SoloLevelingModal';

export default function SoloLevelingBar({ xp }: { xp: number }) {
  const { level, progress, next } = levelFromXp(xp);
  const pct = Math.min(1, progress / Math.max(1, next));

  const [modalVisible, setModalVisible] = useState(false);

  // Zustand bindings
  const { lastLevel, levelUp, jobClass, title, statPoints } = useSoloLevelingStore();

  const width = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);

  // Animate progress bar filling
  useEffect(() => {
    width.value = withTiming(pct, { duration: 900 });
  }, [pct]);

  // Breathing neon glow animation
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  // System Level Up Detection & Reward Distribution Loop
  useEffect(() => {
    if (level > lastLevel) {
      const pointsGained = (level - lastLevel) * 5;

      // Perform Zustand update
      levelUp(level, pointsGained);

      // System notification
      const titleText = '🚨 SYSTEM MESSAGE 🚨';
      const msgText = `» Rank Ascension Confirmed «\n\nYour level has increased from Level ${lastLevel} to Level ${level}!\n\nYou have been awarded +${pointsGained} Available Attribute Points. Check your Status Window.`;

      if (Platform.OS === 'web') {
        alert(`${titleText}\n\n${msgText}`);
        setModalVisible(true);
      } else {
        Alert.alert(
          titleText,
          msgText,
          [{ text: 'OPEN STATUS WINDOW', onPress: () => setModalVisible(true) }]
        );
      }
    } else if (level < lastLevel) {
      // Handles reset situations or event deletion safely
      useSoloLevelingStore.getState().updateField('lastLevel', level);
    }
  }, [level, lastLevel]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(width.value * 100)}%`,
  }));

  const borderGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View className="w-full my-3">
      {/* Immersive Cybernetic Status Pressable Card */}
      <Pressable
        onPress={() => setModalVisible(true)}
        className="w-full bg-[#070D19]/90 border-2 border-[#00F0FF]/80 rounded-2xl p-4 overflow-hidden relative shadow-lg"
        style={{
          shadowColor: '#00F0FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
        }}
      >
        {/* Glow pulsing effect backdrop */}
        <Animated.View
          className="absolute inset-0 bg-[#00F0FF]/5"
          style={borderGlowStyle}
        />

        {/* Level Title Header Grid */}
        <View className="flex-row justify-between items-start mb-3 w-full gap-3 z-10">
          <View className="flex-row items-center gap-2 flex-1 pr-1">
            {/* Sci-Fi level badge tag */}
            <View className="bg-[#00F0FF]/10 border border-[#00F0FF] px-2 py-1 rounded-md">
              <Text className="text-[#00F0FF] text-[10px] font-black uppercase tracking-wider">
                LVL {level}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#6C758A] text-[8px] font-extrabold uppercase tracking-wider" numberOfLines={1}>
                {title}
              </Text>
              <Text className="text-white text-xs font-black leading-tight mt-0.5" numberOfLines={1}>
                {jobClass}
              </Text>
            </View>
          </View>

          {/* XP text HUD display */}
          <View className="items-end pt-1">
            <Text className="text-[#00F0FF] text-[10px] font-black tracking-wider">
              {progress} <Text className="text-[#6C758A]">/ {next} XP</Text>
            </Text>
          </View>
        </View>

        {/* Pulsing Game Alert Banner for Stat Points */}
        {statPoints > 0 && (
          <View className="w-full py-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center mb-3.5 z-10 flex-row gap-1.5 shadow-sm">
            <Text style={{ fontSize: 11 }}>⚡</Text>
            <Text className="text-amber-500 text-[9px] font-black uppercase tracking-wider">
              {statPoints} Unallocated Stat Points Available!
            </Text>
          </View>
        )}

        {/* Cyan Glowing Progress Bar Deck */}
        <View className="relative h-3 w-full bg-[#050C19] rounded-full overflow-hidden border border-[#00F0FF]/30 mb-2.5">
          {/* Animated Cyan bar */}
          <Animated.View
            className="h-full bg-[#00F0FF] rounded-full"
            style={[
              {
                shadowColor: '#00F0FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
              },
              progressStyle
            ]}
          />
        </View>

        {/* Tech markings footer row */}
        <View className="flex-row flex-wrap justify-center items-center gap-x-5 gap-y-2 px-0.5 pt-2 border-t border-[#00F0FF]/15 z-10 w-full">
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-[#0DF5C4] animate-pulse" />
            <Text className="text-[8px] font-black text-[#00A3FF] uppercase tracking-wider">
              SYSTEM ACTIVE
            </Text>
          </View>
          
          <Text className="text-white text-[8.5px] font-black tracking-wider uppercase">
            {Math.round(pct * 100)}% ASCENSION
          </Text>

          <Text className="text-[#00A3FF] text-[8px] font-black uppercase tracking-wider">
            {statPoints > 0 ? '« TAP TO ALLOCATE STATS »' : '« TAP TO VIEW STATUS »'}
          </Text>
        </View>
      </Pressable>

      {/* Render the immersive Status Window Modal */}
      <SoloLevelingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        level={level}
      />
    </View>
  );
}
