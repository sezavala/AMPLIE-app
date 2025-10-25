import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useConsent } from "@/lib/consent";

const qc = new QueryClient();

function Shell({ children }: { children: React.ReactNode }) {
  const { loaded, load } = useConsent();

  useEffect(() => { load(); }, [load]);

  if (!loaded) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <View style={{ flex:1 }}>{children}</View>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={qc}>
      <Shell>
        <Stack screenOptions={{ headerShown: false }} />
      </Shell>
    </QueryClientProvider>
  );
}
