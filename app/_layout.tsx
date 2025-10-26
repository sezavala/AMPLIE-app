// app/_layout.tsx
import { Stack, usePathname, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useConsent } from "@/lib/consent";

const qc = new QueryClient();

function Shell({ children }: { children: React.ReactNode }) {
  const { loaded, consent, load } = useConsent();
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  // bootstrap consent from storage
  useEffect(() => { load(); }, [load]);

  // first-run redirect to /consent
  useEffect(() => {
    if (!loaded) return;
    if (redirected.current) return;
    // if no consent saved and we're not already on /consent
    if (!consent && pathname !== "/consent") {
      redirected.current = true;
      router.replace("/consent");
    }
  }, [loaded, consent, pathname, router]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <View style={{ flex: 1 }}>{children}</View>;
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
