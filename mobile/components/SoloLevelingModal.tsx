import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, TextInput, Alert, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useSoloLevelingStore, StatName, Skill } from '../store/soloLeveling';
import { useProfileStore } from '../store/profile';
import { useEventsStore } from '../store/events';
import { useGoalsStore } from '../store/goals';

function showSystemAlert(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    if (typeof alert !== 'undefined') {
      alert(`${title}\n\n${message}`);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
}

function showSystemConfirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    const hasWindow = typeof window !== 'undefined';
    const confirmed = hasWindow && typeof window.confirm === 'function'
      ? window.confirm(`${title}\n\n${message}`)
      : false;
    if (confirmed) onConfirm();
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset System', style: 'destructive', onPress: onConfirm }
      ]
    );
  }
}

type Props = {
  visible: boolean;
  onClose: () => void;
  level: number;
};

export default function SoloLevelingModal({ visible, onClose, level }: Props) {
  const profile = useProfileStore((s) => s.profile);
  const { height: screenHeight } = useWindowDimensions();
  
  // Zustand store bindings
  const {
    jobClass,
    title,
    strength,
    agility,
    vitality,
    intelligence,
    sense,
    statPoints,
    fatigue,
    skills,
    updateField,
    incrementStat,
    addSkill,
    upgradeSkill,
    deleteSkill,
    rest,
    resetStatus
  } = useSoloLevelingStore();

  // Local state for editing fields
  const [editingClass, setEditingClass] = useState(false);
  const [tempClass, setTempClass] = useState(jobClass);
  
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  // Manual Calibration state (permits direct typing of stats/points)
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibStats, setCalibStats] = useState({
    strength: String(strength),
    agility: String(agility),
    vitality: String(vitality),
    intelligence: String(intelligence),
    sense: String(sense),
    statPoints: String(statPoints)
  });

  // Sync state when opening the modal or store values update
  useEffect(() => {
    if (visible) {
      setCalibStats({
        strength: String(strength),
        agility: String(agility),
        vitality: String(vitality),
        intelligence: String(intelligence),
        sense: String(sense),
        statPoints: String(statPoints)
      });
      setTempClass(jobClass);
      setTempTitle(title);
    }
  }, [visible, strength, agility, vitality, intelligence, sense, statPoints, jobClass, title]);

  // Add custom skill local state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState<'active' | 'passive'>('active');

  function handleSaveClass() {
    updateField('jobClass', tempClass.trim() || 'Focus Cadet');
    setEditingClass(false);
  }

  function handleSaveTitle() {
    updateField('title', tempTitle.trim() || 'One Who Surmounted Adversity');
    setEditingTitle(false);
  }

  function handleRest() {
    rest();
    showSystemAlert('SYSTEM MESSAGE', 'Fatigue has been fully recovered. Mana and health restored.');
  }

  function handleApplyCalibration() {
    const s = parseInt(calibStats.strength) || 10;
    const a = parseInt(calibStats.agility) || 10;
    const v = parseInt(calibStats.vitality) || 10;
    const i = parseInt(calibStats.intelligence) || 10;
    const se = parseInt(calibStats.sense) || 10;
    const pts = parseInt(calibStats.statPoints) || 0;

    updateField('strength', s);
    updateField('agility', a);
    updateField('vitality', v);
    updateField('intelligence', i);
    updateField('sense', se);
    updateField('statPoints', pts);

    setCalibrationMode(false);
    showSystemAlert('SYSTEM RECALIBRATION', 'Status metrics updated successfully.');
  }

  function handleAddNewSkill() {
    if (!newSkillName.trim()) {
      showSystemAlert('SYSTEM WARNING', 'Please enter a valid skill designation.');
      return;
    }
    addSkill(newSkillName, newSkillType);
    setNewSkillName('');
    showSystemAlert('SYSTEM MESSAGE', `New skill [${newSkillName}] unlocked.`);
  }

  // Group skills
  const activeSkills = skills.filter((s) => s.type === 'active');
  const passiveSkills = skills.filter((s) => s.type === 'passive');

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/85 px-4 py-6">
        <View 
          className="w-full max-w-[390px] rounded-2xl bg-[#070D19]/95 border-2 border-[#00F0FF] overflow-hidden"
          style={{
            shadowColor: '#00F0FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 20,
            elevation: 10,
            maxHeight: screenHeight * 0.82, // Constrain container height to 82% of screen height
          }}
        >
          {/* Header Banner */}
          <View className="bg-[#0A1830] border-b border-[#00F0FF]/30 px-4 py-3 flex-row justify-between items-center">
            <View>
              <Text className="text-[#00F0FF] text-[11px] font-black tracking-widest uppercase">
                » STATUS WINDOW «
              </Text>
              <Text className="text-[#00A3FF] text-[8px] font-bold tracking-widest mt-0.5">
                ACCESS KEY ACTIVE
              </Text>
            </View>
            <Pressable 
              onPress={onClose}
              className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 items-center justify-center active:bg-red-500/30"
            >
              <Text className="text-red-500 text-[11px] font-black">✕</Text>
            </Pressable>
          </View>

          <ScrollView 
            className="px-4 py-3"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* PROFILE DECK */}
            <View className="mb-3.5 border border-[#00F0FF]/20 bg-[#09152B]/80 rounded-xl p-3">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-[#00F0FF] text-[9px] font-black uppercase tracking-widest mb-0.5">
                    HUNTER IDENTIFICATION
                  </Text>
                  <Text className="text-white text-lg font-black tracking-wide">
                    {profile?.username || 'Sung Jin-Woo'}
                  </Text>
                </View>
                <View className="px-3 py-1 rounded-md bg-[#00F0FF]/10 border border-[#00F0FF]/40">
                  <Text className="text-[#00F0FF] text-[10px] font-black uppercase">
                    LVL {level}
                  </Text>
                </View>
              </View>

              {/* Job Class Inline Editor */}
              <View className="mb-2.5">
                <Text className="text-[#00A3FF] text-[8px] font-bold uppercase tracking-widest mb-1">
                  JOB CLASS
                </Text>
                {editingClass ? (
                  <View className="flex-row gap-2">
                    <TextInput
                      value={tempClass}
                      onChangeText={setTempClass}
                      maxLength={24}
                      className="flex-1 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                    />
                    <Pressable onPress={handleSaveClass} className="px-3 bg-[#00F0FF] rounded-lg items-center justify-center">
                      <Text className="text-[#070D19] text-[10px] font-bold">Save</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => { setTempClass(jobClass); setEditingClass(true); }} className="flex-row items-center gap-1.5 active:opacity-75">
                    <Text className="text-white text-xs font-extrabold">{jobClass}</Text>
                    <Text style={{ fontSize: 10 }}>✏️</Text>
                  </Pressable>
                )}
              </View>

              {/* Title Inline Editor */}
              <View className="mb-2">
                <Text className="text-[#00A3FF] text-[8px] font-bold uppercase tracking-widest mb-1">
                  ACTIVE TITLE
                </Text>
                {editingTitle ? (
                  <View className="flex-row gap-2">
                    <TextInput
                      value={tempTitle}
                      onChangeText={setTempTitle}
                      maxLength={40}
                      className="flex-1 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                    />
                    <Pressable onPress={handleSaveTitle} className="px-3 bg-[#00F0FF] rounded-lg items-center justify-center">
                      <Text className="text-[#070D19] text-[10px] font-bold">Save</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={() => { setTempTitle(title); setEditingTitle(true); }} className="flex-row items-center gap-1.5 active:opacity-75">
                    <Text className="text-white text-xs font-extrabold">{title}</Text>
                    <Text style={{ fontSize: 10 }}>✏️</Text>
                  </Pressable>
                )}
              </View>

              {/* Vitals row */}
              <View className="flex-row gap-3 mt-4 pt-3 border-t border-[#00F0FF]/15">
                <View className="flex-1">
                  <Text className="text-red-500 text-[8px] font-extrabold tracking-widest mb-0.5">HP</Text>
                  <Text className="text-white text-xs font-bold">{1000 + level * 50} / {1000 + level * 50}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[#00A3FF] text-[8px] font-extrabold tracking-widest mb-0.5">MP</Text>
                  <Text className="text-white text-xs font-bold">{500 + level * 25} / {500 + level * 25}</Text>
                </View>
              </View>

              {/* Fatigue HUD segment */}
              <View className="mt-3.5 pt-3 border-t border-[#00F0FF]/15">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white text-[9px] font-black uppercase tracking-widest">FATIGUE: {fatigue} / 100</Text>
                  <Pressable onPress={handleRest} className="px-2 py-0.5 rounded bg-[#00F0FF]/20 border border-[#00F0FF]/40 active:bg-[#00F0FF]/40">
                    <Text className="text-[#00F0FF] text-[8px] font-black uppercase">REST</Text>
                  </Pressable>
                </View>
                <View className="h-1.5 w-full bg-[#050C19] border border-[#00F0FF]/20 rounded-full overflow-hidden">
                  <View className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, fatigue)}%` }} />
                </View>
              </View>
            </View>

            {/* ATTRIBUTE MATRIX SECTION */}
            <View className="mb-3.5 border border-[#00F0FF]/20 bg-[#09152B]/80 rounded-xl p-3">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase">
                  [ ATTRIBUTE DECK ]
                </Text>

                {/* Switch to Override/Calibration mode */}
                <Pressable 
                  onPress={() => {
                    setCalibStats({
                      strength: String(strength),
                      agility: String(agility),
                      vitality: String(vitality),
                      intelligence: String(intelligence),
                      sense: String(sense),
                      statPoints: String(statPoints)
                    });
                    setCalibrationMode(!calibrationMode);
                  }}
                  className="px-2 py-1 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 active:bg-[#00F0FF]/30"
                >
                  <Text className="text-[#00F0FF] text-[8px] font-bold">
                    {calibrationMode ? 'Standard Mode' : 'Calibration Mode'}
                  </Text>
                </Pressable>
              </View>

              {!calibrationMode ? (
                // STANDARD INCREMENTS MODE
                <View>
                  <View className="flex-row justify-between items-center mb-1 bg-[#0A1830]/40 p-2 rounded-xl border border-[#00F0FF]/10">
                    <Text className="text-[#00F0FF] text-[10px] font-black">AVAILABLE POINTS</Text>
                    <Text className="text-[#00F0FF] text-sm font-black">{statPoints}</Text>
                  </View>

                  {/* Strength Row */}
                  <View className="flex-row justify-between items-center py-2.5 border-b border-[#00F0FF]/10">
                    <Text className="text-white text-xs font-bold">💪 Strength</Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[#00F0FF] text-xs font-black">{strength}</Text>
                      <Pressable
                        disabled={statPoints <= 0}
                        onPress={() => incrementStat('strength')}
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          statPoints > 0 
                            ? 'bg-[#00F0FF]/20 border-[#00F0FF] active:bg-[#00F0FF]/40' 
                            : 'bg-transparent border-[#00F0FF]/10 opacity-30'
                        }`}
                      >
                        <Text className="text-[#00F0FF] text-xs font-black">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Agility Row */}
                  <View className="flex-row justify-between items-center py-2.5 border-b border-[#00F0FF]/10">
                    <Text className="text-white text-xs font-bold">⚡ Agility</Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[#00F0FF] text-xs font-black">{agility}</Text>
                      <Pressable
                        disabled={statPoints <= 0}
                        onPress={() => incrementStat('agility')}
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          statPoints > 0 
                            ? 'bg-[#00F0FF]/20 border-[#00F0FF] active:bg-[#00F0FF]/40' 
                            : 'bg-transparent border-[#00F0FF]/10 opacity-30'
                        }`}
                      >
                        <Text className="text-[#00F0FF] text-xs font-black">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Vitality Row */}
                  <View className="flex-row justify-between items-center py-2.5 border-b border-[#00F0FF]/10">
                    <Text className="text-white text-xs font-bold">❤️ Vitality</Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[#00F0FF] text-xs font-black">{vitality}</Text>
                      <Pressable
                        disabled={statPoints <= 0}
                        onPress={() => incrementStat('vitality')}
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          statPoints > 0 
                            ? 'bg-[#00F0FF]/20 border-[#00F0FF] active:bg-[#00F0FF]/40' 
                            : 'bg-transparent border-[#00F0FF]/10 opacity-30'
                        }`}
                      >
                        <Text className="text-[#00F0FF] text-xs font-black">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Intelligence Row */}
                  <View className="flex-row justify-between items-center py-2.5 border-b border-[#00F0FF]/10">
                    <Text className="text-white text-xs font-bold">🧠 Intelligence</Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[#00F0FF] text-xs font-black">{intelligence}</Text>
                      <Pressable
                        disabled={statPoints <= 0}
                        onPress={() => incrementStat('intelligence')}
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          statPoints > 0 
                            ? 'bg-[#00F0FF]/20 border-[#00F0FF] active:bg-[#00F0FF]/40' 
                            : 'bg-transparent border-[#00F0FF]/10 opacity-30'
                        }`}
                      >
                        <Text className="text-[#00F0FF] text-xs font-black">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Sense Row */}
                  <View className="flex-row justify-between items-center py-2.5">
                    <Text className="text-white text-xs font-bold">👁️ Sense</Text>
                    <View className="flex-row items-center gap-3">
                      <Text className="text-[#00F0FF] text-xs font-black">{sense}</Text>
                      <Pressable
                        disabled={statPoints <= 0}
                        onPress={() => incrementStat('sense')}
                        className={`w-6 h-6 rounded-lg items-center justify-center border ${
                          statPoints > 0 
                            ? 'bg-[#00F0FF]/20 border-[#00F0FF] active:bg-[#00F0FF]/40' 
                            : 'bg-transparent border-[#00F0FF]/10 opacity-30'
                        }`}
                      >
                        <Text className="text-[#00F0FF] text-xs font-black">+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ) : (
                // MANUAL OVERRIDE OVERWRITE CALIBRATION MODE
                <View>
                  <Text className="text-[#00A3FF] text-[8px] font-bold mb-3 uppercase tracking-wider">
                    CALIBRATE SYSTEM NUMBERS DIRECTLY:
                  </Text>
                  
                  {/* Points Edit Input */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-xs font-bold">Available Points</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={calibStats.statPoints}
                      onChangeText={(val) => setCalibStats({ ...calibStats, statPoints: val })}
                      className="w-16 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2 py-0.5 text-[#00F0FF] text-center text-xs font-bold"
                    />
                  </View>

                  {/* Strength Input */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-xs font-bold">💪 Strength</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={calibStats.strength}
                      onChangeText={(val) => setCalibStats({ ...calibStats, strength: val })}
                      className="w-16 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2 py-0.5 text-white text-center text-xs font-bold"
                    />
                  </View>

                  {/* Agility Input */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-xs font-bold">⚡ Agility</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={calibStats.agility}
                      onChangeText={(val) => setCalibStats({ ...calibStats, agility: val })}
                      className="w-16 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2 py-0.5 text-white text-center text-xs font-bold"
                    />
                  </View>

                  {/* Vitality Input */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-xs font-bold">❤️ Vitality</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={calibStats.vitality}
                      onChangeText={(val) => setCalibStats({ ...calibStats, vitality: val })}
                      className="w-16 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2 py-0.5 text-white text-center text-xs font-bold"
                    />
                  </View>

                  {/* Intelligence Input */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-xs font-bold">🧠 Intelligence</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={calibStats.intelligence}
                      onChangeText={(val) => setCalibStats({ ...calibStats, intelligence: val })}
                      className="w-16 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2 py-0.5 text-white text-center text-xs font-bold"
                    />
                  </View>

                  {/* Sense Input */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white text-xs font-bold">👁️ Sense</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={calibStats.sense}
                      onChangeText={(val) => setCalibStats({ ...calibStats, sense: val })}
                      className="w-16 bg-[#050B14] border border-[#00F0FF]/40 rounded-lg px-2 py-0.5 text-white text-center text-xs font-bold"
                    />
                  </View>

                  {/* Apply calibration trigger button */}
                  <Pressable 
                    onPress={handleApplyCalibration}
                    className="w-full py-2 bg-[#00F0FF] rounded-xl items-center justify-center mt-2"
                  >
                    <Text className="text-[#070D19] text-xs font-black uppercase tracking-wider">
                      Apply Recalibration
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* SKILLS DECK */}
            <View className="border border-[#00F0FF]/20 bg-[#09152B]/80 rounded-xl p-3">
              <Text className="text-[#00F0FF] text-[10px] font-black tracking-widest uppercase mb-3">
                [ ACTIVE & PASSIVE SKILL MATRIX ]
              </Text>

              {/* Active Skills Subsection */}
              <Text className="text-[#00A3FF] text-[8px] font-extrabold uppercase tracking-widest mb-2">
                ACTIVE SKILLS
              </Text>
              {activeSkills.length === 0 ? (
                <Text className="text-[#4E546A] text-[10px] italic mb-3">No active skill matrix found.</Text>
              ) : (
                activeSkills.map((s) => (
                  <View key={s.id} className="flex-row justify-between items-center py-2 border-b border-[#00F0FF]/10">
                    <View className="flex-1 pr-2">
                      <Text className="text-white text-xs font-bold">{s.name}</Text>
                      <Text className="text-[#6C758A] text-[9px]">Type: Active Focus Burst</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-[#00F0FF]/10 border border-[#00F0FF]/25 px-2 py-0.5 rounded">
                        <Text className="text-[#00F0FF] text-[8px] font-black">LVL {s.level}</Text>
                      </View>
                      <Pressable 
                        onPress={() => upgradeSkill(s.id)}
                        className="w-5 h-5 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/40 items-center justify-center active:bg-[#00F0FF]/40"
                      >
                        <Text className="text-[#00F0FF] text-xs font-bold">+</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => deleteSkill(s.id)}
                        className="w-5 h-5 rounded-lg bg-red-500/10 border border-red-500/40 items-center justify-center active:bg-red-500/40"
                      >
                        <Text className="text-red-500 text-[10px] font-bold">✕</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}

              {/* Passive Skills Subsection */}
              <Text className="text-[#00A3FF] text-[8px] font-extrabold uppercase tracking-widest mt-4 mb-2">
                PASSIVE SKILLS
              </Text>
              {passiveSkills.length === 0 ? (
                <Text className="text-[#4E546A] text-[10px] italic mb-3">No passive traits unlocked.</Text>
              ) : (
                passiveSkills.map((s) => (
                  <View key={s.id} className="flex-row justify-between items-center py-2 border-b border-[#00F0FF]/10">
                    <View className="flex-1 pr-2">
                      <Text className="text-white text-xs font-bold">{s.name}</Text>
                      <Text className="text-[#6C758A] text-[9px]">Type: Passive Trait</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-[#00F0FF]/10 border border-[#00F0FF]/25 px-2 py-0.5 rounded">
                        <Text className="text-[#00F0FF] text-[8px] font-black">LVL {s.level}</Text>
                      </View>
                      <Pressable 
                        onPress={() => upgradeSkill(s.id)}
                        className="w-5 h-5 rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/40 items-center justify-center active:bg-[#00F0FF]/40"
                      >
                        <Text className="text-[#00F0FF] text-xs font-bold">+</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => deleteSkill(s.id)}
                        className="w-5 h-5 rounded-lg bg-red-500/10 border border-red-500/40 items-center justify-center active:bg-red-500/40"
                      >
                        <Text className="text-red-500 text-[10px] font-bold">✕</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}

              {/* Add Custom Skill Form */}
              <View className="mt-4 pt-3 border-t border-[#00F0FF]/20">
                <Text className="text-[#00A3FF] text-[8px] font-black uppercase tracking-widest mb-2">
                  DEVELOP NEW ABILITY
                </Text>
                
                <TextInput
                  placeholder="Designate Skill Name"
                  placeholderTextColor="#4E546A"
                  value={newSkillName}
                  onChangeText={setNewSkillName}
                  maxLength={25}
                  className="bg-[#050B14] border border-[#00F0FF]/30 rounded-xl px-3 py-2 text-white text-xs font-semibold mb-3"
                />

                <View className="flex-row gap-2 mb-3">
                  <Pressable 
                    onPress={() => setNewSkillType('active')}
                    className={`flex-1 py-1.5 rounded-lg border items-center justify-center ${
                      newSkillType === 'active' 
                        ? 'bg-[#00F0FF]/20 border-[#00F0FF]' 
                        : 'bg-[#050B14] border-[#00F0FF]/15'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${newSkillType === 'active' ? 'text-[#00F0FF]' : 'text-[#6C758A]'}`}>
                      Active Ability
                    </Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setNewSkillType('passive')}
                    className={`flex-1 py-1.5 rounded-lg border items-center justify-center ${
                      newSkillType === 'passive' 
                        ? 'bg-[#00F0FF]/20 border-[#00F0FF]' 
                        : 'bg-[#050B14] border-[#00F0FF]/15'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${newSkillType === 'passive' ? 'text-[#00F0FF]' : 'text-[#6C758A]'}`}>
                      Passive Trait
                    </Text>
                  </Pressable>
                </View>

                <Pressable 
                  onPress={handleAddNewSkill}
                  className="w-full py-2.5 rounded-xl border border-[#00F0FF] bg-[#00F0FF]/10 items-center justify-center active:bg-[#00F0FF]/20"
                >
                  <Text className="text-[#00F0FF] text-[10px] font-black uppercase tracking-wider">
                    + Wake Up Skill Matrix
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* RESET OPTION */}
            <Pressable 
              onPress={() => {
                showSystemConfirm(
                  'SYSTEM PURGE PROTOCOL',
                  'Are you absolutely sure you want to reset everything? This will permanently delete your profile, focus logs, S-Rank stats, daily goals, and reset your level to 1 (like a new user).',
                  () => {
                    // 1. Reset S-Rank stats
                    resetStatus();
                    
                    // 2. Clear all session events (resets XP and Level to 1)
                    useEventsStore.getState().replaceEvents([]);
                    
                    // 3. Clear daily goals
                    useGoalsStore.setState({ activeGoal: null, completedGoalsCount: 0 });
                    
                    // 4. Clear user profile (triggers fresh onboarding modal)
                    useProfileStore.getState().clearProfile();

                    // 5. Reset S-Rank social networks, guilds, bosses, presence and leaderboards
                    require('../store/social').useSocialStore.getState().resetSocial();
                    require('../store/leaderboard').useLeaderboardStore.getState().resetLeaderboard();
                    require('../store/guilds').useGuildsStore.getState().resetGuilds();
                    require('../store/boss').useBossStore.getState().resetBoss();
                    require('../store/presence').usePresenceStore.getState().resetPresence();
                    
                    onClose();
                    showSystemAlert('SYSTEM PURGE', 'All system data purged successfully. Onboarding activated.');
                  }
                );
              }}
              className="mt-6 w-full py-2 bg-red-950/20 border border-red-500/30 rounded-xl items-center justify-center active:bg-red-500/10"
            >
              <Text className="text-red-500/60 text-[9px] font-black uppercase tracking-widest">
                Reset System status
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
