import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Pressable } from "react-native";

export default function ResultScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>Your mood</Text>

      <View style={{ backgroundColor: "#111", borderRadius: 16, padding: 16 }}>
        <Text style={{ color: "#aaa", marginBottom: 6 }}>Input: {q || "(none)"} </Text>
        {/* Hard-coded mock for the checkpoint */}
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
          calm <Text style={{ color: "#aaa" }}>(82%)</Text>
        </Text>
      </View>

      <Pressable
        onPress={() => router.replace("/input")}
        style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Try again</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/")}
        style={{ backgroundColor: "#fff", borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
      >
        <Text style={{ color: "#000", fontWeight: "700" }}>Back home</Text>
      </Pressable>
    </View>
  );
}
