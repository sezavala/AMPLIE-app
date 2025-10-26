// app/(tabs)/index.tsx
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";

export default function HomeTab() {
  const c = useColors();
  const { loaded, consent } = useConsent();

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: c.text }}>Loading…</Text>
      </View>
    );
  }

  const goReflect = () => {
    if (consent?.text) router.push({ pathname: "/input", params: { mode: "reflect" } });
    else router.push("/consent");
  };

  const goWork = () => {
    if (consent?.text) router.push({ pathname: "/input", params: { mode: "work" } });
    else router.push("/consent");
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 12 }}>
        How should we play?
      </Text>

      <Pressable
        onPress={goReflect}
        style={{ backgroundColor: c.text, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, marginTop: 10 }}
      >
        <Text style={{ color: c.bg, fontWeight: "700" }}>Reflect my mood</Text>
      </Pressable>

      <Pressable
        onPress={goWork}
        style={{ borderWidth: 1, borderColor: c.border, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, marginTop: 10 }}
      >
        <Text style={{ color: c.text, fontWeight: "700" }}>Work with my mood</Text>
      </Pressable>

      {/* Hint for users who want voice */}
      <Text style={{ color: c.sub, marginTop: 14 }}>
        Want to speak instead? Use the Voice tab.
      </Text>
    </View>
  );
}
