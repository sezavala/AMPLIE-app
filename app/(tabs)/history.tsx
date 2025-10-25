import { View, Text, Pressable, FlatList } from "react-native";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";
import { router } from "expo-router";

type Item = { id: string; text: string; result: string; ts: string };
const MOCK: Item[] = [
  { id: "1", text: "felt tense before meeting", result: "calm (82%)", ts: "Today, 2:15 PM" },
  { id: "2", text: "great study session", result: "focused (73%)", ts: "Yesterday, 8:40 PM" },
  { id: "3", text: "long commute", result: "tired (65%)", ts: "Tue, 5:21 PM" },
];

export default function HistoryScreen() {
  const c = useColors();
  const { loaded, consent } = useConsent();

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c.text }}>Loading…</Text>
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
          You denied “Mood history.” Enable it in Consent to view or save past results.
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
        data={MOCK}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 14 }}>
            <Text style={{ color: c.text, fontWeight: "700", marginBottom: 4 }}>{item.result}</Text>
            <Text style={{ color: c.sub, marginBottom: 2 }}>{item.text}</Text>
            <Text style={{ color: c.sub, fontSize: 12 }}>{item.ts}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: c.sub, marginTop: 20 }}>No history yet.</Text>}
        contentContainerStyle={{ paddingVertical: 6 }}
      />
    </View>
  );
}
