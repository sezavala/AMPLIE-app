import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeTab() {
  const Btn = ({ title, onPress, ghost }: any) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: ghost ? "transparent" : "#fff",
        borderWidth: ghost ? 1 : 0,
        borderColor: "rgba(255,255,255,0.2)",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 10,
      }}
    >
      <Text style={{ color: ghost ? "#fff" : "#000", fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
        How should we play?
      </Text>

      <Btn title="Reflect my mood" onPress={() => router.push("/input")} />
      <Btn title="Work with my mood" ghost onPress={() => router.push("/input")} />
    </View>
  );
}
