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

const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;


function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments(); // e.g. ['(tabs)'] or ['(auth)']
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)'; // public routes
    if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoaded, isSignedIn, segments]);

  return <>{children}</>;
}

function InnerLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
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
