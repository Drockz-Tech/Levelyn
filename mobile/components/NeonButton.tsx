import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
};

export default function NeonButton({ children, onPress, className }: Props) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(()=> ({ transform: [{ scale: withTiming(scale.value, { duration: 100 }) }] }));

  return (
    <Pressable onPress={onPress} onPressIn={() => (scale.value = 0.96)} onPressOut={() => (scale.value = 1)}>
      <Animated.View style={aStyle} className={`px-4 py-3 rounded-xl bg-surface ${className || ''}`}>
        <Text className="text-neonBlue font-semibold">{children}</Text>
      </Animated.View>
    </Pressable>
  );
}
