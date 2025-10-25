import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/lib/useColors";

export default function HomeTab() {
  const c = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
        How should we play?
      </Text>

      <Pressable
        onPress={() => router.push("/input")}
        style={{ backgroundColor: c.text, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, marginTop: 10 }}
      >
        <Text style={{ color: c.bg, fontWeight: "700" }}>Reflect my mood</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/input")}
        style={{ borderWidth: 1, borderColor: c.border, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, marginTop: 10 }}
      >
        <Text style={{ color: c.text, fontWeight: "700" }}>Work with my mood</Text>
      </Pressable>
    </View>
  );
}
