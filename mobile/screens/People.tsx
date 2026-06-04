import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSocialStore, SuggestedUser } from '../store/social';
import { useTheme, SURFACE } from '../constants/theme';
import LeaderboardCard from '../components/LeaderboardCard';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../lib/AuthContext';

export default function PeopleScreen() {
  const { activeColor } = useTheme();
  const { user } = useAuth();
  const { 
    following, 
    suggestedUsers, 
    followUser, 
    unfollowUser,
    fetchSuggestedUsers,
    fetchFriendsNetwork,
    pendingFollowRequestsSent,
    incomingFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    loading
  } = useSocialStore();

  const [activeTab, setActiveTab] = useState<'network' | 'rankings'>('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewUser, setSelectedPreviewUser] = useState<SuggestedUser | null>(null);

  useEffect(() => {
    fetchSuggestedUsers();
    if (user) {
      fetchFriendsNetwork(user.id);
    }
  }, [user]);

  const filteredUsers = suggestedUsers.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollowToggle = (targetId: string) => {
    if (!user) return;
    if (following.includes(targetId) || pendingFollowRequestsSent.includes(targetId)) {
      unfollowUser(user.id, targetId);
    } else {
      followUser(user.id, targetId);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]" style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScreenHeader
        subtitle="Social Hub"
        title="S-Rank Network"
        badge={`Following: ${following.length}`}
        badgeColor="#00F0FF"
      />

      {/* Segmented Tab Control */}
      <View className="flex-row px-5 py-3 bg-[#0A0A0F]">
        <View className="flex-row w-full bg-[#11131A] p-1 rounded-2xl border border-[#1F2330]">
          <Pressable 
            onPress={() => setActiveTab('network')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${activeTab === 'network' ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
          >
            <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'network' ? 'text-white' : 'text-[#6C758A]'}`}>
              👥 Hunters Hub
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setActiveTab('rankings')}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${activeTab === 'rankings' ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
          >
            <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'rankings' ? 'text-white' : 'text-[#6C758A]'}`}>
              🏆 Leaderboard
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'network' ? (
          <View className="w-full">
            {/* Search input */}
            <TextInput
              placeholder="Search S-Rank hunter profiles..."
              placeholderTextColor="#4E546A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="w-full bg-[#11131A] text-white px-4 py-3 rounded-2xl border border-[#1F2330] text-xs font-semibold mb-4"
            />

            {/* Profile Preview Panel */}
            {selectedPreviewUser && (
              <View 
                className="w-full p-4 mb-4 rounded-3xl bg-[#09152B]/95 border-2 border-[#00F0FF] relative"
                style={{
                  shadowColor: '#00F0FF',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                }}
              >
                <Pressable 
                  onPress={() => setSelectedPreviewUser(null)}
                  className="absolute right-3 top-3 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/35 items-center justify-center"
                >
                  <Text className="text-red-500 text-[8px] font-black">✕</Text>
                </Pressable>
                
                <View className="flex-row items-center gap-3.5 mb-3">
                  <View className="w-12 h-12 rounded-2xl bg-[#0A0A0F] border border-[#1F2330] items-center justify-center">
                    <Text style={{ fontSize: 26 }}>{selectedPreviewUser.avatar}</Text>
                  </View>
                  <View>
                    <Text className="text-white text-sm font-black">{selectedPreviewUser.username}</Text>
                    <Text className="text-[#0DF5C4] text-[9px] font-black uppercase mt-0.5">{selectedPreviewUser.title}</Text>
                  </View>
                </View>

                <View className="flex-row gap-3 bg-[#0A0A0F] p-3 rounded-xl border border-[#181A24] mb-3">
                  <View className="flex-1">
                    <Text className="text-[#6C758A] text-[7px] font-black uppercase">JOB CLASS</Text>
                    <Text className="text-white text-xs font-extrabold mt-0.5">{selectedPreviewUser.jobClass}</Text>
                  </View>
                  <View className="flex-1 border-l border-[#1F2330] pl-3">
                    <Text className="text-[#6C758A] text-[7px] font-black uppercase">HUNTER LEVEL</Text>
                    <Text className="text-white text-xs font-extrabold mt-0.5">LV. {selectedPreviewUser.level}</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleFollowToggle(selectedPreviewUser.id)}
                  className="w-full py-2.5 rounded-xl justify-center items-center"
                  style={{ 
                    backgroundColor: following.includes(selectedPreviewUser.id) 
                      ? '#EF4444' 
                      : pendingFollowRequestsSent.includes(selectedPreviewUser.id)
                      ? '#F59E0B'
                      : activeColor 
                  }}
                >
                  <Text className="text-[#05040A] text-xs font-black uppercase tracking-wider" style={{ color: '#05040A' }}>
                    {following.includes(selectedPreviewUser.id) 
                      ? 'Unfollow Hunter' 
                      : pendingFollowRequestsSent.includes(selectedPreviewUser.id)
                      ? 'Cancel Request'
                      : 'Follow Hunter'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Incoming Follow Requests Notification Panel */}
            {incomingFollowRequests && incomingFollowRequests.length > 0 && (
              <View className="w-full p-4 mb-5 rounded-3xl bg-[#11131A] border border-amber-500/35 shadow-md">
                <Text className="text-amber-500 text-[9px] font-black uppercase tracking-widest mb-3">
                  ⚠️ PENDING GATE ACCESS REQUESTS ({incomingFollowRequests.length})
                </Text>
                <View className="flex-col gap-2.5">
                  {incomingFollowRequests.map((req) => (
                    <View key={req.id} className="w-full flex-row justify-between items-center p-3 rounded-2xl bg-[#0A0A0F] border border-[#1F2330]">
                      <View className="flex-row items-center gap-2.5">
                        <View className="w-8 h-8 rounded-xl bg-[#11131A] border border-[#1F2330] items-center justify-center">
                          <Text style={{ fontSize: 16 }}>{req.avatar}</Text>
                        </View>
                        <Text className="text-white text-xs font-black">{req.username}</Text>
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable 
                          onPress={() => user && acceptFollowRequest(user.id, req.id, req.follower_id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 active:bg-emerald-500/25"
                        >
                          <Text className="text-emerald-400 text-[8px] font-black uppercase">Accept</Text>
                        </Pressable>
                        <Pressable 
                          onPress={() => user && rejectFollowRequest(user.id, req.id)}
                          className="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 active:bg-red-500/25"
                        >
                          <Text className="text-red-400 text-[8px] font-black uppercase">Ignore</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Suggested users list */}
            <Text className="text-[#6C758A] text-[10px] font-black uppercase tracking-wider mb-3">
              Suggested Hunters
            </Text>

            {loading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator color={activeColor} size="small" />
                <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mt-2">
                  Scanning S-Rank Grid...
                </Text>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View className="py-8 items-center justify-center">
                <Text className="text-[#4E546A] text-xs italic">No hunters matching search queries.</Text>
              </View>
            ) : (
              filteredUsers.map((user) => {
                const isFollowing = following.includes(user.id);
                const isRequested = pendingFollowRequestsSent.includes(user.id);
                return (
                  <Pressable
                    key={user.id}
                    onPress={() => setSelectedPreviewUser(user)}
                    className="w-full p-4 mb-3 rounded-2xl bg-[#11131A] border border-[#1F2330] flex-row justify-between items-center active:opacity-75"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-9 h-9 rounded-xl bg-[#0A0A0F] border border-[#1F2330] items-center justify-center">
                        <Text style={{ fontSize: 18 }}>{user.avatar}</Text>
                      </View>
                      <View>
                        <Text className="text-white text-xs font-black">{user.username}</Text>
                        <Text className="text-[#6C758A] text-[8px] font-bold mt-0.5">{user.title}</Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleFollowToggle(user.id)}
                      className={`px-3 py-1.5 rounded-xl border ${
                        isFollowing 
                          ? 'bg-transparent border-red-500/40' 
                          : isRequested
                          ? 'bg-amber-500/10 border-amber-500/40'
                          : 'bg-[#00F0FF]/15 border-[#00F0FF]/40'
                      }`}
                    >
                      <Text className={`text-[8px] font-black uppercase tracking-widest ${
                        isFollowing ? 'text-red-500' : isRequested ? 'text-amber-500' : 'text-[#00F0FF]'
                      }`}>
                        {isFollowing ? 'Following' : isRequested ? 'Requested' : '+ Follow'}
                      </Text>
                    </Pressable>
                  </Pressable>
                );
              })
            )}
          </View>
        ) : (
          <View className="w-full">
            <LeaderboardCard />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
