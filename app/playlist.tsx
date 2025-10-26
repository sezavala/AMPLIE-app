import * as React from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/lib/useColors";
import { generatePlaylist } from "@/lib/grock";

export default function PlaylistScreen() {
  const c = useColors();
  const router = useRouter();
  const { emotion, mode } = useLocalSearchParams<{
    emotion?: string;
    mode?: "reflect" | "work";
  }>();

  const [loading, setLoading] = React.useState(true);
  const [tracks, setTracks] = React.useState<any[]>([]);
  const [policy, setPolicy] = React.useState<any>(null);
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

        // Use local grock generator to produce a policy and 10 tracks.
        const { policy, items } = generatePlaylist(emotion as string, mode === "work" ? "work" : mode, 10);
        setPolicy(policy as any);
        setTracks(items || []);
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
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ padding: 24, paddingBottom: 16 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Text style={{ color: c.text, fontSize: 16 }}>← Back</Text>
        </Pressable>

        <Text style={{ color: c.text, fontSize: 28, fontWeight: "800", marginBottom: 4 }}>
          {emotion && emotion.charAt(0).toUpperCase() + emotion.slice(1)} Playlist
        </Text>
        <Text style={{ color: c.sub, fontSize: 16 }}>
          {mode === "work" ? "Working with your mood" : "Reflecting your mood"}
        </Text>

        {/* Policy Summary */}
        {policy && (
          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 12,
              padding: 12,
              marginTop: 16,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "700", marginBottom: 8 }}>
              Music Profile
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Chip text={`${policy.tempo} BPM`} c={c} />
              <Chip text={`Energy ${Math.round(policy.energy * 100)}%`} c={c} />
              <Chip text={`Positivity ${Math.round(policy.valence * 100)}%`} c={c} />
              {policy.genres?.map((genre: string) => (
                <Chip key={genre} text={genre} c={c} />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <ActivityIndicator size="large" color={c.text} />
          <Text style={{ color: c.sub, marginTop: 12 }}>
            Curating your playlist...
          </Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>❌</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Failed to Load Playlist
          </Text>
          <Text style={{ color: c.sub, textAlign: "center", marginBottom: 24 }}>
            {error}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: c.text,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: c.bg, fontWeight: "700" }}>Go Back</Text>
          </Pressable>
        </View>
      ) : tracks.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🎵</Text>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            No Tracks Found
          </Text>
          <Text style={{ color: c.sub, textAlign: "center", marginBottom: 24 }}>
            We couldn't find any tracks matching this mood. Try a different emotion!
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: c.text,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: c.bg, fontWeight: "700" }}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingTop: 0 }}
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: c.sub, fontSize: 18, marginRight: 12, fontWeight: "700" }}>
                  {index + 1}.
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 18, fontWeight: "700" }}>
                    {item.metadata?.title || "Unknown Track"}
                  </Text>
                  <Text style={{ color: c.sub, fontSize: 14 }}>
                    {item.metadata?.artist || "Unknown Artist"}
                  </Text>
                </View>
              </View>
            </View>
          )}
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text style={{ color: c.text, fontSize: 14, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

function SmallChip({ text, c }: { text: string; c: any }) {
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text style={{ color: c.sub, fontSize: 12 }}>{text}</Text>
    </View>
  );
}

function getMatchColor(score: number): string {
  if (score >= 0.8) return "#4ade80"; // green
  if (score >= 0.6) return "#60a5fa"; // blue
  if (score >= 0.4) return "#fbbf24"; // yellow
  return "#f87171"; // red
}
