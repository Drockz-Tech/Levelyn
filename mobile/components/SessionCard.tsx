import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { useEventsStore, ActivityCategory } from '../store/events';
import { xpForSeconds } from '../utils/xp';
import { useProfileStore } from '../store/profile';
import SaveSessionModal from './SaveSessionModal';
import { useGoalsStore } from '../store/goals';
import { useSoloLevelingStore } from '../store/soloLeveling';
import { useAchievementsStore } from '../store/achievements';
import { calculateStreak, totalXp } from '../utils/aggregates';

// Helper to calculate seconds active from startedAt and pausedDurations
function calculateElapsedSeconds(startedAt: string, pausedDurations: Array<{from: string; to?: string}> = []) {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const totalElapsed = (now - start) / 1000;
  const totalPaused = pausedDurations.reduce((sum, p) => {
    const pStart = new Date(p.from).getTime();
    const pEnd = p.to ? new Date(p.to).getTime() : now;
    return sum + (pEnd - pStart) / 1000;
  }, 0);
  return Math.max(0, Math.floor(totalElapsed - totalPaused));
}

export default function SessionCard() {
  const { addEvent, updateEvent, deleteEvent, events } = useEventsStore();
  const [seconds, setSeconds] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('coding');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);
  const timer = useRef<any>(null);

  // Find active event from store (any session that hasn't ended yet)
  const activeEvent = events.find((e) => !e.endedAt);
  const activeId = activeEvent?.id;
  const isPaused = activeEvent
    ? !!(activeEvent.pausedDurations?.length && !activeEvent.pausedDurations[activeEvent.pausedDurations.length - 1].to)
    : false;

  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const themeColors = {
    blue: { text: 'text-[#7BE7FF]', border: 'border-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10', hex: '#7BE7FF' },
    purple: { text: 'text-[#B77BFF]', border: 'border-[#B77BFF]', bg: 'bg-[#B77BFF]/10', hex: '#B77BFF' },
    teal: { text: 'text-[#0DF5C4]', border: 'border-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10', hex: '#0DF5C4' },
  };
  const theme = themeColors[activeTheme];

  const categoryThemeColors = {
    coding: themeColors.blue,
    study: themeColors.purple,
    reading: themeColors.teal,
  };

  // Reanimated breathing glow scale
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (activeEvent && !isPaused) {
      pulseScale.value = withRepeat(
        withTiming(1.12, { duration: 1400 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [activeId, isPaused]);

  const breathingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: withTiming(activeEvent && !isPaused ? 0.35 : 0, { duration: 400 }),
    };
  });

  // Accurate Background-Resilient Timer Update Loop
  useEffect(() => {
    if (activeEvent) {
      // Calculate immediately on mount/update
      setSeconds(calculateElapsedSeconds(activeEvent.startedAt, activeEvent.pausedDurations));

      timer.current = setInterval(() => {
        setSeconds(calculateElapsedSeconds(activeEvent.startedAt, activeEvent.pausedDurations));
      }, 500);
    } else {
      setSeconds(0);
    }

    return () => clearInterval(timer.current);
  }, [activeId, isPaused]);

  function startSession() {
    addEvent({
      type: 'session',
      category: selectedCategory,
      startedAt: new Date().toISOString(),
      pausedDurations: [],
    });
    // Broadcast active focus presence
    require('../store/presence').usePresenceStore.getState().setUserPresence(true, selectedCategory);
  }

  function togglePause() {
    if (!activeId || !activeEvent) return;

    if (!isPaused) {
      // Pause: Add pause start timestamp
      const pausedDurations = [...(activeEvent.pausedDurations || [])];
      pausedDurations.push({ from: new Date().toISOString() });
      updateEvent(activeId, { pausedDurations });
    } else {
      // Resume: Close last pause segment
      const pausedDurations = [...(activeEvent.pausedDurations || [])];
      if (pausedDurations.length > 0) {
        const last = pausedDurations[pausedDurations.length - 1];
        last.to = new Date().toISOString();
      }
      updateEvent(activeId, { pausedDurations });
    }
  }

  function endSession() {
    if (!activeId || !activeEvent) return;
    const finalSeconds = calculateElapsedSeconds(activeEvent.startedAt, activeEvent.pausedDurations);
    setFinalDuration(finalSeconds);
    setShowSaveModal(true);
  }

  async function handleSaveSession(note: string) {
    if (!activeId || !activeEvent) return;
    const finalMins = Math.round(finalDuration / 60);

    // 1. Damage active raid boss and claim optional victory reward XP
    const bossResult = await require('../store/boss').useBossStore.getState().attackBoss(finalMins);
    const xp = xpForSeconds(activeEvent.category, finalDuration) + (bossResult?.xpAwarded || 0);

    // 2. Shut off active broadcast presence
    await require('../store/presence').usePresenceStore.getState().setUserPresence(false, null);
    
    // 3. Add progress to active goal in minutes
    useGoalsStore.getState().addProgress(activeEvent.category, finalMins);

    // 4. Dynamic RPG Fatigue generation
    const fatigueAmount = Math.max(5, Math.round(finalMins / 3));
    useSoloLevelingStore.getState().addFatigue(fatigueAmount);

    const endedAtString = new Date().toISOString();

    updateEvent(activeId, {
      endedAt: endedAtString,
      xpEarned: xp,
      note: note.trim() || undefined,
    });

    // 5. Push completed session and activity to Supabase
    try {
      const { supabase } = require('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { pushSession, pushActivity } = require('../lib/sync');
        await pushSession(user.id, {
          id: activeId,
          category: activeEvent.category,
          startedAt: activeEvent.startedAt,
          endedAt: endedAtString,
          xpEarned: xp,
          note: note.trim() || undefined
        });

        await pushActivity(user.id, {
          type: 'session',
          category: activeEvent.category,
          duration: finalMins,
          xp: xp,
          note: note.trim() || undefined
        });
      }
    } catch (err) {
      console.error('[SessionCard] Supabase push failed:', err);
    }

    // 6. Trigger achievements check
    const updatedEvents = useEventsStore.getState().events;
    const currentStreak = calculateStreak(updatedEvents);
    const totalXpVal = totalXp(updatedEvents);
    useAchievementsStore.getState().checkAchievements(updatedEvents, currentStreak, totalXpVal);

    setShowSaveModal(false);
  }

  function handleCancelSave() {
    setShowSaveModal(false);
  }

  function resetSession() {
    if (!activeId) return;

    const handleReset = () => {
      // 1. Delete active event from store
      deleteEvent(activeId);
      // 2. Shut off active broadcast presence
      require('../store/presence').usePresenceStore.getState().setUserPresence(false, null);
      // 3. Clear local states
      setSeconds(0);
    };

    if (Platform.OS === 'web') {
      const confirmDiscard = window.confirm(
        "Discard Session?\n\nAre you sure you want to discard this focus session? All active progress will be lost."
      );
      if (confirmDiscard) {
        handleReset();
      }
    } else {
      Alert.alert(
        'Discard Session?',
        'Are you sure you want to discard this focus session? All active progress will be lost.',
        [
          { text: 'Keep Focusing', style: 'cancel' },
          { text: 'Discard Progress', style: 'destructive', onPress: handleReset },
        ]
      );
    }
  }

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentCategory = activeEvent?.category || selectedCategory;
  const currentCategoryTheme = categoryThemeColors[currentCategory] || theme;
  const currentXpEstimate = xpForSeconds(currentCategory, seconds);

  // Dynamic HUD Sub-text based on focus duration
  const getMotivationalHUDText = (sec: number) => {
    if (sec < 60) return 'ENTERING THE ZONE...';
    if (sec < 600) return 'FLOW STATE ACTIVE';
    if (sec < 1800) return 'DEEP CONCENTRATION';
    return 'ASCENSION SPEEDRUN';
  };

  return (
    <View className="w-full max-w-[360px] p-6 rounded-3xl bg-[#11131A] border border-[#1F2330] my-4 shadow-xl">
      {!activeId ? (
        // Start Session Screen
        <View className="items-center">
          <Text className="text-white text-lg font-bold tracking-wide mb-1">Focus Chamber</Text>
          <Text className="text-[#6C758A] text-xs mb-5">Select a category and initiate focus</Text>

          {/* Custom Tabs */}
          <View className="flex-row w-full bg-[#0A0A0F] p-1 rounded-2xl border border-[#1F2330] mb-6">
            {(['study', 'coding', 'reading'] as ActivityCategory[]).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`flex-1 items-center py-2.5 rounded-xl ${
                  selectedCategory === cat ? 'bg-[#181A24]' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    selectedCategory === cat ? categoryThemeColors[cat].text : 'text-[#6C758A]'
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Action Trigger Button */}
          <Pressable
            onPress={startSession}
            className="w-full py-4 rounded-xl items-center"
            style={{
              backgroundColor: categoryThemeColors[selectedCategory].hex,
              shadowColor: categoryThemeColors[selectedCategory].hex,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-[#05040A] font-extrabold text-[15px] tracking-widest uppercase">
              Initiate Session
            </Text>
          </Pressable>
        </View>
      ) : (
        // Active Session Screen
        <View className="items-center">
          <View className="flex-row items-center justify-between w-full mb-4">
            <View className="flex-row items-center gap-1.5 bg-[#050508] px-3 py-1 rounded-full border border-[#1C1E26]">
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isPaused ? '#FFB703' : currentCategoryTheme.hex }}
              />
              <Text className="text-white text-[11px] font-bold uppercase tracking-wider capitalize">
                {currentCategory}
              </Text>
            </View>

            <View className="bg-[#181A24] px-3 py-1 rounded-full border border-[#232736]">
              <Text className={`text-[11px] font-extrabold tracking-wider ${currentCategoryTheme.text}`}>
                +{currentXpEstimate} XP
              </Text>
            </View>
          </View>

          {/* Glowing Timer Display with breathing aura */}
          <View className="relative w-[210px] h-[210px] justify-center items-center my-4">
            {/* Breathing Neon Outer Aura */}
            <Animated.View
              className="absolute w-[204px] h-[204px] rounded-full border-4"
              style={[
                {
                  borderColor: currentCategoryTheme.hex,
                  shadowColor: currentCategoryTheme.hex,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 24,
                },
                breathingStyle,
              ]}
            />

            {/* Inner Ring Circle */}
            <View
              className="w-[190px] h-[190px] rounded-full bg-[#07080D] border-4 justify-center items-center shadow-inner"
              style={{
                borderColor: isPaused ? '#232736' : currentCategoryTheme.hex,
                shadowColor: currentCategoryTheme.hex,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isPaused ? 0 : 0.35,
                shadowRadius: 15,
              }}
            >
              <Text className="text-white text-3xl font-black tracking-widest">
                {formatTime(seconds)}
              </Text>
              <Text className="text-[#6C758A] text-[9px] font-bold uppercase tracking-widest mt-1.5">
                {isPaused ? 'Session Paused' : getMotivationalHUDText(seconds)}
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View className="flex-row w-full gap-3 mt-4">
            {/* Pause/Resume Button */}
            <Pressable
              onPress={togglePause}
              className={`flex-1 py-3 rounded-xl border justify-center items-center ${
                isPaused ? 'border-[#0DF5C4] bg-[#0DF5C4]/10' : 'border-[#FFB703] bg-[#FFB703]/10'
              }`}
            >
              <Text
                className={`text-xs font-bold uppercase tracking-wider ${
                  isPaused ? 'text-[#0DF5C4]' : 'text-[#FFB703]'
                }`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </Pressable>

            {/* End Session Button */}
            <Pressable
              onPress={endSession}
              className="flex-1 py-3 rounded-xl bg-[#E63946] justify-center items-center"
              style={{
                shadowColor: '#E63946',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
              }}
            >
              <Text className="text-white text-xs font-black uppercase tracking-wider">
                End Session
              </Text>
            </Pressable>
          </View>

          {/* Discard & Reset Session Button */}
          <Pressable
            onPress={resetSession}
            className="w-full mt-3.5 py-2.5 rounded-xl bg-transparent border border-[#E63946]/35 justify-center items-center active:bg-[#E63946]/10"
          >
            <Text className="text-[#E63946] text-xs font-bold uppercase tracking-wider">
              Discard & Reset Session
            </Text>
          </Pressable>
        </View>
      )}

      {activeEvent && (
        <SaveSessionModal
          visible={showSaveModal}
          category={activeEvent.category}
          durationSeconds={finalDuration}
          onSave={handleSaveSession}
          onCancel={handleCancelSave}
        />
      )}
    </View>
  );
}
