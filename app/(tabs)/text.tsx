import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";

export default function TextScreen() {
  const c = useColors();
  const { consent } = useConsent(); // 👈 pulls live consent data

  // ✅ Guard logic goes BEFORE the return statement
  const canText = !!consent?.text; // true if text analysis is allowed

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        padding: 24,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: c.text,
          fontSize: 22,
          fontWeight: "800",
          marginBottom: 12,
        }}
      >
        Text
      </Text>

      <Text style={{ color: c.sub, marginBottom: 20 }}>
        Type a short note about how you feel and we’ll analyze it.
      </Text>

      {/* ✅ Conditional navigation */}
      <Pressable
        onPress={() =>
          canText ? router.push("/input") : router.push("/consent")
        }
        style={{
          backgroundColor: c.text,
          borderRadius: 16,
          paddingVertical: 12,
          alignItems: "center",
          opacity: canText ? 1 : 0.6,
        }}
      >
        <Text style={{ color: c.bg, fontWeight: "700" }}>
          {canText ? "Open Input" : "Enable Text in Consent"}
        </Text>
      </Pressable>
    </View>
  );
}
