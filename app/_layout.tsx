import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenCache } from '../lib/tokenCache';

WebBrowser.maybeCompleteAuthSession();

export const unstable_settings = {
  anchor: '(tabs)', 
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={qc}>
      <Shell>
        <Stack screenOptions={{ headerShown: false }} />
      </Shell>
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Clerk publishable key (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)');
  }
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <AuthGate>
        <InnerLayout />
      </AuthGate>
    </ClerkProvider>
  );
}
