import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useAchievementsStore } from '../store/achievements';
import { useTheme } from '../constants/theme';

export default function MilestonePopupModal() {
  const { activeColor } = useTheme();
  const popupQueue = useAchievementsStore((s) => s.popupQueue);
  const dequeuePopup = useAchievementsStore((s) => s.dequeuePopup);

  const activeAch = popupQueue[0] || null;

  const glowOpacity = useSharedValue(0.4);
  const scale = useSharedValue(0.9);

  // Trigger modal animations when a new achievement mounts
  useEffect(() => {
    if (activeAch) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 150 }),
        withTiming(0.98, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      
      glowOpacity.value = withRepeat(
        withTiming(0.8, { duration: 1200 }),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      glowOpacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [activeAch?.id]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulsingGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!activeAch) return null;

  const color = activeAch.themeColor || activeColor;

  return (
    <Modal
      visible={!!activeAch}
      animationType="fade"
      transparent
    >
      <View className="flex-1 justify-center items-center bg-[#050508]/90 px-6">
        {/* Pulsing Cybernetic Backdrop Glow */}
        <Animated.View
          className="absolute w-[320px] h-[400px] rounded-[36px] blur-3xl opacity-10"
          style={[
            {
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 50,
            },
            pulsingGlowStyle
          ]}
        />

        {/* Immersive RPG Card Container */}
        <Animated.View
          style={[
            {
              width: '100%',
              maxWidth: 340,
              backgroundColor: '#11131A',
              borderColor: `${color}80`,
              borderWidth: 2,
              borderRadius: 30,
              padding: 24,
              overflow: 'hidden',
              alignItems: 'center',
              shadowColor: color,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 10,
            },
            modalStyle
          ]}
        >
          {/* Cyberpunk Tech Lines */}
          <View className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: color }} />
          
          {/* Header Title */}
          <Text className="text-[10px] font-black uppercase tracking-widest mb-1 mt-2 text-center" style={{ color }}>
            » SYSTEM ACHIEVEMENT «
          </Text>
          <Text className="text-white text-xl font-black uppercase tracking-wide text-center mb-6">
            Milestone <Text style={{ color }}>Unlocked!</Text>
          </Text>

          {/* Badge Icon Grid */}
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-5 border-4 relative"
            style={{
              backgroundColor: `${color}15`,
              borderColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 15,
            }}
          >
            {/* Pulsing background effect inside the circle */}
            <View className="absolute inset-0 rounded-full bg-transparent border border-white/10" />
            <Text style={{ fontSize: 38 }}>{activeAch.icon}</Text>
          </View>

          {/* Achievement Details */}
          <Text className="text-white text-base font-black text-center mb-2 tracking-wide">
            {activeAch.title}
          </Text>
          <Text className="text-[#A8B0C2] text-xs font-semibold text-center leading-relaxed px-2 mb-6">
            {activeAch.description}
          </Text>

          {/* System Rewards Confirmation details */}
          <View className="w-full py-3 px-4 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] items-center mb-6">
            <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-wider mb-1">
              Ascension Rewards Claimed
            </Text>
            <Text className="text-amber-400 text-sm font-black uppercase tracking-widest">
              + Rank XP Secured
            </Text>
          </View>

          {/* Claim Button */}
          <Pressable
            onPress={() => {
              dequeuePopup();
            }}
            className="w-full py-3.5 rounded-xl justify-center items-center shadow-md active:opacity-90"
            style={{
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-[#05040A] font-extrabold text-[13px] tracking-widest uppercase">
              Claim & Dismiss
            </Text>
          </Pressable>

        </Animated.View>
      </View>
    </Modal>
  );
}
