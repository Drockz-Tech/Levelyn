import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { useGuildsStore } from '../store/guilds';
import { useTheme, SURFACE } from '../constants/theme';
import { AVATARS, DEFAULT_AVATAR } from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../lib/AuthContext';

export default function GuildScreen() {
  const { profile, activeColor } = useTheme();
  const { user } = useAuth();

  const { 
    guildsList, 
    joinedGuildId, 
    joinGuild, 
    leaveGuild, 
    sendChatMessage,
    fetchGuilds,
    checkMyGuildMembership,
    fetchRosterAndContributions,
    fetchChatMessages,
    subscribeToGuildMessages,
    loading
  } = useGuildsStore();

  const [activeTab, setActiveTab] = useState<'hq' | 'chat'>('hq');
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchGuilds();
    if (user) {
      checkMyGuildMembership(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (joinedGuildId) {
      fetchRosterAndContributions(joinedGuildId);
      fetchChatMessages(joinedGuildId);
      const unsubscribe = subscribeToGuildMessages(joinedGuildId);
      return () => unsubscribe();
    }
  }, [joinedGuildId]);

  const userGuild = guildsList.find((g) => g.id === joinedGuildId);
  const availableGuilds = guildsList.filter((g) => g.id !== joinedGuildId);

  const myAvatar = profile?.avatar ? AVATARS[profile.avatar] : DEFAULT_AVATAR;

  const handleJoin = (guildId: string) => {
    if (!user) return;
    joinGuild(guildId, user.id);
  };

  const handleLeave = () => {
    if (!user || !joinedGuildId) return;
    leaveGuild(joinedGuildId, user.id);
  };

  const handleSendChat = () => {
    if (!user || !joinedGuildId || !chatInput.trim()) return;
    sendChatMessage(joinedGuildId, user.id, chatInput.trim());
    setChatInput('');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]" style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScreenHeader
        subtitle="Command Center"
        title="Guild Alliance"
        badge={userGuild ? `${userGuild.name} Active` : undefined}
        badgeColor={userGuild?.bannerColor}
      />

      {userGuild ? (
        <View className="flex-1">
          {/* Tab Controller */}
          <View className="flex-row px-5 py-3 bg-[#0A0A0F]">
            <View className="flex-row w-full bg-[#11131A] p-1 rounded-2xl border border-[#1F2330]">
              <Pressable 
                onPress={() => setActiveTab('hq')}
                className={`flex-1 py-2 rounded-xl items-center justify-center ${activeTab === 'hq' ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
              >
                <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'hq' ? 'text-white' : 'text-[#6C758A]'}`}>
                  🛡️ Headquarters
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-xl items-center justify-center ${activeTab === 'chat' ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
              >
                <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'chat' ? 'text-white' : 'text-[#6C758A]'}`}>
                  💬 Command Chat
                </Text>
              </Pressable>
            </View>
          </View>

          {activeTab === 'hq' ? (
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              
              {/* Guild Banner */}
              <View 
                className="w-full p-5 mb-5 rounded-3xl bg-[#09152B]/80 border-2"
                style={{ borderColor: userGuild.bannerColor }}
              >
                <Text className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: userGuild.bannerColor }}>
                  ALLIANCE REGISTRY
                </Text>
                <Text className="text-white text-xl font-black">{userGuild.name}</Text>
                <Text className="text-[#A8B0C2] text-xs font-semibold leading-relaxed mt-2 italic">
                  "{userGuild.description}"
                </Text>

                <View className="mt-4 pt-4 border-t border-white/10">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-white text-[9px] font-black uppercase">Weekly Guild Mission</Text>
                    <Text className="text-white text-[9px] font-black">{userGuild.guildXp} / {userGuild.weeklyGoal} XP</Text>
                  </View>
                  <View className="h-2 w-full bg-[#050C19] border border-white/15 rounded-full overflow-hidden">
                    <View className="h-full rounded-full" style={{ backgroundColor: userGuild.bannerColor, width: `${Math.min(100, (userGuild.guildXp / userGuild.weeklyGoal) * 100)}%` }} />
                  </View>
                </View>
              </View>

              {/* Roster */}
              <Text className="text-[#6C758A] text-[10px] font-black uppercase tracking-wider mb-3">
                Active Alliance Roster ({userGuild.members.length})
              </Text>
              {userGuild.members.map((member) => (
                <View 
                  key={member.id}
                  className="w-full p-4 mb-3 rounded-2xl bg-[#11131A] border border-[#1F2330] flex-row justify-between items-center"
                >
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 rounded-xl bg-[#0A0A0F] border border-[#1F2330] items-center justify-center">
                      <Text style={{ fontSize: 16 }}>{member.avatar}</Text>
                    </View>
                    <View>
                      <Text className="text-white text-xs font-black">{member.username}</Text>
                      <Text className="text-[#6C758A] text-[8px] font-bold mt-0.5">LV. {member.level}</Text>
                    </View>
                  </View>
                  
                  <View className="bg-[#0A0A0F] border border-[#1F2330] px-3 py-1.5 rounded-xl items-end">
                    <Text className="text-[#6C758A] text-[7px] font-bold uppercase tracking-wider mb-0.5">Contribution</Text>
                    <Text className="text-white text-xs font-black" style={{ color: userGuild.bannerColor }}>
                      +{member.weeklyContribution} XP
                    </Text>
                  </View>
                </View>
              ))}

              {/* Leave Guild */}
              <Pressable
                onPress={handleLeave}
                className="mt-6 w-full py-3.5 border border-red-500/35 bg-red-950/10 rounded-2xl items-center justify-center active:bg-red-500/10"
              >
                <Text className="text-red-500 text-xs font-extrabold uppercase tracking-widest">
                  Resign Guild commission
                </Text>
              </Pressable>
            </ScrollView>
          ) : (
            <View className="flex-1 px-5 pb-5">
              <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
                {userGuild.chatMessages.map((msg) => (
                  <View key={msg.id} className="w-full mb-3 flex-row gap-2.5 items-start">
                    <View className="w-7 h-7 rounded-lg bg-[#11131A] border border-[#1F2330] items-center justify-center mt-0.5">
                      <Text style={{ fontSize: 14 }}>{msg.avatar}</Text>
                    </View>
                    <View className="flex-1 p-3 rounded-2xl bg-[#11131A] border border-[#1F2330]">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[#00F0FF] text-[9px] font-black">{msg.username}</Text>
                        <Text className="text-[#4E546A] text-[7px] font-bold">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text className="text-white text-xs font-semibold leading-relaxed">{msg.text}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Chat Input */}
              <View className="flex-row gap-2 items-center">
                <TextInput
                  placeholder="Transmit encrypted guild message..."
                  placeholderTextColor="#4E546A"
                  value={chatInput}
                  onChangeText={setChatInput}
                  maxLength={160}
                  className="flex-1 bg-[#11131A] border border-[#1F2330] rounded-2xl px-4 py-3 text-white text-xs font-semibold"
                />
                <Pressable 
                  onPress={handleSendChat}
                  className="px-4 py-3 rounded-2xl bg-[#00F0FF] border border-[#00FFC2] items-center justify-center active:opacity-85 shadow"
                >
                  <Text className="text-[#05040A] text-xs font-black uppercase tracking-wider">Send</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Text className="text-[#6C758A] text-[10px] font-black uppercase tracking-wider mb-4">
            Available Hunter Guilds
          </Text>

          {loading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator color={activeColor} size="small" />
              <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mt-2">
                Retrieving Guild Portals...
              </Text>
            </View>
          ) : availableGuilds.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <Text className="text-[#4E546A] text-xs italic">No other available guilds at this moment.</Text>
            </View>
          ) : (
            availableGuilds.map((g) => (
              <View 
                key={g.id}
                className="w-full p-5 mb-4 rounded-3xl bg-[#11131A] border border-[#1F2330] relative overflow-hidden"
              >
                <View className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: g.bannerColor }} />
                
                <Text className="text-[8px] font-black uppercase tracking-widest mb-1 pl-1.5" style={{ color: g.bannerColor }}>
                  ALLIANCE COMMISSIONS ACTIVE
                </Text>
                <Text className="text-white text-base font-black pl-1.5">{g.name}</Text>
                <Text className="text-[#A8B0C2] text-xs font-semibold mt-2 pl-1.5 italic leading-relaxed">
                  "{g.description}"
                </Text>

                <View className="flex-row gap-3 mt-4 pt-4 border-t border-[#1F2330] pl-1.5">
                  <View className="flex-1">
                    <Text className="text-[#6C758A] text-[7px] font-black uppercase">weekly XP targets</Text>
                    <Text className="text-white text-xs font-extrabold mt-0.5">{g.weeklyGoal} XP</Text>
                  </View>
                  <View className="flex-1 border-l border-[#1F2330] pl-3">
                    <Text className="text-[#6C758A] text-[7px] font-black uppercase">Members</Text>
                    <Text className="text-white text-xs font-extrabold mt-0.5">{g.members.length} / 10</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleJoin(g.id)}
                  className="mt-5 w-full py-2.5 rounded-xl items-center justify-center pl-1.5"
                  style={{ backgroundColor: g.bannerColor }}
                >
                  <Text className="text-[#05040A] text-xs font-black uppercase tracking-wider">
                    Request Guild Admission
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
