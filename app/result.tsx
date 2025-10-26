import { useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";
import { appendHistory } from "@/lib/historyStorage";

// Mocked emotion hook (replace with real API when ready)
import { useMutation } from "@tanstack/react-query";
type EmotionRes = { emotion: string; confidence: number };
const useEmotion = () =>
  useMutation<EmotionRes, Error, string>({
    mutationFn: async (text) => {
      await new Promise((r) => setTimeout(r, 400));
      return { emotion: "calm", confidence: 0.82 };
    },
  });

export default function ResultScreen() {
  const c = useColors();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { consent } = useConsent();
  const m = useEmotion();

  // Kick off analysis on mount
  useEffect(() => {
    if (q && !m.isPending && !m.isSuccess && !m.isError) {
      m.mutate(q);
    }
  }, [q]);

  // After success, conditionally write to history
  useEffect(() => {
    (async () => {
      if (!m.isSuccess || !q) return;
      if (consent?.history) {
        try {
          await appendHistory({
            text: q,
            emotion: m.data.emotion,
            confidence: m.data.confidence,
          });
        } catch (e) {
          // optional: ignore or show a toast/Alert
          // console.warn("Failed to save history", e);
        }
      }
    })();
  }, [m.isSuccess, m.data, q, consent?.history]);

  const content = (() => {
    if (m.isPending)
      return <Text style={{ color: c.sub }}>Analyzing…</Text>;
    if (m.isError)
      return <Text style={{ color: c.sub }}>Couldn’t analyze. Please try again.</Text>;
    if (m.isSuccess)
      return (
        <>
          <Text style={{ color: c.sub, marginBottom: 6 }}>Input: {q || "(none)"} </Text>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: "700" }}>
            {m.data.emotion}{" "}
            <Text style={{ color: c.sub }}>
              ({Math.round(m.data.confidence * 100)}%)
            </Text>
          </Text>
          {!consent?.history && (
            <Text style={{ color: c.sub, marginTop: 10 }}>
              (Not saved — History is disabled in Consent)
            </Text>
          )}
        </>
      );
    return null;
  })();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 12 }}>
        Your mood
      </Text>

      <View style={{ backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 90, justifyContent: "center" }}>
        {m.isPending ? <ActivityIndicator /> : content}
      </View>

      <Pressable
        onPress={() => router.replace("/input")}
        style={{ borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingVertical: 12, alignItems: "center", marginTop: 12 }}
      >
        <Text style={{ color: c.text, fontWeight: "700" }}>Try again</Text>
      </Pressable>

      <Pressable
        onPress={() => router.replace("/")}
        style={{ backgroundColor: c.text, borderRadius: 16, paddingVertical: 12, alignItems: "center", marginTop: 10 }}
      >
        <Text style={{ color: c.bg, fontWeight: "700" }}>Back home</Text>
      </Pressable>
    </View>
  );
}
