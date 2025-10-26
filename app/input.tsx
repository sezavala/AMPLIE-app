import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function InputScreen() {
  const [text, setText] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 24, justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
        Tell us how you feel
      </Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="e.g., feeling hopeful"
        placeholderTextColor="#9aa"
        style={{ backgroundColor: "#111", borderRadius: 16, padding: 12, color: "#fff" }}
      />

      <Pressable
        disabled={!text.trim()}
        onPress={() => router.push({ pathname: "/result", params: { q: text } })}
        style={{
          opacity: text.trim() ? 1 : 0.5,
          backgroundColor: "#fff",
          borderRadius: 16,
          paddingVertical: 12,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text style={{ color: "#000", fontWeight: "700" }}>Analyze</Text>
      </Pressable>
    </View>
  );
}
