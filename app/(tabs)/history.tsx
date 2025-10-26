import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";
import { router } from "expo-router";
import { loadHistory, HistoryItem, clearHistory } from "@/lib/historyStorage";

export default function HistoryScreen() {
  const c = useColors();
  const { loaded, consent } = useConsent();
  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!loaded) return;
      if (!consent?.history) {
        setItems([]); // or null to show blocked msg
        return;
      }
      const data = await loadHistory();
      if (mounted) setItems(data);
    })();
    return () => { mounted = false; };
  }, [loaded, consent?.history]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!consent?.history) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: "center" }}>
        <Text style={{ color: c.text, fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
          History disabled
        </Text>
        <Text style={{ color: c.sub, marginBottom: 12 }}>
          Enable “Mood history” in Consent to view or save past results.
        </Text>
        <Pressable
          onPress={() => router.push("/consent")}
          style={{ backgroundColor: c.text, borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
        >
          <Text style={{ color: c.bg, fontWeight: "700" }}>Open Consent</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 16 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 8 }}>History</Text>

      <FlatList
        data={items ?? []}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 14 }}>
            <Text style={{ color: c.text, fontWeight: "700", marginBottom: 4 }}>
              {item.emotion} ({Math.round(item.confidence * 100)}%)
            </Text>
            <Text style={{ color: c.sub, marginBottom: 2 }}>{item.text}</Text>
            <Text style={{ color: c.sub, fontSize: 12 }}>{new Date(item.ts).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: c.sub, marginTop: 20 }}>No history yet.</Text>}
        contentContainerStyle={{ paddingVertical: 6 }}
      />

      {/* Optional: dev-only clear button */}
      {/* <Pressable onPress={async () => { await clearHistory(); setItems([]); }} style={{ marginTop: 12, alignItems: "center" }}>
        <Text style={{ color: c.sub, textDecorationLine: "underline" }}>Clear history (dev)</Text>
      </Pressable> */}
    </View>
  );
}
