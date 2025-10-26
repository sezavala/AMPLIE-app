import * as React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "../lib/useColors";

export default function InputScreen() {
  const c = useColors();
  const router = useRouter();
  const [text, setText] = React.useState("");

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "700", marginBottom: 10 }}>
        Tell us how you feel
      </Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="e.g., feeling hopeful"
        placeholderTextColor={c.sub}
        style={{
          backgroundColor: c.card,
          borderRadius: 16,
          padding: 12,
          color: c.text,
          marginBottom: 12,
        }}
      />

      {/* Analyze button */}
      <Pressable
        disabled={!text.trim()}
        onPress={() => router.push({ pathname: "/result", params: { src: "text", text } })}
        style={{
          opacity: text.trim() ? 1 : 0.5,
          backgroundColor: c.text,
          borderRadius: 16,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: c.bg, fontWeight: "700" }}>Analyze</Text>
      </Pressable>

      {/* 👇 Back to Home button */}
      <Pressable
        onPress={() => router.push("/")}
        style={{
          marginTop: 16,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 16,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: c.text, fontWeight: "700" }}>Back to Home</Text>
      </Pressable>
    </View>
  );
}
