import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useEventsStore, ActivityCategory, SessionEvent } from '../store/events';
import { useProfileStore } from '../store/profile';
import { xpForSeconds } from '../utils/xp';

type Props = {
  visible: boolean;
  session: SessionEvent | null;
  onClose: () => void;
};

export default function EditSessionModal({ visible, session, onClose }: Props) {
  const { updateEvent, deleteEvent } = useEventsStore();
  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const [category, setCategory] = useState<ActivityCategory>('coding');
  const [durationMins, setDurationMins] = useState('30');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate form when session changes
  useEffect(() => {
    if (session) {
      setCategory(session.category);
      setNote(session.note || '');
      
      const durationSecs = session.endedAt
        ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
        : 0;
      setDurationMins(String(Math.round(durationSecs / 60) || 30));
    }
  }, [session, visible]);

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

  const mins = parseInt(durationMins) || 0;
  const estimatedXp = xpForSeconds(category, mins * 60);

  function handleSave() {
    if (!session) return;
    setErrorMsg('');

    if (mins <= 0) {
      setErrorMsg('Please enter a valid duration.');
      return;
    }
    if (mins > 480) {
      setErrorMsg('Focus limit exceeded (Max 8 hours).');
      return;
    }

    const ended = session.endedAt ? new Date(session.endedAt) : new Date();
    const started = new Date(ended.getTime() - mins * 60 * 1000);

    updateEvent(session.id, {
      category,
      note: note.trim() || undefined,
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      xpEarned: estimatedXp,
    });

    onClose();
  }

  function handleDelete() {
    if (!session) return;

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(
        'Are you sure you want to permanently delete this focus log? The XP gained will be deducted.'
      );
      if (confirmDelete) {
        deleteEvent(session.id);
        onClose();
      }
    } else {
      Alert.alert(
        'Delete Focus Log',
        'Are you sure you want to permanently delete this focus log? The XP gained will be deducted.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Permanently',
            style: 'destructive',
            onPress: () => {
              deleteEvent(session.id);
              onClose();
            },
          },
        ]
      );
    }
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
            Edit <Text style={{ color: theme.primary }}>Focus Log</Text>
          </Text>
          <Text className="text-[#6C758A] text-xs text-center mb-6">
            Modify archives details or remove this session
          </Text>

          {/* Category Tabs */}
          <View className="mb-4">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2">
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

          {/* Duration Input */}
          <View className="mb-4">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2">
              Duration (Minutes)
            </Text>
            <View className="flex-row gap-2 items-center">
              <TextInput
                placeholder="Duration"
                keyboardType="number-pad"
                placeholderTextColor="#4E546A"
                value={durationMins}
                onChangeText={setDurationMins}
                style={{
                  flex: 1,
                  backgroundColor: '#0A0A0F',
                  color: '#fff',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#1F2330',
                  fontSize: 15,
                  fontWeight: 'bold',
                }}
              />
              <View className="px-4 py-3 bg-[#181A24] rounded-xl border border-[#1F2330]">
                <Text className="text-white text-xs font-black uppercase tracking-wider">
                  Mins
                </Text>
              </View>
            </View>
          </View>

          {/* Note Input */}
          <View className="mb-5">
            <Text className="text-[#889] text-[10px] font-bold uppercase tracking-wider mb-2">
              Focus Note / Accomplishment
            </Text>
            <TextInput
              placeholder="What did you focus on?"
              placeholderTextColor="#4E546A"
              value={note}
              onChangeText={setNote}
              maxLength={70}
              style={{
                backgroundColor: '#0A0A0F',
                color: '#fff',
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#1F2330',
                fontSize: 14,
                fontWeight: '600',
              }}
            />
          </View>

          {/* Yield Preview */}
          <View className="mb-5 p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] flex-row justify-between items-center">
            <Text className="text-[#6C758A] text-xs font-extrabold uppercase tracking-widest">
              XP Yield
            </Text>
            <Text className="text-white text-base font-black" style={{ color: catTheme.primary }}>
              +{estimatedXp} XP
            </Text>
          </View>

          {errorMsg ? (
            <Text className="text-[#E63946] text-xs font-bold text-center mb-4">{errorMsg}</Text>
          ) : null}

          {/* Action Row */}
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={onClose}
              className="flex-1 py-3 rounded-xl border border-[#1F2330] bg-[#11131A] justify-center items-center"
            >
              <Text className="text-[#6C758A] font-bold text-xs uppercase tracking-wider">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              className="flex-1 py-3 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 justify-center items-center"
            >
              <Text className="text-[#E63946] font-bold text-xs uppercase tracking-wider">
                Delete
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              className="flex-1 py-3 rounded-xl justify-center items-center"
              style={{
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text className="text-[#05040A] font-bold text-xs uppercase tracking-wider">
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
