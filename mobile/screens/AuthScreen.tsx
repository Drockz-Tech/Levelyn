import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { SURFACE } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const accentColor = '#00F0FF';

  async function handleSubmit() {
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Hunter Name is required.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Unique Handle is required.');
        return;
      }

      const normalizedHandle = username.trim().toLowerCase();
      // Handle syntax validation
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedHandle)) {
        setErrorMsg('Unique handle must be 3-20 characters, containing only letters, numbers, or underscores.');
        return;
      }

      setLoading(true);
      try {
        // Query to check handle availability before calling auth.signUp
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', normalizedHandle)
          .maybeSingle();

        if (checkError) {
          console.warn('Uniqueness check deferred:', checkError);
        } else if (existingUser) {
          setErrorMsg('This unique handle is already claimed by another S-Rank hunter. Please choose another one.');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email.trim(), password, normalizedHandle, displayName.trim());
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created! Check your email for verification, then sign in.');
          setMode('signin');
        }
      } catch (e) {
        setErrorMsg(String(e));
      }
      setLoading(false);
    } else {
      setLoading(true);
      try {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setErrorMsg(error.message);
        }
      } catch (e) {
        setErrorMsg(String(e));
      }
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 28,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Title */}
          <View className="items-center mb-10">
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-5 border-2"
              style={{
                borderColor: accentColor,
                backgroundColor: accentColor + '12',
                shadowColor: accentColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
              }}
            >
              <Text style={{ fontSize: 36 }}>⚡</Text>
            </View>
            <Text className="text-white text-3xl font-black tracking-widest uppercase">
              Levelyn
            </Text>
            <Text className="text-[#6C758A] text-xs font-bold uppercase tracking-[4px] mt-1.5">
              Focus RPG Alliance
            </Text>
          </View>

          {/* Mode Toggle */}
          <View className="flex-row w-full bg-[#11131A] p-1 rounded-2xl border border-[#1F2330] mb-6">
            <Pressable
              onPress={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${mode === 'signin' ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
            >
              <Text className={`text-xs font-black uppercase tracking-wider ${mode === 'signin' ? 'text-white' : 'text-[#6C758A]'}`}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${mode === 'signup' ? 'bg-[#181A24] border border-[#1F2330]' : 'bg-transparent border-transparent'}`}
            >
              <Text className={`text-xs font-black uppercase tracking-wider ${mode === 'signup' ? 'text-white' : 'text-[#6C758A]'}`}>
                Register
              </Text>
            </Pressable>
          </View>

          {/* Form Card */}
          <View
            className="w-full p-6 rounded-3xl bg-[#11131A] border border-[#1F2330] mb-6"
            style={{
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.06,
              shadowRadius: 15,
            }}
          >
            {mode === 'signup' && (
              <>
                <View className="mb-4">
                  <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mb-2">
                    Hunter Name (Display Name)
                  </Text>
                  <TextInput
                    placeholder="e.g. Sung Jin-Woo"
                    placeholderTextColor="#4E546A"
                    value={displayName}
                    onChangeText={setDisplayName}
                    className="w-full bg-[#0A0A0F] text-white px-4 py-3.5 rounded-2xl border border-[#1F2330] text-xs font-semibold"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mb-2">
                    Unique Handle (@username)
                  </Text>
                  <TextInput
                    placeholder="e.g. sung_jin_woo"
                    placeholderTextColor="#4E546A"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    className="w-full bg-[#0A0A0F] text-white px-4 py-3.5 rounded-2xl border border-[#1F2330] text-xs font-semibold"
                  />
                </View>
              </>
            )}

            <View className="mb-4">
              <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mb-2">
                Email Address
              </Text>
              <TextInput
                placeholder="hunter@levelyn.io"
                placeholderTextColor="#4E546A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="w-full bg-[#0A0A0F] text-white px-4 py-3.5 rounded-2xl border border-[#1F2330] text-xs font-semibold"
              />
            </View>

            <View className="mb-1">
              <Text className="text-[#6C758A] text-[9px] font-black uppercase tracking-widest mb-2">
                Password
              </Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#4E546A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="w-full bg-[#0A0A0F] text-white px-4 py-3.5 rounded-2xl border border-[#1F2330] text-xs font-semibold"
              />
            </View>
          </View>

          {/* Error / Success Messages */}
          {errorMsg !== '' && (
            <View className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 mb-4">
              <Text className="text-red-400 text-xs font-bold text-center">{errorMsg}</Text>
            </View>
          )}
          {successMsg !== '' && (
            <View className="w-full p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <Text className="text-emerald-400 text-xs font-bold text-center">{successMsg}</Text>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl items-center justify-center active:opacity-85"
            style={{
              backgroundColor: loading ? '#1F2330' : accentColor,
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: loading ? 0 : 0.3,
              shadowRadius: 12,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[#05040A] text-sm font-black uppercase tracking-widest">
                {mode === 'signin' ? 'Enter the Gate' : 'Awaken Hunter'}
              </Text>
            )}
          </Pressable>

          {/* Footer */}
          <View className="items-center mt-8">
            <Text className="text-[#4E546A] text-[10px] font-bold uppercase tracking-wider">
              {mode === 'signin'
                ? "Don't have an account? Tap Register above."
                : 'Already registered? Tap Sign In above.'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
