import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import { ActivityCategory } from '../store/events';
import { xpForSeconds } from '../utils/xp';
import { useProfileStore } from '../store/profile';

type Props = {
  visible: boolean;
  category: ActivityCategory;
  durationSeconds: number;
  onSave: (note: string) => void;
  onCancel: () => void;
};

export default function SaveSessionModal({ visible, category, durationSeconds, onSave, onCancel }: Props) {
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';
  const [note, setNote] = useState('');

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
  const catTheme = categoryThemeColors[category] || theme;

  const xpEarned = xpForSeconds(category, durationSeconds);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    let parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  const handleConfirm = () => {
    onSave(note.trim());
    setNote('');
  };

  const handleDismiss = () => {
    setNote('');
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-[#050508]/90 px-6">
        <View
          className="w-full max-w-[360px] p-6 rounded-3xl bg-[#11131A] border border-[#1F2330]"
          style={{
            shadowColor: catTheme.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 30,
            elevation: 10,
          }}
        >
          {/* Cosmic Icon badge */}
          <View className="items-center mb-4">
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center border"
              style={{
                backgroundColor: `${catTheme.primary}12`,
                borderColor: `${catTheme.primary}30`,
              }}
            >
              <Text style={{ fontSize: 28 }}>⚡</Text>
            </View>
          </View>

          {/* Header */}
          <Text className="text-white text-xl font-black tracking-wide text-center mb-1">
            Focus <Text style={{ color: catTheme.primary }}>Session Completed</Text>
          </Text>
          <Text className="text-[#6C758A] text-xs text-center mb-5 uppercase tracking-widest font-extrabold">
            ORBIT RECORD SECURED
          </Text>

          {/* Stat Cards */}
          <View className="flex-row gap-2.5 mb-5">
            <View className="flex-1 p-3 bg-[#0A0A0F] border border-[#1F2330] rounded-xl items-center">
              <Text className="text-[9px] font-bold text-[#6C758A] uppercase tracking-wider mb-1">Duration</Text>
              <Text className="text-white text-sm font-black">{formatTime(durationSeconds)}</Text>
            </View>
            <View className="flex-1 p-3 bg-[#0A0A0F] border border-[#1F2330] rounded-xl items-center">
              <Text className="text-[9px] font-bold text-[#6C758A] uppercase tracking-wider mb-1">XP Yield</Text>
              <Text className="text-white text-sm font-black" style={{ color: catTheme.primary }}>
                +{xpEarned} XP
              </Text>
            </View>
          </View>

          {/* Focus Note input */}
          <View className="mb-6">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2">
              Accomplishment Description
            </Text>
            <TextInput
              placeholder="What did you achieve during this lock? (Optional)"
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

          {/* Action Row */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleDismiss}
              className="flex-1 py-3.5 rounded-xl border border-[#1F2330] bg-[#11131A] justify-center items-center"
            >
              <Text className="text-[#6C758A] font-bold text-[14px] uppercase tracking-wider">
                Discard
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              className="flex-1 py-3.5 rounded-xl justify-center items-center"
              style={{
                backgroundColor: catTheme.primary,
                shadowColor: catTheme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text className="text-[#05040A] font-extrabold text-[14px] uppercase tracking-widest">
                Levelyn Log
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
