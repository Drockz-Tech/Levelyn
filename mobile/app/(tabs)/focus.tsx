import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import SessionCard from '../../components/SessionCard';
import { useTheme, SURFACE } from '../../constants/theme';

export default function FocusScreen() {
  const { activeColor } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: SURFACE.bg }}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingVertical: 24, 
          paddingHorizontal: 20, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: SURFACE.bg
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[360px] items-center">
          <Text className="text-[#6C758A] text-[10px] font-black uppercase tracking-widest mb-1.5">
            » INTENSITY OVERDRIVE «
          </Text>
          <Text className="text-white text-2xl font-black tracking-wide mb-2 text-center">
            Focus <Text style={{ color: activeColor }}>Chamber</Text>
          </Text>
          <Text className="text-[#4E546A] text-xs text-center mb-6">
            Initiate your focus segment to damage raid bosses and earn XP.
          </Text>
          
          <SessionCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
