import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat } from 'react-native-reanimated';
import { useBossStore } from '../store/boss';
import { useTheme } from '../constants/theme';

export default function BossBattleCard() {
  const { activeColor } = useTheme();

  const { 
    activeBoss, 
    showDamageIndicator, 
    lastDamageDealt, 
    spawnNewBoss, 
    victoryLogCount,
    fetchActiveBoss,
    subscribeToBossRealtime,
    loading
  } = useBossStore();

  useEffect(() => {
    fetchActiveBoss();
    const unsubscribe = subscribeToBossRealtime();
    return () => unsubscribe();
  }, []);

  const scale = useSharedValue(1);
  const glow = useSharedValue(0.4);

  // Warning glow animation loop
  useEffect(() => {
    glow.value = withRepeat(
      withTiming(0.8, { duration: 1200 }),
      -1,
      true
    );
  }, []);

  // Animate hit when damage dealt changes
  useEffect(() => {
    if (lastDamageDealt > 0) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 80 }),
        withTiming(0.95, { duration: 80 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [lastDamageDealt]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const redGlowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  if (!activeBoss) {
    // Defeated State
    return (
      <View className="w-full p-4 rounded-2xl bg-[#09152B]/90 border-2 border-emerald-500 overflow-hidden relative shadow-lg">
        {/* Glow backdrop */}
        <View className="absolute inset-0 bg-emerald-500/5" />
        
        <View className="items-center py-4 z-10">
          <Text style={{ fontSize: 42 }} className="mb-2">🏆</Text>
          <Text className="text-emerald-400 text-sm font-black uppercase tracking-widest text-center">
            » BOSS SLAIN «
          </Text>
          <Text className="text-white text-xs font-black text-center mt-1">
            Victory achieved! The deadline threat has been neutralized.
          </Text>
          <Text className="text-[#6C758A] text-[9px] font-bold text-center mt-0.5">
            Total Slain Milestones: {victoryLogCount}
          </Text>
          
          <Pressable
            onPress={spawnNewBoss}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 border border-emerald-400 active:opacity-85 shadow"
          >
            <Text className="text-[#05040A] text-[10px] font-black uppercase tracking-widest">
              Spawn Next Target
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const hpPct = Math.round((activeBoss.hp / activeBoss.maxHp) * 100);

  return (
    <Animated.View style={cardStyle} className="w-full">
      <View 
        className="w-full bg-[#070D19]/90 border-2 border-red-500/80 rounded-2xl p-4 overflow-hidden relative shadow-lg"
        style={{
          shadowColor: '#EF4444',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
      >
        {/* Pulsing alarm glow red overlay */}
        <Animated.View 
          className="absolute inset-0 bg-red-500/5"
          style={redGlowStyle}
        />

        {/* Header Indicator */}
        <View className="flex-row justify-between items-center mb-3 z-10">
          <View className="flex-row items-center gap-2">
            <View className="bg-red-500/10 border border-red-500 px-2 py-0.5 rounded">
              <Text className="text-red-500 text-[9px] font-black uppercase tracking-widest">
                👹 RAID BOSS
              </Text>
            </View>
            <Text className="text-white text-xs font-black leading-tight">
              {activeBoss.name}
            </Text>
          </View>
          <Text className="text-[#6C758A] text-[8px] font-bold">
            LV. {Math.round(activeBoss.maxHp / 10)}
          </Text>
        </View>

        {/* Boss avatar and details */}
        <View className="flex-row gap-3 items-center mb-3 z-10">
          <View className="w-12 h-12 rounded-2xl bg-red-950/20 border border-red-500/30 items-center justify-center">
            <Text style={{ fontSize: 28 }}>{activeBoss.avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#A8B0C2] text-[10px] font-bold leading-relaxed mb-1" numberOfLines={2}>
              {activeBoss.flavorText}
            </Text>
            <Text className="text-amber-400 text-[8px] font-black uppercase tracking-widest">
              REWARD: +{activeBoss.rewardXp} XP Ascension
            </Text>
          </View>
        </View>

        {/* Dynamic Damage Floating Indicator */}
        {showDamageIndicator && (
          <View className="absolute right-4 top-14 bg-red-500 border border-red-400 px-2 py-0.5 rounded-md z-30 shadow-md">
            <Text className="text-white text-[10px] font-black tracking-widest">
              💥 -{lastDamageDealt} DAMAGE!
            </Text>
          </View>
        )}

        {/* Boss HP Bar */}
        <View className="z-10 mb-2">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-red-500 text-[8px] font-black uppercase tracking-widest">
              BOSS LIFE FORCE
            </Text>
            <Text className="text-white text-[9px] font-black">
              {activeBoss.hp} / {activeBoss.maxHp} HP ({hpPct}%)
            </Text>
          </View>
          <View className="h-2 w-full bg-[#050C19] border border-red-500/20 rounded-full overflow-hidden">
            <View className="h-full bg-red-500 rounded-full" style={{ width: `${hpPct}%` }} />
          </View>
        </View>

        {/* Tech instructions bottom footer */}
        <View className="flex-row justify-between items-center px-0.5 mt-2 z-10">
          <Text className="text-[7px] font-black text-red-500/70 uppercase tracking-widest">
            » ATTACK PROTOCOL «
          </Text>
          <Text className="text-[#6C758A] text-[8px] font-black uppercase tracking-widest">
            1 Minute Focus = 1 Boss Damage
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
