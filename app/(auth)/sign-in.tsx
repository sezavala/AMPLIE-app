import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { useOAuth } from '@clerk/clerk-expo';
import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const scheme = Constants.expoConfig?.extra?.redirectScheme || 'amplieapp';

  // ✅ Use window.location.origin on web; scheme on native
  const redirectUrl =
    Platform.OS === 'web'
      ? window.location.origin
      : Linking.createURL('', { scheme });

  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startApple } = useOAuth({ strategy: 'oauth_apple' });

  const doOAuth = useCallback(
    async (which: 'google' | 'apple') => {
      const start = which === 'google' ? startGoogle : startApple;
      try {
        const { createdSessionId, setActive } = await start({ redirectUrl });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
        }
      } catch (err) {
        console.error('OAuth error:', err);
      }
    },
    [redirectUrl]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to Amplie</Text>

      <Pressable style={styles.button} onPress={() => doOAuth('google')}>
        <Text>Continue with Google</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => doOAuth('apple')}>
        <Text>Continue with Apple</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  button: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
});

