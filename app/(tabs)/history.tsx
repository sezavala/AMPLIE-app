import * as React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import { useColors } from "@/lib/useColors";
import {
  loadHistory,
  clearHistory,
  type HistoryItem as HistoryItemType,
} from "@/lib/history";

export default function HistoryScreen() {
  const c = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [history, setHistory] = React.useState<HistoryItemType[]>([]);

  const loadData = React.useCallback(async () => {
    try {
      const data = await loadHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleClearAll = React.useCallback(async () => {
    await clearHistory();
    setHistory([]);
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: c.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={c.text} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: c.text, fontSize: 24, fontWeight: "700" }}>
          History
        </Text>
        {history.length > 0 && (
          <Pressable onPress={handleClearAll} style={{ padding: 8 }}>
            <Text style={{ color: c.sub, fontSize: 14 }}>Clear All</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryItem item={item} c={c} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
              minHeight: 400,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
            <Text
              style={{
                color: c.text,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              No History Yet
            </Text>
            <Text style={{ color: c.sub, fontSize: 16, textAlign: "center" }}>
              Start by analyzing your mood with voice or text!
            </Text>
          </View>
        }
      />
    </View>
  );
}

function HistoryItem({ item, c }: { item: HistoryItemType; c: any }) {
  const player = useAudioPlayer(item.clipUri || "");
  const [isPlaying, setIsPlaying] = React.useState(false);

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={{
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: c.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ color: c.text, fontSize: 18, fontWeight: "700" }}>
          {item.emotion}
        </Text>
        <Text style={{ color: c.sub, fontSize: 14 }}>
          {Math.round(item.confidence * 100)}%
        </Text>
      </View>

      <Text style={{ color: c.sub, fontSize: 14, marginBottom: 8 }}>
        {formattedDate} • {item.src === "voice" ? "🎤 Voice" : "✍️ Text"}
        {item.mode && ` • ${item.mode}`}
      </Text>

      {item.text && (
        <Text
          style={{
            color: c.text,
            fontSize: 14,
            fontStyle: "italic",
            marginBottom: 8,
          }}
          numberOfLines={2}
        >
          "{item.text}"
        </Text>
      )}

      {item.clipUri && (
        <Pressable
          onPress={togglePlayback}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: c.bg,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text style={{ color: c.text, fontWeight: "600" }}>
            {isPlaying ? "⏸️ Pause Recording" : "▶️ Play Recording"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
