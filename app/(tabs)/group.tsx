import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useColors } from "@/lib/useColors";
import { post } from "@/lib/api";

export default function GroupScreen() {
  const c = useColors();
  const [room, setRoom] = useState("");
  const [userId, setUserId] = useState(`user_${Date.now()}`);
  const [emotion, setEmotion] = useState("");
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  async function joinRoom() {
    if (!room.trim()) return;
    setLoading(true);
    try {
      await post("/room/join", { roomId: room, userId });
      setJoined(true);
    } catch (err) {
      alert("Failed to join room. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function setMood() {
    if (!emotion.trim()) return;
    setLoading(true);
    try {
      await post("/room/mood", { roomId: room, userId, emotion });

      // Wait for blend, then fetch playlist
      setTimeout(async () => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API}/room/playlist?roomId=${room}&k=5`
          );
          const data = await response.json();
          setPlaylist(data.items || []);
        } catch (err) {
          console.error("Failed to fetch playlist:", err);
        }
        setLoading(false);
      }, 3000);
    } catch (err) {
      alert("Failed to set mood");
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      <Text
        style={{
          color: c.text,
          fontSize: 22,
          fontWeight: "800",
          marginBottom: 16,
        }}
      >
        Group Room
      </Text>

      {!joined ? (
        <View
          style={{
            backgroundColor: c.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "700", marginBottom: 8 }}>
            Join a room
          </Text>
          <TextInput
            value={room}
            onChangeText={setRoom}
            placeholder="Enter room code (e.g., room_001)"
            placeholderTextColor={c.sub}
            style={{
              backgroundColor: c.bg,
              color: c.text,
              borderRadius: 12,
              padding: 10,
              marginBottom: 10,
            }}
          />
          <Pressable
            onPress={joinRoom}
            disabled={loading || !room.trim()}
            style={{
              backgroundColor: c.text,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
              opacity: loading || !room.trim() ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={c.bg} />
            ) : (
              <Text style={{ color: c.bg, fontWeight: "700" }}>Join</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 14,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "700", marginBottom: 8 }}>
              Set Your Mood
            </Text>
            <TextInput
              value={emotion}
              onChangeText={setEmotion}
              placeholder="happy, sad, relaxed, etc."
              placeholderTextColor={c.sub}
              style={{
                backgroundColor: c.bg,
                color: c.text,
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
              }}
            />
            <Pressable
              onPress={setMood}
              disabled={loading || !emotion.trim()}
              style={{
                backgroundColor: c.text,
                borderRadius: 12,
                padding: 12,
                alignItems: "center",
                opacity: loading || !emotion.trim() ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color={c.bg} />
              ) : (
                <Text style={{ color: c.bg, fontWeight: "700" }}>
                  Update Mood
                </Text>
              )}
            </Pressable>
          </View>

          {playlist.length > 0 && (
            <View>
              <Text
                style={{
                  color: c.text,
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 12,
                }}
              >
                Blended Playlist
              </Text>
              <FlatList
                data={playlist}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: c.card,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: c.text, fontWeight: "700" }}>
                      {item.metadata?.title}
                    </Text>
                    <Text style={{ color: c.sub }}>
                      {item.metadata?.artist}
                    </Text>
                    <Text style={{ color: c.sub, fontSize: 12 }}>
                      Match: {((1 - item.distance) * 100).toFixed(0)}%
                    </Text>
                  </View>
                )}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}
