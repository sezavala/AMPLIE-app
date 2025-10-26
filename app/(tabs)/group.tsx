import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useColors } from "@/lib/useColors";

export default function GroupScreen() {
  const c = useColors();
  const [room, setRoom] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 16 }}>
        Group Room
      </Text>

      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 }}>
        <Text style={{ color: c.text, fontWeight: "700", marginBottom: 8 }}>Join a room</Text>
        <TextInput
          value={room}
          onChangeText={setRoom}
          placeholder="Enter room code"
          placeholderTextColor={c.sub}
          style={{
            backgroundColor: c.bg,
            color: c.text,
            borderRadius: 12,
            padding: 10,
            borderWidth: 1,
            borderColor: c.border,
            marginBottom: 10,
          }}
        />
        <Pressable
          onPress={() => {/* TODO: call /room/join */}}
          disabled={!room.trim()}
          style={{
            opacity: room.trim() ? 1 : 0.5,
            backgroundColor: c.text,
            borderRadius: 12,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: c.bg, fontWeight: "700" }}>Join</Text>
        </Pressable>
      </View>

      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 16 }}>
        <Text style={{ color: c.text, fontWeight: "700", marginBottom: 8 }}>Create a room</Text>
        <Pressable
          onPress={() => {/* TODO: call /room/create */}}
          style={{ backgroundColor: c.text, borderRadius: 12, paddingVertical: 10, alignItems: "center" }}
        >
          <Text style={{ color: c.bg, fontWeight: "700" }}>Create</Text>
        </Pressable>
      </View>
    </View>
  );
}
