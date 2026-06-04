import React, { useRef, useState } from 'react';
import { View, Text, Modal, Dimensions, ScrollView, SafeAreaView, Pressable, TextInput, Platform, Alert } from 'react-native';
import { useEventsStore, ActivityCategory, SessionEvent } from '../../store/events';
import { useProfileStore } from '../../store/profile';
import SessionCardSVG from '../../features/story-cards/SessionCardSVG';
import { exportView } from '../../features/story-cards/export';
import { totalXp, daysWithActivity } from '../../utils/aggregates';
import { levelFromXp } from '../../utils/levels';
import EditSessionModal from '../../components/EditSessionModal';

export default function Sessions() {
  const events = useEventsStore((s) => s.events);
  const profile = useProfileStore((s) => s.profile);
  
  const windowDimensions = Dimensions.get('window');

  // Page States
  const [activeTab, setActiveTab] = useState<'archives' | 'media'>('archives');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | ActivityCategory>('all');
  
  // Edit Modal States
  const [selectedEditSession, setSelectedEditSession] = useState<SessionEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Card Selection State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorPlatform, setSimulatorPlatform] = useState<'instagram' | 'whatsapp'>('instagram');
  const [selectedTemplate, setSelectedTemplate] = useState<'cyber_hud' | 'aurora' | 'synthwave' | 'stealth' | 'strava_sport' | 'transparent'>('cyber_hud');

  // Refs for low-res preview and high-res off-screen capture
  const previewRef = useRef<any>(null);
  const shareRef = useRef<any>(null);

  const username = profile?.username || 'Focus Cadet';
  const xp = totalXp(events);
  const { level } = levelFromXp(xp);
  const streak = daysWithActivity(events, 30);

  const activeTheme = profile?.theme || 'blue';
  const themeColors = {
    blue: '#7BE7FF',
    purple: '#B77BFF',
    teal: '#0DF5C4',
  };
  const activeColor = themeColors[activeTheme];

  const completedSessions = events.filter((e) => e.endedAt).reverse();
  const hasSessions = completedSessions.length > 0;

  const mockSession: SessionEvent = {
    id: 'mock-session',
    type: 'session',
    category: 'coding',
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    endedAt: new Date().toISOString(),
    xpEarned: 45,
    note: 'Built premium ascend feature cards',
  };

  const activeCompletedSessions = hasSessions ? completedSessions : [mockSession];

  // Filter completed sessions for Archives Tab
  const filteredSessions = completedSessions.filter((session) => {
    const matchesCategory = filterCategory === 'all' || session.category === filterCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      (session.note && session.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      session.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Determine currently selected session for the shareable card
  const selectedSession = activeCompletedSessions.find((s) => s.id === selectedSessionId) || activeCompletedSessions[0];

  function openEditModal(session: SessionEvent) {
    setSelectedEditSession(session);
    setShowEditModal(true);
  }

  function showAlert(title: string, message: string) {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: '#0A0A0F' }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="w-full mb-5 self-start flex-row justify-between items-center">
          <View>
            <Text className="text-[#6C758A] text-xs font-extrabold uppercase tracking-widest mb-1">
              FOCUS CONTROL
            </Text>
            <Text className="text-white text-2xl font-black tracking-wide">
              Sessions <Text style={{ color: activeColor }}>Hub</Text>
            </Text>
          </View>
        </View>

        {/* Custom Segmented Control */}
        <View 
          className="flex-row w-full bg-[#11131A] p-1 rounded-2xl border border-[#1F2330] mb-6"
          style={{ backgroundColor: '#11131A', borderColor: '#1F2330', borderWidth: 1, borderRadius: 16, overflow: 'hidden' }}
        >
          <Pressable
            onPress={() => setActiveTab('archives')}
            className={`flex-1 items-center py-3 rounded-xl border ${
              activeTab === 'archives' ? 'bg-[#181A24] border-[#1F2330]' : 'bg-transparent border-transparent'
            }`}
            style={{
              backgroundColor: activeTab === 'archives' ? '#181A24' : 'transparent',
              borderColor: activeTab === 'archives' ? '#1F2330' : 'transparent',
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text 
              className={`text-xs font-black uppercase tracking-wider ${activeTab === 'archives' ? 'text-white' : 'text-[#6C758A]'}`}
              style={{ color: activeTab === 'archives' ? '#ffffff' : '#6C758A', fontWeight: '900' }}
            >
              Session Archives
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('media')}
            className={`flex-1 items-center py-3 rounded-xl border ${
              activeTab === 'media' ? 'bg-[#181A24] border-[#1F2330]' : 'bg-transparent border-transparent'
            }`}
            style={{
              backgroundColor: activeTab === 'media' ? '#181A24' : 'transparent',
              borderColor: activeTab === 'media' ? '#1F2330' : 'transparent',
              borderWidth: 1,
              borderRadius: 12,
              paddingVertical: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text 
              className={`text-xs font-black uppercase tracking-wider ${activeTab === 'media' ? 'text-white' : 'text-[#6C758A]'}`}
              style={{ color: activeTab === 'media' ? '#ffffff' : '#6C758A', fontWeight: '900' }}
            >
              Media Deck
            </Text>
          </Pressable>
        </View>

        {activeTab === 'archives' ? (
          // ================= TAB 1: SESSION ARCHIVES =================
          <View className="w-full">
            {/* Search Input */}
            <TextInput
              placeholder="Search focus accomplishments..."
              placeholderTextColor="#4E546A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                width: '100%',
                backgroundColor: '#11131A',
                color: '#fff',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#1F2330',
                fontSize: 14,
                fontWeight: '600',
                marginBottom: 12,
              }}
            />

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-5 w-full">
              {(['all', 'coding', 'study', 'reading'] as const).map((cat) => {
                const isSelected = filterCategory === cat;
                const color = cat === 'coding' ? '#7BE7FF' : cat === 'study' ? '#B77BFF' : cat === 'reading' ? '#0DF5C4' : activeColor;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setFilterCategory(cat)}
                    className="px-4 py-2 rounded-full border mr-2 items-center justify-center"
                    style={{
                      borderColor: isSelected ? color : '#1F2330',
                      backgroundColor: isSelected ? `${color}15` : '#11131A',
                    }}
                  >
                    <Text className="text-[10px] font-black uppercase tracking-widest capitalize" style={{ color: isSelected ? color : '#6C758A' }}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Log Feed */}
            {filteredSessions.length === 0 ? (
              <View className="w-full py-16 px-6 rounded-3xl bg-[#11131A]/40 border border-[#1F2330]/50 items-center justify-center">
                <Text style={{ fontSize: 32 }} className="mb-4">🛰️</Text>
                <Text className="text-[#6C758A] text-sm font-extrabold uppercase tracking-widest text-center mb-1">
                  No records matching
                </Text>
                <Text className="text-[#4E546A] text-xs text-center">
                  Search query or category did not return any logs
                </Text>
              </View>
            ) : (
              filteredSessions.map((session) => {
                const minutes = Math.round(
                  (new Date(session.endedAt!).getTime() - new Date(session.startedAt).getTime()) / 60000
                );
                const dateStr = new Date(session.endedAt!).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const categoryColors = {
                  coding: { text: 'text-[#7BE7FF]', bg: 'bg-[#7BE7FF]/10', border: 'border-[#7BE7FF]/20', hex: '#7BE7FF' },
                  study: { text: 'text-[#B77BFF]', bg: 'bg-[#B77BFF]/10', border: 'border-[#B77BFF]/20', hex: '#B77BFF' },
                  reading: { text: 'text-[#0DF5C4]', bg: 'bg-[#0DF5C4]/10', border: 'border-[#0DF5C4]/20', hex: '#0DF5C4' },
                };
                const style = categoryColors[session.category] || categoryColors.coding;

                return (
                  <Pressable
                    key={session.id}
                    onPress={() => openEditModal(session)}
                    className="w-full p-4 rounded-2xl bg-[#11131A] border border-[#1F2330] flex-row justify-between items-center mb-3 shadow-md active:opacity-70"
                  >
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2 mb-1.5 flex-wrap">
                        {/* Pill tag */}
                        <View className={`px-2.5 py-0.5 rounded-full border ${style.bg} ${style.border}`}>
                          <Text className={`text-[8px] font-black uppercase tracking-wider ${style.text}`}>
                            {session.category}
                          </Text>
                        </View>
                        {/* Manual Tag */}
                        {session.manual && (
                          <View className="px-1.5 py-0.2 bg-[#FF9F1C]/10 rounded border border-[#FF9F1C]/20">
                            <Text className="text-[#FF9F1C] text-[8px] font-black uppercase tracking-widest">
                              Manual
                            </Text>
                          </View>
                        )}
                        <Text className="text-[#4E546A] text-[9px] font-bold">
                          {dateStr}
                        </Text>
                      </View>

                      {/* Header title */}
                      <Text className="text-white text-sm font-black tracking-wide">
                        Focused for {minutes}m
                      </Text>

                      {/* Focus Note */}
                      {session.note ? (
                        <Text className="text-[#A8B0C2] text-xs font-semibold italic mt-1.5" numberOfLines={1}>
                          “{session.note}”
                        </Text>
                      ) : (
                        <Text className="text-[#4E546A] text-[10px] font-semibold mt-1">
                          No notes entered. Tap to edit.
                        </Text>
                      )}
                    </View>

                    <View className="flex-row items-center gap-2.5">
                      <View className="bg-[#0A0A0F] px-3 py-1.5 rounded-xl border border-[#1F2330] items-center">
                        <Text className="text-[8px] font-bold text-[#6C758A] uppercase tracking-wider mb-0.5">XP</Text>
                        <Text className="text-white text-xs font-black" style={{ color: style.hex }}>
                          +{session.xpEarned || 0}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        ) : (
          // ================= TAB 2: MEDIA DECK =================
          <View className="items-center w-full">
            {!selectedSession ? (
              <View className="w-full py-16 px-6 rounded-3xl bg-[#11131A]/40 border border-[#1F2330]/50 items-center justify-center">
                <Text style={{ fontSize: 32 }} className="mb-4">📸</Text>
                <Text className="text-[#6C758A] text-sm font-extrabold uppercase tracking-widest text-center mb-1">
                  No focus sessions
                </Text>
                <Text className="text-[#4E546A] text-xs text-center">
                  Log or track a focus session to unlock your sharing deck!
                </Text>
              </View>
            ) : (
              <View className="items-center w-full">
                
                {/* Horizontal Scroll Selector (Carousel) */}
                <View className="w-full mb-6">
                  <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2.5">
                    {hasSessions ? "Select Focus Record for Card" : "Preview with Demo Record (No sessions logged)"}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {activeCompletedSessions.map((session) => {
                      const isSelected = selectedSession.id === session.id;
                      const catColor = session.category === 'coding' ? '#7BE7FF' : session.category === 'study' ? '#B77BFF' : '#0DF5C4';
                      const dateStr = new Date(session.endedAt!).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      });
                      const durationMins = Math.round(
                        (new Date(session.endedAt!).getTime() - new Date(session.startedAt).getTime()) / 60000
                      );

                      return (
                        <Pressable
                          key={session.id}
                          onPress={() => setSelectedSessionId(session.id)}
                          className="p-3 rounded-2xl border mr-3 w-[130px] justify-between h-[90px]"
                          style={{
                            borderColor: isSelected ? catColor : '#1F2330',
                            backgroundColor: isSelected ? `${catColor}12` : '#11131A',
                          }}
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catColor}15` }}>
                              <Text className="text-[7px] font-black uppercase tracking-widest" style={{ color: catColor }}>
                                {session.category}
                              </Text>
                            </View>
                            <Text className="text-[#4E546A] text-[8px] font-bold">{dateStr}</Text>
                          </View>
                          <Text className="text-white text-xs font-black">{durationMins} Mins</Text>
                          <Text className="text-[#6C758A] text-[8px] font-bold" numberOfLines={1}>
                            {session.note || 'No note'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Visual Template Selector */}
                <View className="w-full mb-6">
                  <Text className="text-[#889] text-[10px] font-black uppercase tracking-wider mb-2.5">
                    Select Story Template
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {([
                      { id: 'cyber_hud', name: 'Cyber HUD', icon: '🛰️', color: '#7BE7FF', desc: 'Neon Cyberpunk Grid' },
                      { id: 'aurora', name: 'Aurora Flow', icon: '🌌', color: '#B77BFF', desc: 'Sleek Glowing Orbs' },
                      { id: 'synthwave', name: 'Retro Grid', icon: '🌅', color: '#FF007F', desc: '80s Arcade Grid' },
                      { id: 'stealth', name: 'Stealth Carbon', icon: '🕶️', color: '#D4AF37', desc: 'Midnight Matte Gold' },
                      { id: 'strava_sport', name: 'Strava Sport', icon: '🏃‍♂️', color: '#FC4C02', desc: 'Athletic High-Impact' },
                      { id: 'transparent', name: 'Translucent HUD', icon: '🔳', color: '#B77BFF', desc: 'Transparent Checkerboard' },
                    ] as const).map((tmpl) => {
                      const isSelected = selectedTemplate === tmpl.id;
                      return (
                        <Pressable
                          key={tmpl.id}
                          onPress={() => setSelectedTemplate(tmpl.id)}
                          className="p-3 rounded-2xl border mr-3 w-[140px] justify-between h-[90px]"
                          style={{
                            borderColor: isSelected ? tmpl.color : '#1F2330',
                            backgroundColor: isSelected ? `${tmpl.color}12` : '#11131A',
                          }}
                        >
                          <View className="flex-row justify-between items-center">
                            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tmpl.color}15` }}>
                              <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: tmpl.color }}>
                                {tmpl.icon} {tmpl.name}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-white text-xs font-black mt-2">{tmpl.name}</Text>
                          <Text className="text-[#6C758A] text-[9px] font-bold" numberOfLines={1}>
                            {tmpl.desc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* SVG Card Container Box */}
                <View className="p-1 rounded-[20px] border border-[#1F2330] bg-[#11131A] shadow-2xl">
                  <View collapsable={false} ref={previewRef} style={{ width: 310, height: 550, overflow: 'hidden', borderRadius: 16 }}>
                    <SessionCardSVG 
                      width={310} 
                      height={550} 
                      username={username} 
                      category={selectedSession.category} 
                      duration={selectedSession.endedAt ? `${Math.round(((new Date(selectedSession.endedAt).getTime() - new Date(selectedSession.startedAt).getTime()) / 60000))}m` : '—'} 
                      xp={selectedSession.xpEarned || 0} 
                      level={level}
                      streak={streak}
                      note={selectedSession.note}
                      date={new Date(selectedSession.endedAt!).toLocaleDateString()}
                      templateId={selectedTemplate}
                    />
                  </View>
                </View>

                {/* hidden full high-res 1080x1920 off-screen render container */}
                <View style={{ position: 'absolute', top: -9999, left: -9999, width: 1080, height: 1920, overflow: 'hidden' }} collapsable={false} ref={shareRef}>
                  <SessionCardSVG 
                    width={1080} 
                    height={1920} 
                    username={username} 
                    category={selectedSession.category} 
                    duration={selectedSession.endedAt ? `${Math.round(((new Date(selectedSession.endedAt).getTime() - new Date(selectedSession.startedAt).getTime()) / 60000))}m` : '—'} 
                    xp={selectedSession.xpEarned || 0} 
                    level={level}
                    streak={streak}
                    note={selectedSession.note}
                    date={new Date(selectedSession.endedAt!).toLocaleDateString()}
                    templateId={selectedTemplate}
                  />
                </View>

                {/* Action Buttons */}
                <View className="mt-6 w-full max-w-[310px] gap-3">
                  {/* Primary Share / Save button */}
                  <Pressable
                    onPress={async () => {
                      try {
                        await exportView(
                          shareRef,
                          `levelyn-session-${selectedSession.id}.png`,
                          { transparent: selectedTemplate === 'transparent' }
                        );
                        if (Platform.OS === 'web') {
                          showAlert('Saved', 'Pristine story card downloaded successfully.');
                        }
                      } catch (e) {
                        console.warn(e);
                      }
                    }}
                    className="w-full py-4 rounded-2xl justify-center items-center shadow-lg"
                    style={{
                      backgroundColor: activeColor,
                      shadowColor: activeColor,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 5,
                    }}
                  >
                    <Text className="text-[#05040A] font-black text-sm uppercase tracking-widest" style={{ color: '#05040A', fontWeight: '900' }}>
                      🚀 Share / Save Card
                    </Text>
                  </Pressable>

                  {/* Secondary Side-by-Side: View Full and Simulator */}
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setShowFull(true)}
                      className="flex-1 py-3.5 rounded-xl border justify-center items-center"
                      style={{
                        borderColor: '#FFFFFF30',
                        backgroundColor: '#FFFFFF0A',
                      }}
                    >
                      <Text className="text-white font-extrabold text-xs uppercase tracking-wider" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                        👁️ View Full
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setShowSimulator(true)}
                      className="flex-1 py-3.5 rounded-xl border justify-center items-center shadow-md"
                      style={{
                        borderColor: '#0DF5C440',
                        backgroundColor: '#0DF5C40D',
                      }}
                    >
                      <Text className="text-[#0DF5C4] font-extrabold text-xs uppercase tracking-wider" style={{ color: '#0DF5C4', fontWeight: '800' }}>
                        ✨ Simulator
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Interactive Smartphone Story/Status Simulator Modal */}
                <Modal visible={showSimulator} animationType="slide" transparent={false}>
                  <View className="flex-1 bg-[#05040A] items-center justify-center py-6 px-4" style={{ backgroundColor: '#05040A' }}>
                    <SafeAreaView className="w-full max-w-[420px] items-center justify-between h-full flex-1">
                      
                      {/* Modal Header */}
                      <View className="w-full items-center mb-4">
                        <Text className="text-[#6C758A] text-[10px] font-extrabold tracking-widest uppercase mb-1" style={{ color: '#6C758A', fontWeight: '800' }}>
                          LEVELYN // SOCIAL ENGINE
                        </Text>
                        <Text className="text-white text-lg font-black uppercase tracking-wide" style={{ color: '#ffffff', fontWeight: '900' }}>
                          Story <Text style={{ color: activeColor }}>Simulator</Text>
                        </Text>
                        <Text className="text-[#4E546A] text-xs text-center mt-0.5" style={{ color: '#4E546A' }}>
                          Preview card inside Instagram & WhatsApp safe zones
                        </Text>
                      </View>

                      {/* Simulator Platform Selector Pills */}
                      <View 
                        className="flex-row bg-[#11131A] p-1 rounded-2xl border border-[#1F2330] mb-5 w-full max-w-[320px]" 
                        style={{ backgroundColor: '#11131A', borderColor: '#1F2330', borderWidth: 1, borderRadius: 16 }}
                      >
                        <Pressable
                          onPress={() => setSimulatorPlatform('instagram')}
                          className="flex-1 py-2.5 rounded-xl items-center justify-center"
                          style={{
                            backgroundColor: simulatorPlatform === 'instagram' ? '#E1306C' : 'transparent',
                            borderRadius: 12,
                          }}
                        >
                          <Text className="text-white font-extrabold text-[11px] uppercase tracking-wider" style={{ color: '#ffffff', fontWeight: '800' }}>
                            📸 Instagram
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setSimulatorPlatform('whatsapp')}
                          className="flex-1 py-2.5 rounded-xl items-center justify-center"
                          style={{
                            backgroundColor: simulatorPlatform === 'whatsapp' ? '#25D366' : 'transparent',
                            borderRadius: 12,
                          }}
                        >
                          <Text className="text-white font-extrabold text-[11px] uppercase tracking-wider" style={{ color: '#ffffff', fontWeight: '800' }}>
                            💬 WhatsApp
                          </Text>
                        </Pressable>
                      </View>

                      {/* Interactive Smartphone Viewport (Perfect 9:16) */}
                      <View 
                        className="relative rounded-[36px] border-[6px] border-[#1F2330] bg-black overflow-hidden shadow-2xl"
                        style={{
                          width: 320,
                          height: 568,
                          borderColor: '#1F2330',
                          borderWidth: 6,
                          borderRadius: 36,
                          shadowColor: activeColor,
                          shadowOffset: { width: 0, height: 12 },
                          shadowOpacity: 0.15,
                          shadowRadius: 30,
                        }}
                      >
                        {/* 1. Main Rendered SVG Card (Scaled precisely to 320x568 inside viewport) */}
                        <View style={{ width: 320, height: 568, overflow: 'hidden' }}>
                          <SessionCardSVG 
                            width={320} 
                            height={568} 
                            username={username} 
                            category={selectedSession.category} 
                            duration={selectedSession.endedAt ? `${Math.round(((new Date(selectedSession.endedAt).getTime() - new Date(selectedSession.startedAt).getTime()) / 60000))}m` : '—'} 
                            xp={selectedSession.xpEarned || 0} 
                            level={level}
                            streak={streak}
                            note={selectedSession.note}
                            date={new Date(selectedSession.endedAt!).toLocaleDateString()}
                            templateId={selectedTemplate}
                          />
                        </View>

                        {/* 2. Platform Overlays */}
                        {simulatorPlatform === 'instagram' ? (
                          // Instagram Story Mockup UI
                          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', padding: 12 }}>
                            {/* Instagram Top Bar */}
                            <View style={{ width: '100%' }}>
                              {/* Stories progress bar ticks */}
                              <View style={{ flexDirection: 'row', gap: 4, width: '100%', marginBottom: 8 }}>
                                <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 1 }} />
                                <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 1 }} />
                                <View style={{ flex: 1, height: 2, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 1 }} />
                              </View>
                              {/* Creator profile details */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  {/* Instagram Avatar Circle */}
                                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#181A24', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 10 }}>🛰️</Text>
                                  </View>
                                  <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '800' }}>{username}</Text>
                                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontWeight: '600' }}>14h</Text>
                                </View>
                                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 12 }}>•••</Text>
                              </View>
                            </View>

                            {/* Instagram Bottom Bar */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 4 }}>
                              <View style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderColor: 'rgba(255, 255, 255, 0.35)', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 20, borderWidth: 1 }}>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, fontWeight: '600' }}>Send message...</Text>
                              </View>
                              {/* Heart and DM icons */}
                              <Text style={{ fontSize: 18 }}>❤️</Text>
                              <Text style={{ fontSize: 18 }}>✈️</Text>
                            </View>
                          </View>
                        ) : (
                          // WhatsApp Status Mockup UI
                          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', padding: 12 }}>
                            {/* WhatsApp Top Bar */}
                            <View style={{ width: '100%' }}>
                              {/* WhatsApp Status ticks */}
                              <View style={{ flexDirection: 'row', gap: 6, width: '100%', marginBottom: 8 }}>
                                <View style={{ flex: 1, height: 3, backgroundColor: '#ffffff', borderRadius: 1.5 }} />
                              </View>
                              {/* Contact profile details */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' }}>
                                <Text style={{ color: '#ffffff', fontSize: 16 }}>←</Text>
                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#11131A', borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={{ fontSize: 12 }}>🛰️</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>{username}</Text>
                                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 9 }}>Just now</Text>
                                </View>
                                <Text style={{ color: '#ffffff', fontWeight: '800' }}>⋮</Text>
                              </View>
                            </View>

                            {/* WhatsApp Bottom Bar */}
                            <View style={{ alignItems: 'center', width: '100%', marginBottom: 4 }}>
                              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>^</Text>
                              <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Reply</Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Modal Footer Controls */}
                      <View style={{ width: '100%', gap: 12, marginTop: 16 }}>
                        <Pressable
                          onPress={async () => {
                            try {
                              await exportView(
                                shareRef,
                                `levelyn-session-${selectedSession.id}.png`,
                                { transparent: selectedTemplate === 'transparent' }
                              );
                              if (Platform.OS === 'web') {
                                showAlert('Saved', 'Pristine story card downloaded successfully.');
                              }
                            } catch (e) {
                              console.warn(e);
                            }
                          }}
                          className="w-full py-3.5 rounded-xl justify-center items-center shadow-lg"
                          style={{
                            backgroundColor: activeColor,
                            shadowColor: activeColor,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 4,
                          }}
                        >
                          <Text className="text-[#05040A] font-extrabold text-xs uppercase tracking-wider" style={{ color: '#05040A', fontWeight: '800' }}>
                            📥 Download / Export Card
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => setShowSimulator(false)}
                          className="w-full py-3 rounded-xl border border-[#1F2330] bg-[#11131A] justify-center items-center"
                          style={{
                            backgroundColor: '#11131A',
                            borderColor: '#1F2330',
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingVertical: 12,
                          }}
                        >
                          <Text className="text-[#6C758A] font-extrabold text-xs uppercase tracking-wider" style={{ color: '#6C758A', fontWeight: '800' }}>
                            Exit Simulator
                          </Text>
                        </Pressable>
                      </View>

                    </SafeAreaView>
                  </View>
                </Modal>

                {/* Full Screen High-res Preview Modal */}
                <Modal visible={showFull} animationType="slide">
                  <View className="flex-1 bg-[#05040A]">
                    <ScrollView
                      style={{ backgroundColor: '#05040A' }}
                      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}
                      showsVerticalScrollIndicator={false}
                    >
                      <View className="p-1 rounded-[24px] border border-[#1F2330] bg-[#11131A] shadow-2xl mb-8">
                        <View style={{ width: windowDimensions.width - 40, height: Math.round((windowDimensions.width - 40) * (1920 / 1080)), overflow: 'hidden', borderRadius: 20 }}>
                          <SessionCardSVG 
                            width={windowDimensions.width - 40} 
                            height={Math.round((windowDimensions.width - 40) * (1920 / 1080))} 
                            username={username} 
                            category={selectedSession.category} 
                            duration={selectedSession.endedAt ? `${Math.round(((new Date(selectedSession.endedAt).getTime() - new Date(selectedSession.startedAt).getTime()) / 60000))}m` : '—'} 
                            xp={selectedSession.xpEarned || 0} 
                            level={level}
                            streak={streak}
                            note={selectedSession.note}
                            date={new Date(selectedSession.endedAt!).toLocaleDateString()}
                            templateId={selectedTemplate}
                          />
                        </View>
                      </View>

                      <View className="gap-3 w-full max-w-[280px]">
                        <Pressable
                          onPress={async () => {
                            try {
                              await exportView(
                                shareRef,
                                `levelyn-session-story.png`,
                                { transparent: selectedTemplate === 'transparent' }
                              );
                            } catch (e) {
                              console.warn(e);
                            }
                          }}
                          className="w-full py-3.5 rounded-xl justify-center items-center"
                          style={{ backgroundColor: activeColor }}
                        >
                          <Text className="text-[#05040A] font-extrabold text-xs uppercase tracking-wider">
                            🚀 Share High-Res Story
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => setShowFull(false)}
                          className="w-full py-3 rounded-xl border border-[#1F2330] bg-[#11131A] justify-center items-center"
                        >
                          <Text className="text-[#6C758A] font-extrabold text-xs uppercase tracking-wider">
                            Close Preview
                          </Text>
                        </Pressable>
                      </View>
                    </ScrollView>
                  </View>
                </Modal>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Log Modal */}
      <EditSessionModal
        visible={showEditModal}
        session={selectedEditSession}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEditSession(null);
        }}
      />
    </SafeAreaView>
  );
}
