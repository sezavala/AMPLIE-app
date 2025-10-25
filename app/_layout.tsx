// app/_layout.tsx
import "./global.css";

import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useTheme, getThemeColors } from "@/lib/theme";

const qc = new QueryClient();

function Shell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {children}
    </View>
  );
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
