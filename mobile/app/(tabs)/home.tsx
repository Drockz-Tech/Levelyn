import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import SessionCard from '../../components/SessionCard';
import OnboardingModal from '../../features/onboarding/OnboardingModal';
import ManualLogModal from '../../components/ManualLogModal';
import { useEventsStore } from '../../store/events';
import { totalXp, calculateStreak } from '../../utils/aggregates';
import SoloLevelingBar from '../../components/SoloLevelingBar';
import DashboardCarousel from '../../components/DashboardCarousel';
import BossBattleCard from '../../components/BossBattleCard';
import LiveFocusCard from '../../components/LiveFocusCard';
import ActivityFeed from '../../components/ActivityFeed';
import { useTheme, SURFACE } from '../../constants/theme';
import { useAuth } from '../../lib/AuthContext';
import { pullFromSupabase } from '../../lib/sync';

export default function Home() {
  const router = useRouter();
  const { profile, activeColor, avatar } = useTheme();

  const handleNavigate = (path: string) => {
    if (Platform.OS === 'web') {
      (document.activeElement as HTMLElement)?.blur();
    }
    router.push(path as any);
  };
  const { user } = useAuth();
  const [showOnboard, setShowOnboard] = useState(!profile);
  const [showManualLog, setShowManualLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'raid' | 'alliance'>('raid');
  const events = useEventsStore((s) => s.events);
  const xp = totalXp(events);
  const streak = calculateStreak(events);
  
  useEffect(() => {
    if (!profile || !profile.avatar || !profile.theme) {
      setShowOnboard(true);
    } else {
      setShowOnboard(false);
    }
  }, [profile]);

  // Sync from Supabase on first load when authenticated
  useEffect(() => {
    if (user) {
      pullFromSupabase(user).catch(console.error);
      // Initialize Supabase Presence channel
      require('../../store/presence').usePresenceStore.getState().initPresence(user.id);
    }
  }, [user]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: SURFACE.bg }}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingVertical: 24, 
          paddingHorizontal: 20, 
          alignItems: 'center', 
          backgroundColor: SURFACE.bg 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">

          {/* ── Header Greeting ─────────────────────────────── */}
          <View className="w-full flex-row justify-between items-center mb-6">
            <View className="flex-row items-center gap-3">
              <View 
                className="w-12 h-12 rounded-2xl bg-[#11131A] border items-center justify-center shadow-lg"
                style={{ borderColor: `${activeColor}20` }}
              >
                <Text style={{ fontSize: 24 }}>{avatar}</Text>
              </View>
              <View>
                <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mb-0.5">
                  SYSTEM OVERVIEW
                </Text>
                <Text className="text-white text-xl font-black tracking-wide">
                  Hello, <Text style={{ color: activeColor }}>{profile?.username || 'Focus Cadet'}</Text>
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowManualLog(true)}
                className="px-3.5 py-2 rounded-xl bg-[#11131A] border border-[#1F2330] justify-center active:bg-[#181A24]"
              >
                <Text className="text-[#A8B0C2] text-[10px] font-black tracking-wider uppercase">+ Log</Text>
              </Pressable>
            </View>
          </View>

          {/* ── S-Rank Level Bar ────────────────────────────── */}
          <SoloLevelingBar xp={xp} />

          {/* ── Command Center (Quick Actions) ──────────────── */}
          <View className="w-full mb-6 mt-2">
            <Text className="text-[#4E546A] text-[9px] font-black uppercase tracking-widest mb-3 pl-1">
              ⚡ Operations Panel
            </Text>
            <View className="flex-row gap-3 w-full">
              <Pressable 
                onPress={() => handleNavigate('/people')}
                className="flex-1 py-4 rounded-2xl bg-[#11131A] border border-[#1F2330] items-center justify-center active:bg-[#181A24] shadow-sm"
                style={{ shadowColor: activeColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>👥</Text>
                <Text className="text-white text-[10px] font-black uppercase tracking-wider">Network</Text>
              </Pressable>
              <Pressable 
                onPress={() => handleNavigate('/guild')}
                className="flex-1 py-4 rounded-2xl bg-[#11131A] border border-[#1F2330] items-center justify-center active:bg-[#181A24] shadow-sm"
                style={{ shadowColor: activeColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🛡️</Text>
                <Text className="text-white text-[10px] font-black uppercase tracking-wider">Guilds</Text>
              </Pressable>
              <Pressable 
                onPress={() => handleNavigate('/challenges')}
                className="flex-1 py-4 rounded-2xl bg-[#11131A] border border-[#1F2330] items-center justify-center active:bg-[#181A24] shadow-sm"
                style={{ shadowColor: activeColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🏆</Text>
                <Text className="text-white text-[10px] font-black uppercase tracking-wider">Quests</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Operational Status Tabs ─────────────────────── */}
          <View className="w-full mb-6">
            <View className="flex-row justify-between items-center mb-3 px-1">
              <Text className="text-[#4E546A] text-[9px] font-black uppercase tracking-widest">
                🎮 Presence & Threats
              </Text>
              <View className="flex-row bg-[#11131A] p-1 rounded-xl border border-[#1F2330]">
                <Pressable
                  onPress={() => setActiveTab('raid')}
                  className={`px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 ${
                    activeTab === 'raid' ? 'bg-[#181A24]' : 'bg-transparent'
                  }`}
                >
                  <Text className="text-[10px]">👹</Text>
                  <Text
                    className={`text-[9px] font-black uppercase tracking-wider ${
                      activeTab === 'raid' ? 'text-white' : 'text-[#6C758A]'
                    }`}
                  >
                    Raid
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveTab('alliance')}
                  className={`px-3 py-1.5 rounded-lg flex-row items-center gap-1.5 ${
                    activeTab === 'alliance' ? 'bg-[#181A24]' : 'bg-transparent'
                  }`}
                >
                  <Text className="text-[10px]">🟢</Text>
                  <Text
                    className={`text-[9px] font-black uppercase tracking-wider ${
                      activeTab === 'alliance' ? 'text-white' : 'text-[#6C758A]'
                    }`}
                  >
                    Alliance
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Active Tab Panel */}
            <View className="w-full">
              {activeTab === 'raid' ? (
                <BossBattleCard />
              ) : (
                <LiveFocusCard />
              )}
            </View>
          </View>

          {/* ── Performance Deck (Carousel) ─────────────────── */}
          <View className="w-full mb-6">
            <Text className="text-[#4E546A] text-[9px] font-black uppercase tracking-widest mb-3 pl-1">
              📈 Performance Deck
            </Text>
            <DashboardCarousel onRecordPress={() => setShowManualLog(true)} />
          </View>



          {/* ── Focus Chamber (Redirect Banner) ──────────────── */}
          <View className="w-full mb-6">
            <Text className="text-[#4E546A] text-[9px] font-black uppercase tracking-widest mb-3 pl-1">
              ⏱️ Focus Chamber
            </Text>
            <Pressable
              onPress={() => handleNavigate('/focus')}
              className="w-full p-5 rounded-2xl bg-[#11131A] border items-center justify-between flex-row active:bg-[#181A24] shadow-lg"
              style={{
                borderColor: `${activeColor}30`,
                shadowColor: activeColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 15,
                elevation: 4,
              }}
            >
              <View className="flex-1 pr-4">
                <Text className="text-white text-base font-extrabold tracking-wide mb-1">
                  Enter Focus Chamber
                </Text>
                <Text className="text-[#6C758A] text-[10px] leading-relaxed">
                  Start a focus session, defeat operational threats, and advance your rank ascension.
                </Text>
              </View>
              <View 
                className="w-10 h-10 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: `${activeColor}15`,
                  borderColor: `${activeColor}40`,
                }}
              >
                <Text style={{ fontSize: 18 }}>⚡</Text>
              </View>
            </Pressable>
          </View>

          {/* ── Social Feed ────────────────────────────────── */}
          <View className="w-full mb-8">
            <View className="flex-row justify-between items-center mb-3 px-1">
              <Text className="text-[#4E546A] text-[9px] font-black uppercase tracking-widest">
                📡 Alliance Feed
              </Text>
              <Pressable onPress={() => handleNavigate('/people')}>
                <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: activeColor }}>
                  See All →
                </Text>
              </Pressable>
            </View>
            <ActivityFeed limit={3} />
          </View>

          <OnboardingModal visible={showOnboard} onClose={() => setShowOnboard(false)} />
          <ManualLogModal visible={showManualLog} onClose={() => setShowManualLog(false)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
