import * as React from "react";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { Audio } from "expo-av";

// Use relative imports to avoid alias issues
import { useColors } from "../../lib/useColors";
import { useConsent } from "../../lib/consent";
import { loadHistory, type HistoryItem } from "../../lib/history";

export default function HistoryTab() {
  const c = useColors();
  const { loaded, consent } = useConsent();

  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [playingId, setPlayingId] = React.useState<string | null>(null);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  // Load on mount
  React.useEffect(() => {
    if (!loaded) return;
    reload();
    // stop sound on unmount
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [loaded]);

  async function reload() {
    const data = await loadHistory();
    // newest first (defensive), though appendHistory already does that
    setItems([...data].sort((a, b) => b.createdAt - a.createdAt));
  }

  async function onRefresh() {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }

  async function playClip(item: HistoryItem) {
    if (!item.clipUri) return;
    // stop any existing
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
      setPlayingId(null);
    }
    const { sound } = await Audio.Sound.createAsync({ uri: item.clipUri });
    soundRef.current = sound;
    setPlayingId(item.id);
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) {
        setPlayingId(null);
        sound.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    });
    await sound.playAsync();
  }

  async function stopClip() {
    if (!soundRef.current) return;
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    } catch {}
    soundRef.current = null;
    setPlayingId(null);
  }

  // ---- States ----
  if (!loaded) {
    return (
      <Centered c={c}>
        <Text style={{ color: c.text }}>Loading…</Text>
      </Centered>
    );
  }

  if (!consent?.history) {
    return (
      <Centered c={c}>
        <Text style={{ color: c.text, fontSize: 18, fontWeight: "800", marginBottom: 6 }}>
          History disabled
        </Text>
        <Text style={{ color: c.sub, textAlign: "center", paddingHorizontal: 24 }}>
          Enable “Mood history” in Consent to save results and view them here.
        </Text>
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.text} />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <Text style={{ color: c.sub, marginTop: 20, textAlign: "center" }}>
            No entries yet. Run an analysis to see results here.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: c.card,
              borderColor: c.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "800", fontSize: 16 }}>
              {item.emotion} {Math.round(item.confidence * 100)}%
            </Text>
            <Text style={{ color: c.sub, marginTop: 2 }}>
              {new Date(item.createdAt).toLocaleString()} • {item.mode ?? "reflect"} • {item.src}
            </Text>

            {/* Text preview (if text source) */}
            {item.src === "text" && item.text ? (
              <Text style={{ color: c.text, marginTop: 8 }} numberOfLines={2}>
                “{item.text}”
              </Text>
            ) : null}

            {/* Voice controls (if voice source) */}
            {item.src === "voice" && item.clipUri ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                {playingId === item.id ? (
                  <Btn title="Stop" onPress={stopClip} dark />
                ) : (
                  <Btn title="Play clip" onPress={() => playClip(item)} dark />
                )}
                {/* Optional: show filename */}
                <Text
                  style={{ color: c.sub, alignSelf: "center" }}
                  numberOfLines={1}
                >
                  {item.clipUri.split("/").pop()}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

/* ------- tiny UI helpers ------- */
function Centered({ c, children }: { c: ReturnType<typeof useColors>; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
      {children}
    </View>
  );
}

function Btn({
  title,
  onPress,
  dark = false,
}: {
  title: string;
  onPress: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: dark ? "#111" : "transparent",
        borderWidth: dark ? 0 : 1,
        borderColor: "#444",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ color: dark ? "#fff" : "#ddd", fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}
