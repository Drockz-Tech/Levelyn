import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/theme';

type Props = {
  subtitle: string;
  title: string;
  badge?: string;
  badgeColor?: string;
};

export default function ScreenHeader({ subtitle, title, badge, badgeColor }: Props) {
  const router = useRouter();
  const { activeColor } = useTheme();
  const color = badgeColor || activeColor;

  return (
    <View className="px-5 py-4 border-b border-[#1F2330] flex-row justify-between items-center bg-[#0E0E14]">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 items-center justify-center active:bg-white/10"
        >
          <Text className="text-white text-sm font-black">←</Text>
        </Pressable>
        <View>
          <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest leading-none">
            {subtitle}
          </Text>
          <Text className="text-white text-base font-black tracking-wide mt-0.5">
            {title}
          </Text>
        </View>
      </View>

      {badge && (
        <View
          className="px-2.5 py-1 rounded-full border"
          style={{ borderColor: color + '40', backgroundColor: color + '10' }}
        >
          <Text className="text-[8px] font-black uppercase" style={{ color }}>
            {badge}
          </Text>
        </View>
      )}
    </View>
  );
}
