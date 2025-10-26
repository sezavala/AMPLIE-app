import * as React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/lib/useColors";
import { post } from "@/lib/api";

export default function PlaylistScreen() {
  const c = useColors();
  const router = useRouter();
  const { emotion, mode } = useLocalSearchParams<{
    emotion?: string;
    mode?: "reflect" | "work";
  }>();

  const [loading, setLoading] = React.useState(true);
  const [tracks, setTracks] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchPlaylist() {
      if (!emotion) {
        setError("No emotion provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Step 1: Get policy from emotion
        const policyRes = await post<{
          tempo: number;
          energy: number;
          valence: number;
          genres: string[];
        }>("/policy", { emotion, mode: "major" });

        // Step 2: Retrieve matching tracks
        const tracksRes = await post<{ items: any[] }>("/retrieve", {
          policy: policyRes,
          k: 10,
        });

        setTracks(tracksRes.items || []);
      } catch (err: any) {
        console.error("Failed to fetch playlist:", err);
        setError(err.message || "Failed to load playlist");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylist();
  }, [emotion, mode]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: c.text, fontSize: 16 }}>← Back</Text>
        </Pressable>

        <Text style={{ color: c.text, fontSize: 28, fontWeight: "800" }}>
          {emotion} Playlist
        </Text>
        <Text style={{ color: c.sub, fontSize: 16 }}>
          {mode === "reflect"
            ? "Reflecting your mood"
            : "Working with your mood"}
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={c.text} />
          <Text style={{ color: c.sub, marginTop: 12 }}>
            Curating your playlist...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>❌</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "700" }}>
            {error}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={{
                backgroundColor: c.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: c.sub, fontSize: 16, marginRight: 8 }}>
                  {index + 1}.
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: c.text, fontSize: 18, fontWeight: "700" }}
                  >
                    {item.metadata?.title || "Unknown Track"}
                  </Text>
                  <Text style={{ color: c.sub, fontSize: 14 }}>
                    {item.metadata?.artist || "Unknown Artist"}
                  </Text>
                </View>
              </View>

              {/* Match Score */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    backgroundColor: c.text,
                    height: 4,
                    borderRadius: 2,
                    width: `${((1 - item.distance) * 100).toFixed(0)}%`,
                  }}
                />
                <Text style={{ color: c.sub, fontSize: 12, marginLeft: 8 }}>
                  {((1 - item.distance) * 100).toFixed(0)}% match
                </Text>
              </View>

              {/* Metadata */}
              {item.metadata && (
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {item.metadata.tempo && (
                    <Chip text={`${item.metadata.tempo} BPM`} c={c} />
                  )}
                  {item.metadata.energy && (
                    <Chip
                      text={`Energy ${(item.metadata.energy * 100).toFixed(
                        0
                      )}%`}
                      c={c}
                    />
                  )}
                  {item.metadata.valence && (
                    <Chip
                      text={`Mood ${(item.metadata.valence * 100).toFixed(0)}%`}
                      c={c}
                    />
                  )}
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: c.sub, fontSize: 16 }}>
                No tracks found for this mood
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function Chip({ text, c }: { text: string; c: any }) {
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text style={{ color: c.sub, fontSize: 12 }}>{text}</Text>
    </View>
  );
}
