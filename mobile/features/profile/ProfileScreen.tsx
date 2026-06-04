import React, { useState } from 'react';
import { View, Text, Alert, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { useProfileStore, AvatarName } from '../../store/profile';
import { useEventsStore } from '../../store/events';
import { exportBackup, importBackup } from '../../utils/backup';
import { totalXp, totalHours, calculateStreak } from '../../utils/aggregates';
import { levelFromXp } from '../../utils/levels';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../../utils/achievements';
import { useSoloLevelingStore } from '../../store/soloLeveling';
import { useGoalsStore } from '../../store/goals';
import { useSocialStore } from '../../store/social';
import { useLeaderboardStore } from '../../store/leaderboard';
import { useGuildsStore } from '../../store/guilds';
import { useBossStore } from '../../store/boss';
import { usePresenceStore } from '../../store/presence';
import FocusHeatmap from '../../components/FocusHeatmap';
import { useTheme, AVATARS, SURFACE, THEMES, type ThemeName } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { pushProfile } from '../../lib/sync';

export default function ProfileScreen() {
  const { profile, activeColor, avatar, themeName } = useTheme();
  const { user, signOut } = useAuth();
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const replaceEvents = useEventsStore((s) => s.replaceEvents);
  const events = useEventsStore((s) => s.events);
  const [loading, setLoading] = useState(false);

  // Use hook selectors for reactivity (not getState())
  const soloLeveling = useSoloLevelingStore();
  const social = useSocialStore();

  const xp = totalXp(events);
  const { level } = levelFromXp(xp);
  const focusHours = totalHours(events);
  const streak = calculateStreak(events);

  const unlockedSet = getUnlockedAchievements(events, streak, xp);
  const achievementsPct = ACHIEVEMENTS.length > 0 ? Math.round((unlockedSet.size / ACHIEVEMENTS.length) * 100) : 0;

  const theme = THEMES[themeName];

  function showAlert(title: string, message: string) {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  async function onExport() {
    setLoading(true);
    try {
      await exportBackup();
    } catch (e) {
      showAlert('Export failed', String(e));
    }
    setLoading(false);
  }

  async function onImport() {
    setLoading(true);
    try {
      const data = await importBackup();
      if (!data) {
        setLoading(false);
        return;
      }
      if (data.profile) setProfile(data.profile);
      if (data.events && Array.isArray(data.events)) replaceEvents(data.events);
      showAlert('Import complete', 'Your profile and focus history have been successfully loaded.');
    } catch (e) {
      showAlert('Import failed', String(e));
    }
    setLoading(false);
  }

  function handleThemeChange(t: ThemeName) {
    if (profile) {
      setProfile({ ...profile, theme: t });
      if (user) pushProfile(user.id);
    }
  }

  function handleAvatarChange(av: AvatarName) {
    if (profile) {
      setProfile({ ...profile, avatar: av });
      if (user) pushProfile(user.id);
    }
  }

  function handlePrivacyToggle() {
    if (profile) {
      const nextPrivate = !profile.isPrivate;
      setProfile({ ...profile, isPrivate: nextPrivate });
      if (user) pushProfile(user.id);
      showAlert(
        nextPrivate ? 'Stealth Mode Activated' : 'Stealth Mode Deactivated',
        nextPrivate 
          ? 'You have gone off-grid. Other S-Rank hunters can no longer locate you in suggestions.'
          : 'Your portal registry is now open to the public network.'
      );
    }
  }

  function handleReset() {
    const performReset = () => {
      replaceEvents([]);
      clearProfile();
      useSoloLevelingStore.getState().resetStatus();
      useGoalsStore.setState({ activeGoal: null, completedGoalsCount: 0 });
      useSocialStore.getState().resetSocial();
      useLeaderboardStore.getState().resetLeaderboard();
      useGuildsStore.getState().resetGuilds();
      useBossStore.getState().resetBoss();
      usePresenceStore.getState().resetPresence();
      showAlert('Reset Complete', 'Your dashboard has been cleared.');
    };

    if (Platform.OS === 'web') {
      const hasWindow = typeof window !== 'undefined';
      const confirmed = hasWindow && typeof window.confirm === 'function'
        ? window.confirm('Are you absolutely sure you want to delete all focus sessions and reset your stats? This action is irreversible.')
        : false;
      if (confirmed) {
        performReset();
      }
    } else {
      Alert.alert(
        'Reset Data',
        'Are you absolutely sure you want to delete all focus sessions and reset your stats? This action is irreversible.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Everything',
            style: 'destructive',
            onPress: performReset,
          },
        ]
      );
    }
  }

  const avatarEntries = Object.entries(AVATARS) as [AvatarName, string][];

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]" style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: SURFACE.bg }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, paddingHorizontal: 20, backgroundColor: SURFACE.bg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-[#6C758A] text-xs font-extrabold uppercase tracking-widest mb-1">
            User Hub
          </Text>
          <Text className="text-white text-2xl font-black tracking-wide">
            Settings & <Text style={{ color: theme.primary }}>Profile</Text>
          </Text>
        </View>

        {/* Profile Card */}
        <View className="w-full p-6 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6 flex-row items-center gap-5 shadow-lg">
          <View
            className="w-16 h-16 rounded-3xl items-center justify-center border-2"
            style={{ borderColor: theme.primary, backgroundColor: theme.primary + '15' }}
          >
            <Text style={{ fontSize: 32 }}>{avatar}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-black tracking-wide">
              {profile?.display_name || profile?.username || 'Focus Cadet'}
            </Text>
            {profile?.display_name && (
              <Text className="text-[#6C758A] text-[10px] font-black uppercase tracking-widest mt-0.5">
                @{profile.username}
              </Text>
            )}
            <Text className="text-[#6C758A] text-xs font-semibold mt-1 uppercase tracking-wider">
              Level {level} • {focusHours.toFixed(1)}h Focused
            </Text>
            <View className="flex-row gap-4 mt-2 pt-2 border-t border-[#1F2330]">
              <Text className="text-[#A8B0C2] text-[10px] font-black uppercase tracking-wider">
                Followers: {social.followers.length}
              </Text>
              <Text className="text-[#A8B0C2] text-[10px] font-black uppercase tracking-wider">
                Following: {social.following.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Character Status HUD */}
        <View 
          className="w-full p-5 mb-6 rounded-3xl bg-[#070D19]/90 border-2 overflow-hidden relative shadow-md"
          style={{
            borderColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          }}
        >
          <Text className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: theme.primary }}>
            » SYSTEM CHARACTER STATUS «
          </Text>
          <Text className="text-white text-base font-black tracking-wide">
            {profile?.display_name || profile?.username || 'Sung Jin-Woo'}
          </Text>
          <Text className="text-[#6C758A] text-[9px] font-extrabold uppercase tracking-widest leading-none mt-1">
            TITLE: {soloLeveling.title}
          </Text>
          <Text className="text-white text-xs font-bold leading-tight mt-1.5">
            CLASS: {soloLeveling.jobClass}
          </Text>

          {/* Vitals row */}
          <View className="flex-row gap-3 mt-4 pt-3 border-t border-white/10">
            <View className="flex-1">
              <Text className="text-red-500 text-[8px] font-extrabold tracking-widest mb-0.5">HP</Text>
              <Text className="text-white text-[11px] font-bold">{1000 + level * 50} / {1000 + level * 50}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#00A3FF] text-[8px] font-extrabold tracking-widest mb-0.5">MP</Text>
              <Text className="text-white text-[11px] font-bold">{500 + level * 25} / {500 + level * 25}</Text>
            </View>
            <View className="flex-1 pl-3 border-l border-white/10">
              <Text className="text-amber-500 text-[8px] font-extrabold tracking-widest mb-0.5">FATIGUE</Text>
              <Text className="text-white text-[11px] font-bold">{soloLeveling.fatigue} / 100</Text>
            </View>
          </View>
        </View>

        {/* Focus Heatmap */}
        <FocusHeatmap events={events} />

        {/* Unlocked Skills */}
        <View className="w-full p-5 mb-6 rounded-3xl bg-[#11131A] border border-[#1F2330] shadow-sm">
          <Text className="text-white text-xs font-extrabold tracking-wider mb-4 uppercase">
            🛡️ Unlocked S-Rank Skills ({soloLeveling.skills.length})
          </Text>
          <View className="flex-col gap-2">
            {soloLeveling.skills.map((sk) => (
              <View 
                key={sk.id}
                className="w-full p-3 rounded-2xl bg-[#0A0A0F] border border-[#1F2330]/80 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-white text-xs font-black">{sk.name}</Text>
                  <Text className="text-[#6C758A] text-[8px] font-bold uppercase mt-0.5">{sk.type} Focus Burst</Text>
                </View>
                <View className="px-2.5 py-0.5 rounded border border-[#0DF5C4]/35 bg-[#0DF5C4]/10">
                  <Text className="text-[#0DF5C4] text-[8px] font-black">LVL {sk.level}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Focus Sessions */}
        <View className="w-full p-5 mb-6 rounded-3xl bg-[#11131A] border border-[#1F2330] shadow-sm">
          <Text className="text-white text-xs font-extrabold tracking-wider mb-4 uppercase">
            📁 Recent Focus Missions
          </Text>
          <View className="flex-col gap-2">
            {events.filter((e) => e.endedAt).slice(-3).reverse().map((ev) => {
              const durationMins = Math.round((new Date(ev.endedAt!).getTime() - new Date(ev.startedAt).getTime()) / 60000);
              const dateStr = new Date(ev.endedAt!).toLocaleDateString([], { month: 'short', day: 'numeric' });
              return (
                <View 
                  key={ev.id}
                  className="w-full p-3.5 rounded-2xl bg-[#0A0A0F] border border-[#1F2330]/80 flex-row justify-between items-center"
                >
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <View className="px-2 py-0.2 rounded bg-white/5 border border-white/10">
                        <Text className="text-white text-[7px] font-black uppercase">{ev.category}</Text>
                      </View>
                      <Text className="text-[#6C758A] text-[8px] font-bold">{dateStr}</Text>
                    </View>
                    <Text className="text-white text-xs font-black">Focused {durationMins}m</Text>
                    {ev.note && <Text className="text-[#A8B0C2] text-[9px] font-bold mt-0.5 italic">"{ev.note}"</Text>}
                  </View>
                  <Text className="text-emerald-400 text-xs font-black">+{ev.xpEarned || 0} XP</Text>
                </View>
              );
            })}
            {events.filter((e) => e.endedAt).length === 0 && (
              <Text className="text-[#4E546A] text-[10px] italic py-2">No focus sessions completed yet.</Text>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 w-full mb-6">
          <View className="flex-1 p-4 rounded-2xl bg-[#11131A] border border-[#1F2330] items-center justify-center">
            <Text className="text-[9px] font-bold text-[#6C758A] uppercase tracking-wider mb-1">Streak</Text>
            <Text className="text-white text-base font-black">{streak} Days</Text>
          </View>
          <View className="flex-1 p-4 rounded-2xl bg-[#11131A] border border-[#1F2330] items-center justify-center">
            <Text className="text-[9px] font-bold text-[#6C758A] uppercase tracking-wider mb-1">Milestones</Text>
            <Text className="text-base font-black" style={{ color: theme.primary }}>{achievementsPct}%</Text>
          </View>
          <View className="flex-1 p-4 rounded-2xl bg-[#11131A] border border-[#1F2330] items-center justify-center">
            <Text className="text-[9px] font-bold text-[#6C758A] uppercase tracking-wider mb-1">Total XP</Text>
            <Text className="text-white text-base font-black">{xp} XP</Text>
          </View>
        </View>

        {/* Avatar Picker */}
        <View className="w-full p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6 shadow-lg">
          <Text className="text-white text-xs font-extrabold tracking-wider mb-4 uppercase">
            Choose Futuristic Emblem
          </Text>
          <View className="flex-row gap-2.5">
            {avatarEntries.map(([key, emoji]) => {
              const isSelected = profile?.avatar === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleAvatarChange(key)}
                  className={`flex-1 items-center justify-center p-3 rounded-xl border-2 ${
                    isSelected ? 'bg-[#181A24]' : 'border-transparent bg-[#0A0A0F]'
                  }`}
                  style={{ borderColor: isSelected ? theme.primary : 'transparent' }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</Text>
                  <Text className={`text-[8px] font-black uppercase ${isSelected ? 'text-white' : 'text-[#6C758A]'}`}>
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* S-Rank Privacy Settings */}
        <View className="w-full p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6 shadow-lg">
          <Text className="text-white text-xs font-extrabold tracking-wider mb-2.5 uppercase">
            S-Rank Stealth Settings
          </Text>
          <Text className="text-[#6C758A] text-[10px] font-semibold leading-relaxed mb-4">
            Toggle Stealth Mode to hide your hunter profile and prevent other users from locating you.
          </Text>

          <Pressable
            onPress={handlePrivacyToggle}
            className={`w-full p-4 rounded-2xl border flex-row justify-between items-center ${
              profile?.isPrivate 
                ? 'bg-red-500/10 border-red-500/35' 
                : 'bg-[#0A0A0F] border-[#1F2330]'
            }`}
          >
            <View className="flex-1 pr-2">
              <Text className="text-white text-xs font-black tracking-wide uppercase">
                {profile?.isPrivate ? '🔴 Stealth Mode Active' : '🟢 Public Hunters Grid'}
              </Text>
              <Text className="text-[#6C758A] text-[9px] mt-0.5 font-bold">
                {profile?.isPrivate 
                  ? 'Your profile is hidden from user search' 
                  : 'You appear in Suggested Hunters lists'}
              </Text>
            </View>
            <View 
              className={`w-10 h-6 rounded-full p-0.5 justify-center ${
                profile?.isPrivate ? 'bg-red-500 items-end' : 'bg-zinc-800 items-start'
              }`}
            >
              <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </View>
          </Pressable>
        </View>

        {/* Theme Switcher */}
        <View className="w-full p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6 shadow-lg">
          <Text className="text-white text-xs font-extrabold tracking-wider mb-4 uppercase">
            Active Theme Accent
          </Text>
          <View className="flex-row gap-3">
            {(['blue', 'purple', 'teal'] as ThemeName[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => handleThemeChange(t)}
                className={`flex-1 items-center justify-center p-3.5 rounded-xl border-2 ${
                  themeName === t ? 'bg-[#181A24]' : 'border-transparent bg-[#0A0A0F]'
                }`}
                style={{ borderColor: themeName === t ? THEMES[t].primary : 'transparent' }}
              >
                <View className="w-4.5 h-4.5 rounded-full mb-1.5" style={{ backgroundColor: THEMES[t].primary }} />
                <Text className={`text-xs font-extrabold capitalize ${themeName === t ? 'text-white' : 'text-[#6C758A]'}`}>
                  {THEMES[t].label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Data Management */}
        <View className="w-full p-5 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6 shadow-lg">
          <Text className="text-white text-xs font-extrabold tracking-wider mb-4 uppercase">
            Data Deck Management
          </Text>

          {loading ? (
            <View className="py-4 items-center justify-center">
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : (
            <View className="gap-3">
              <Pressable
                onPress={onExport}
                className="w-full p-4 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-white text-xs font-black tracking-wide uppercase">Export Backup</Text>
                  <Text className="text-[#6C758A] text-[10px] mt-0.5 font-semibold">Share your session history and stats</Text>
                </View>
                <Text className="text-[#6C758A] text-lg font-bold">→</Text>
              </Pressable>

              <Pressable
                onPress={onImport}
                className="w-full p-4 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-white text-xs font-black tracking-wide uppercase">Import Backup</Text>
                  <Text className="text-[#6C758A] text-[10px] mt-0.5 font-semibold">Restore previous session logs</Text>
                </View>
                <Text className="text-[#6C758A] text-lg font-bold">→</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View className="w-full gap-3">
          <Pressable
            onPress={signOut}
            className="w-full py-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 justify-center items-center"
          >
            <Text className="text-amber-500 text-xs font-extrabold uppercase tracking-widest">
              Sign Out
            </Text>
          </Pressable>
          <Pressable
            onPress={handleReset}
            className="w-full py-4 rounded-2xl border border-[#E63946]/30 bg-[#E63946]/5 justify-center items-center"
          >
            <Text className="text-[#E63946] text-xs font-extrabold uppercase tracking-widest">
              Wipe Local Database
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
