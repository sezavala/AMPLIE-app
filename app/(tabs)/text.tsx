import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/lib/useColors";

export default function TextScreen() {
  const c = useColors();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 12 }}>
        Text
      </Text>
      <Text style={{ color: c.sub, marginBottom: 20 }}>
        Type a short note about how you feel and we’ll analyze it.
      </Text>
      <Pressable
        onPress={() => router.push("/input")}
        style={{ backgroundColor: c.text, borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
      >
        <Text style={{ color: c.bg, fontWeight: "700" }}>Open Input</Text>
      </Pressable>
    </View>
  );
}
