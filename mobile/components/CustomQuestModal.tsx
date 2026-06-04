import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { useAchievementsStore } from '../store/achievements';
import { useProfileStore } from '../store/profile';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const EMOJIS = ['🎯', '🚀', '💻', '📚', '🏆', '🔥', '⚡', '🧠', '👑', '👾'];
const THEME_COLORS = [
  { name: 'Blue', hex: '#7BE7FF' },
  { name: 'Purple', hex: '#B77BFF' },
  { name: 'Teal', hex: '#0DF5C4' },
  { name: 'Pink', hex: '#FF758F' },
  { name: 'Orange', hex: '#FF9F1C' },
];

export default function CustomQuestModal({ visible, onClose }: Props) {
  const addCustomAchievement = useAchievementsStore((s) => s.addCustomAchievement);
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('5');
  const [targetType, setTargetType] = useState<'sessions' | 'xp' | 'streak'>('sessions');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#7BE7FF');
  const [errorMsg, setErrorMsg] = useState('');

  const themeColors = {
    blue: { primary: '#7BE7FF', text: 'text-[#7BE7FF]', border: 'border-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10' },
    purple: { primary: '#B77BFF', text: 'text-[#B77BFF]', border: 'border-[#B77BFF]', bg: 'bg-[#B77BFF]/10' },
    teal: { primary: '#0DF5C4', text: 'text-[#0DF5C4]', border: 'border-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10' },
  };
  const theme = themeColors[activeTheme];

  function handleClose() {
    setTitle('');
    setTargetValue('5');
    setTargetType('sessions');
    setSelectedEmoji('🎯');
    setSelectedColor('#7BE7FF');
    setErrorMsg('');
    onClose();
  }

  function handleSave() {
    setErrorMsg('');
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Please enter a quest name.');
      return;
    }

    const val = parseInt(targetValue) || 0;
    if (val <= 0) {
      setErrorMsg('Threshold must be a positive number.');
      return;
    }
    if (val > 9999) {
      setErrorMsg('Max threshold is 9999.');
      return;
    }

    // Auto-generate description based on target type
    let description = '';
    let category: 'general' | 'xp' | 'streak' = 'general';

    if (targetType === 'sessions') {
      description = `Complete ${val} total focus sessions.`;
      category = 'general';
    } else if (targetType === 'xp') {
      description = `Accumulate ${val} total Focus XP.`;
      category = 'xp';
    } else if (targetType === 'streak') {
      description = `Maintain a daily focus streak of ${val} days.`;
      category = 'streak';
    }

    addCustomAchievement({
      title: cleanTitle,
      description,
      icon: selectedEmoji,
      category,
      themeColor: selectedColor,
      targetValue: val,
      targetType,
    });

    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end md:justify-center items-center bg-[#050508]/85 px-4 pb-0 md:pb-6 md:px-6">
        <View
          className="w-full max-w-[420px] rounded-t-[32px] md:rounded-[32px] bg-[#11131A] border-t md:border border-[#1F2330] p-6"
          style={{
            maxHeight: '85%',
            shadowColor: selectedColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          {/* Top handle drag bar for bottom modal aesthetic */}
          <View className="w-12 h-1 bg-[#1F2330] rounded-full self-center mb-5 md:hidden" />

          {/* Header */}
          <Text className="text-white text-xl font-black tracking-wide text-center mb-1">
            Design <Text style={{ color: selectedColor }}>Custom Quest</Text>
          </Text>
          <Text className="text-[#6C758A] text-xs text-center mb-6">
            Architect a personalized Focus Milestone to conquer
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            style={{ flexGrow: 0 }}
          >
            {/* Quest Name */}
            <View className="mb-5">
              <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2">
                Quest Title / Objective
              </Text>
              <TextInput
                placeholder="e.g., Code Mastery Levelyn"
                placeholderTextColor="#4E546A"
                value={title}
                onChangeText={setTitle}
                maxLength={30}
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

            {/* Target Metric Type */}
            <View className="mb-5">
              <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2">
                Target Metric
              </Text>
              <View className="flex-row w-full bg-[#0A0A0F] p-1 rounded-2xl border border-[#1F2330]">
                {(['sessions', 'xp', 'streak'] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      setTargetType(type);
                      // Set logical default threshold value depending on type
                      if (type === 'sessions') setTargetValue('5');
                      if (type === 'xp') setTargetValue('500');
                      if (type === 'streak') setTargetValue('7');
                    }}
                    className={`flex-1 items-center py-2.5 rounded-xl ${
                      targetType === type ? 'bg-[#181A24]' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold capitalize ${
                        targetType === type ? 'text-[#7BE7FF]' : 'text-[#6C758A]'
                      }`}
                      style={targetType === type ? { color: selectedColor } : {}}
                    >
                      {type === 'streak' ? 'Streak Days' : type === 'xp' ? 'XP' : type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Threshold Value */}
            <View className="mb-5">
              <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2">
                Goal Threshold
              </Text>
              <TextInput
                placeholder="e.g. 10"
                keyboardType="number-pad"
                placeholderTextColor="#4E546A"
                value={targetValue}
                onChangeText={(val) => {
                  const cleaned = val.replace(/[^0-9]/g, '');
                  setTargetValue(cleaned);
                }}
                style={{
                  backgroundColor: '#0A0A0F',
                  color: '#fff',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#1F2330',
                  fontSize: 14,
                  fontWeight: '700',
                }}
              />
            </View>

            {/* Icon Picker */}
            <View className="mb-5">
              <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2">
                Select Quest Sigil
              </Text>
              <View className="flex-row flex-wrap gap-2.5 bg-[#0A0A0F] p-3.5 rounded-2xl border border-[#1F2330] justify-between">
                {EMOJIS.map((emoji) => (
                  <Pressable
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    className="w-10 h-10 rounded-xl justify-center items-center active:scale-95"
                    style={{
                      backgroundColor: selectedEmoji === emoji ? `${selectedColor}15` : 'transparent',
                      borderWidth: selectedEmoji === emoji ? 1.5 : 0,
                      borderColor: selectedColor,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Aura Color Picker */}
            <View className="mb-6">
              <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2">
                Milestone Aura Color
              </Text>
              <View className="flex-row gap-3 bg-[#0A0A0F] p-3.5 rounded-2xl border border-[#1F2330] justify-around">
                {THEME_COLORS.map((col) => (
                  <Pressable
                    key={col.hex}
                    onPress={() => setSelectedColor(col.hex)}
                    className="w-8 h-8 rounded-full border-2 justify-center items-center active:scale-95"
                    style={{
                      backgroundColor: col.hex,
                      borderColor: selectedColor === col.hex ? '#ffffff' : '#1F2330',
                    }}
                  />
                ))}
              </View>
            </View>

            {errorMsg ? (
              <Text className="text-[#E63946] text-xs font-bold text-center mb-4">{errorMsg}</Text>
            ) : null}

            {/* Action Row */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleClose}
                className="flex-1 py-3.5 rounded-xl border border-[#1F2330] bg-[#11131A] justify-center items-center active:opacity-85"
              >
                <Text className="text-[#6C758A] font-bold text-[13px] uppercase tracking-wider">
                  Discard
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                className="flex-1 py-3.5 rounded-xl justify-center items-center active:opacity-90"
                style={{
                  backgroundColor: selectedColor,
                  shadowColor: selectedColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Text className="text-[#05040A] font-bold text-[13px] uppercase tracking-wider">
                  Inscribe Quest
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
