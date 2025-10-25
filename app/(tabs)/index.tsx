// app/(tabs)/index.tsx
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function HomeTab() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
        How should we play?
      </Text>
      <Pressable onPress={() => router.push("/input")}
        style={{ backgroundColor:"#fff", paddingVertical:12, paddingHorizontal:18, borderRadius:16, marginTop:10 }}>
        <Text style={{ color:"#000", fontWeight:"700" }}>Reflect my mood</Text>
      </Pressable>
      <Pressable onPress={() => router.push("/input")}
        style={{ borderWidth:1, borderColor:"rgba(255,255,255,0.2)", paddingVertical:12, paddingHorizontal:18, borderRadius:16, marginTop:10 }}>
        <Text style={{ color:"#fff", fontWeight:"700" }}>Work with my mood</Text>
      </Pressable>
    </View>
  );
}
