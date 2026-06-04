import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import AuthScreen from '../screens/AuthScreen';

export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      const timeout = setTimeout(() => {
        router.replace('/home');
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [loading, session, router]);

  // Still loading auth state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Levelyn</Text>
          <Text style={styles.subtitle}>Restoring session...</Text>
          <ActivityIndicator color="#00F0FF" />
        </View>
      </View>
    );
  }

  // No session → show auth screen
  if (!session) {
    return <AuthScreen />;
  }

  // Authenticated → show splash while redirecting
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Levelyn</Text>
        <Text style={styles.subtitle}>Opening your dashboard...</Text>
        <ActivityIndicator color="#00F0FF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: '#11131A',
    borderWidth: 1,
    borderColor: '#1F2330',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#F5F7FF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#A8B0C2',
    fontSize: 15,
    marginBottom: 4,
  },
});