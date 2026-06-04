import React, { useEffect } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import '../global.css';

function RootNavigationContent() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // Protected route segments
    const inAuthGroup =
      segments[0] === '(tabs)' ||
      segments[0] === 'people' ||
      segments[0] === 'guild' ||
      segments[0] === 'challenges';

    if (!session && inAuthGroup) {
      // Unauthenticated -> redirect to authentication screen
      router.replace('/');
    } else if (session && !inAuthGroup) {
      // Authenticated but on a public/auth route -> redirect to dashboard
      router.replace('/home');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#00F0FF" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="people" />
      <Stack.Screen name="guild" />
      <Stack.Screen name="challenges" />
    </Stack>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <RootNavigationContent />
    </AuthProvider>
  );
}
