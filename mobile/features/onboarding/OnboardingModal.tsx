import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable } from 'react-native';
import NeonButton from '../../components/NeonButton';
import { useProfileStore } from '../../store/profile';

export default function OnboardingModal({ visible, onClose }:{visible:boolean; onClose:()=>void}){
  const setProfile = useProfileStore(s=>s.setProfile);
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState<'blue'|'purple'|'teal'>('blue');

  const { user } = require('../../lib/AuthContext').useAuth();

  function submit(){
    if(!username.trim()) return;
    setProfile({ username: username.trim(), theme, avatar: 'astronaut' });
    
    // Push updated profile to Supabase to keep remote data in sync
    if (user) {
      const { pushProfile } = require('../../lib/sync');
      pushProfile(user.id);
    }
    
    onClose();
  }

  const themeColors = {
    blue: '#7BE7FF',
    purple: '#B77BFF',
    teal: '#0DF5C4',
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-[#050508]/85 px-6">
        <View 
          className="w-full max-w-[360px] p-6 rounded-3xl bg-[#11131A] border border-[#1F2330]"
          style={{
            shadowColor: themeColors[theme],
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text className="text-white text-2xl font-bold tracking-wide text-center mb-2">
            Welcome to <Text style={{ color: themeColors[theme] }}>Levelyn</Text>
          </Text>
          <Text className="text-[#A8B0C2] text-sm text-center mb-6 leading-relaxed">
            Configure your personalized dashboard profile to start your productivity journey.
          </Text>

          <View className="mb-5">
            <Text className="text-[#889] text-xs font-semibold uppercase tracking-wider mb-2">Username</Text>
            <TextInput 
              placeholder='Enter your name' 
              placeholderTextColor='#4E546A' 
              value={username} 
              onChangeText={setUsername} 
              style={{
                backgroundColor: '#0A0A0F',
                color: '#fff',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: '#1F2330',
                fontSize: 15,
              }}
            />
          </View>

          <View className="mb-6">
            <Text className="text-[#889] text-xs font-semibold uppercase tracking-wider mb-2.5">Choose Theme Accent</Text>
            <View className="flex-row gap-3">
              {(['blue', 'purple', 'teal'] as const).map((t) => (
                <Pressable 
                  key={t}
                  onPress={() => setTheme(t)} 
                  className={`flex-1 items-center justify-center p-3 rounded-xl border-2 ${
                    theme === t 
                      ? 'bg-[#11131A]' 
                      : 'border-transparent bg-[#0A0A0F]'
                  }`}
                  style={{
                    borderColor: theme === t ? themeColors[t] : 'transparent'
                  }}
                >
                  <View 
                    className="w-5 h-5 rounded-full mb-1.5" 
                    style={{ backgroundColor: themeColors[t] }} 
                  />
                  <Text className={`text-xs font-bold capitalize ${theme === t ? 'text-white' : 'text-[#6C758A]'}`}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="w-full">
            <Pressable 
              onPress={submit}
              className="py-3.5 rounded-xl justify-center items-center"
              style={{
                backgroundColor: themeColors[theme],
                shadowColor: themeColors[theme],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text className="text-[#05040A] font-bold text-[15px] tracking-wide">
                Start Leveling Up
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
