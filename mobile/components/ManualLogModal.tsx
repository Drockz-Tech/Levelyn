import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import { useEventsStore, ActivityCategory } from '../store/events';
import { useProfileStore } from '../store/profile';
import { xpForSeconds } from '../utils/xp';
import { useGoalsStore } from '../store/goals';
import { useSoloLevelingStore } from '../store/soloLeveling';
import { useAchievementsStore } from '../store/achievements';
import { calculateStreak, totalXp } from '../utils/aggregates';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ManualLogModal({ visible, onClose }: Props) {
  const addEvent = useEventsStore((s) => s.addEvent);
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const [category, setCategory] = useState<ActivityCategory>('coding');
  const [durationMins, setDurationMins] = useState('30');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef<any>(null);

  const startDecrement = () => {
    const decrement = () => {
      setDurationMins((prev) => {
        const current = parseInt(prev) || 0;
        return String(Math.max(1, current - 1));
      });
    };
    decrement();
    timerRef.current = setInterval(decrement, 80);
  };

  const startIncrement = () => {
    const increment = () => {
      setDurationMins((prev) => {
        const current = parseInt(prev) || 0;
        return String(Math.min(480, current + 1));
      });
    };
    increment();
    timerRef.current = setInterval(increment, 80);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const themeColors = {
    blue: { primary: '#7BE7FF', text: 'text-[#7BE7FF]', border: 'border-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10' },
    purple: { primary: '#B77BFF', text: 'text-[#B77BFF]', border: 'border-[#B77BFF]', bg: 'bg-[#B77BFF]/10' },
    teal: { primary: '#0DF5C4', text: 'text-[#0DF5C4]', border: 'border-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10' },
  };
  const theme = themeColors[activeTheme];

  const categoryThemeColors = {
    coding: themeColors.blue,
    study: themeColors.purple,
    reading: themeColors.teal,
  };

  const mins = parseInt(durationMins) || 0;
  const estimatedXp = xpForSeconds(category, mins * 60);

  function handleClose() {
    setDurationMins('30');
    setNote('');
    setErrorMsg('');
    onClose();
  }

  async function handleSave() {
    setErrorMsg('');
    if (mins <= 0) {
      setErrorMsg('Please enter a valid duration.');
      return;
    }
    if (mins > 480) {
      setErrorMsg('Focus limit exceeded (Max 8 hours).');
      return;
    }

    const now = new Date();
    const started = new Date(now.getTime() - mins * 60 * 1000);

    // 1. Damage active raid boss and claim optional victory reward XP
    const bossResult = await require('../store/boss').useBossStore.getState().attackBoss(mins);
    const finalXp = estimatedXp + (bossResult?.xpAwarded || 0);

    const createdEvent = addEvent({
      type: 'session',
      category,
      startedAt: started.toISOString(),
      endedAt: now.toISOString(),
      xpEarned: finalXp,
      pausedDurations: [],
      manual: true,
      note: note.trim() || undefined,
    });

    // 2. Push completed session and activity to Supabase
    try {
      const { supabase } = require('../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { pushSession, pushActivity } = require('../lib/sync');
        await pushSession(user.id, {
          id: createdEvent.id,
          category,
          startedAt: started.toISOString(),
          endedAt: now.toISOString(),
          xpEarned: finalXp,
          note: note.trim() || undefined
        });

        await pushActivity(user.id, {
          type: 'session',
          category,
          duration: mins,
          xp: finalXp,
          note: note.trim() || undefined
        });
      }
    } catch (err) {
      console.error('[ManualLogModal] Supabase push failed:', err);
    }

    // 3. Add progress to active goal
    useGoalsStore.getState().addProgress(category, mins);

    // 4. Dynamic RPG Fatigue generation
    const fatigueAmount = Math.max(5, Math.round(mins / 3));
    useSoloLevelingStore.getState().addFatigue(fatigueAmount);

    // 5. Trigger achievements check
    const updatedEvents = useEventsStore.getState().events;
    const currentStreak = calculateStreak(updatedEvents);
    const totalXpVal = totalXp(updatedEvents);
    useAchievementsStore.getState().checkAchievements(updatedEvents, currentStreak, totalXpVal);

    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-[#050508]/85 px-6">
        <View
          className="w-full max-w-[360px] p-6 rounded-3xl bg-[#11131A] border border-[#1F2330]"
          style={{
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          {/* Header */}
          <Text className="text-white text-xl font-black tracking-wide text-center mb-1">
            Manual <Text style={{ color: theme.primary }}>Log Deck</Text>
          </Text>
          <Text className="text-[#6C758A] text-xs text-center mb-6">
            Log a finished session directly into the archives
          </Text>

          {/* Category Tabs */}
          <View className="mb-5">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2.5">
              Select Category
            </Text>
            <View className="flex-row w-full bg-[#0A0A0F] p-1 rounded-2xl border border-[#1F2330]">
              {(['study', 'coding', 'reading'] as ActivityCategory[]).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`flex-1 items-center py-2.5 rounded-xl ${
                    category === cat ? 'bg-[#181A24]' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold capitalize ${
                      category === cat ? categoryThemeColors[cat].text : 'text-[#6C758A]'
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Duration Input & Quick Select Steppers */}
          <View className="mb-6">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2.5">
              Duration (Minutes)
            </Text>

            <View className="flex-row gap-2 items-center mb-3">
              {/* Decrement Counter */}
              <Pressable
                onPressIn={startDecrement}
                onPressOut={stopTimer}
                className="w-11 h-11 rounded-xl bg-[#181A24] border border-[#1F2330] items-center justify-center active:bg-[#202433]"
              >
                <Text className="text-white text-lg font-bold">-</Text>
              </Pressable>

              <TextInput
                placeholder="Duration"
                keyboardType="number-pad"
                placeholderTextColor="#4E546A"
                value={durationMins}
                onChangeText={(val) => {
                  const cleaned = val.replace(/[^0-9]/g, '');
                  setDurationMins(cleaned);
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#0A0A0F',
                  color: '#fff',
                  paddingVertical: 12,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#1F2330',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              />

              {/* Increment Counter */}
              <Pressable
                onPressIn={startIncrement}
                onPressOut={stopTimer}
                className="w-11 h-11 rounded-xl bg-[#181A24] border border-[#1F2330] items-center justify-center active:bg-[#202433]"
              >
                <Text className="text-white text-lg font-bold">+</Text>
              </Pressable>
            </View>

            {/* Quick Adjust Additive Buttons */}
            <View className="flex-row gap-2">
              {[15, 30, 45, 60].map((val) => (
                <Pressable
                  key={val}
                  onPress={() => {
                    const current = parseInt(durationMins) || 0;
                    setDurationMins(String(Math.min(480, current + val)));
                  }}
                  className="flex-1 py-2 rounded-lg bg-[#0A0A0F] border border-[#1F2330] items-center active:bg-[#181A24]"
                >
                  <Text className="text-white text-[11px] font-extrabold">+{val}m</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Focus Note Input */}
          <View className="mb-5">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2.5">
              Focus Note / Accomplishment
            </Text>
            <TextInput
              placeholder="What did you focus on? (e.g. Coded achievements)"
              placeholderTextColor="#4E546A"
              value={note}
              onChangeText={setNote}
              maxLength={70}
              style={{
                backgroundColor: '#0A0A0F',
                color: '#fff',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#1F2330',
                fontSize: 14,
                fontWeight: '600',
              }}
            />
          </View>

          {/* Estimate Preview */}
          <View className="mb-6 p-4 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] flex-row justify-between items-center">
            <Text className="text-[#6C758A] text-xs font-extrabold uppercase tracking-widest">
              XP Yield
            </Text>
            <Text className="text-white text-lg font-black" style={{ color: categoryThemeColors[category].primary }}>
              +{estimatedXp} XP
            </Text>
          </View>

          {errorMsg ? (
            <Text className="text-[#E63946] text-xs font-bold text-center mb-4">{errorMsg}</Text>
          ) : null}

          {/* Action Row */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="flex-1 py-3.5 rounded-xl border border-[#1F2330] bg-[#11131A] justify-center items-center"
            >
              <Text className="text-[#6C758A] font-bold text-[14px] uppercase tracking-wider">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              className="flex-1 py-3.5 rounded-xl justify-center items-center"
              style={{
                backgroundColor: categoryThemeColors[category].primary,
                shadowColor: categoryThemeColors[category].primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text className="text-[#05040A] font-bold text-[14px] uppercase tracking-wider">
                Log Session
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
