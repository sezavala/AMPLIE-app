// app/result.tsx
import * as React from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useColors } from "../lib/useColors";
import { useConsent } from "../lib/consent";
import { appendHistory } from "../lib/history";

// 🔹 Mock API call — replace with your real emotion endpoint later
async function fetchEmotion(input: { src: "text" | "voice"; text?: string; clip?: string }) {
  await new Promise((r) => setTimeout(r, 800)); // simulate small delay
  return { emotion: "calm", confidence: 0.82 };
}

export default function ResultScreen() {
  const c = useColors();
  const router = useRouter();
  const { consent } = useConsent();

  // Parameters passed from Text or Voice screen
  const { src, mode, text, clip } = useLocalSearchParams<{
    src?: "text" | "voice";
    mode?: "reflect" | "work";
    text?: string;
    clip?: string;
  }>();

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ emotion: string; confidence: number } | null>(null);

  // 🔹 Fetch emotion result
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchEmotion({ src: (src ?? "text") as "text" | "voice", text, clip })
      .then((res) => {
        if (alive) setData(res);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [src, text, clip]);

  // 🔹 Save to history when we have data and consent allows
  React.useEffect(() => {
    if (!data) return;
    if (!consent?.history) return;

    appendHistory({
      id: `${Date.now()}`,
      src: (src ?? "text") as "text" | "voice",
      mode: (mode ?? "reflect") as "reflect" | "work",
      text: text || undefined,
      clipUri: clip ?? null,
      emotion: data.emotion,
      confidence: data.confidence,
      createdAt: Date.now(),
    }).catch(() => {});
  }, [data, consent?.history, src, mode, text, clip]);

  // 🔹 Render
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      {/* In-page Back Button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: c.border,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: c.text, fontWeight: "700" }}>← Back</Text>
      </Pressable>

      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
        Result
      </Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={c.text} />
          <Text style={{ color: c.sub, marginTop: 12 }}>Analyzing…</Text>
        </View>
      ) : data ? (
        <>
          <View
            style={{
              backgroundColor: c.card,
              borderColor: c.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              marginTop: 10,
            }}
          >
            <Text style={{ color: c.text, fontSize: 20, fontWeight: "700" }}>
              {data.emotion} <Text style={{ color: c.sub }}>
                ({Math.round(data.confidence * 100)}%)
              </Text>
            </Text>
            <Text style={{ color: c.sub, marginTop: 6 }}>
              {mode ?? "reflect"} • {src ?? "text"}
            </Text>

            {src === "text" && text ? (
              <Text
                style={{ color: c.text, marginTop: 12, fontStyle: "italic" }}
                numberOfLines={3}
              >
                “{text}”
              </Text>
            ) : null}

            {src === "voice" && clip ? (
              <Text style={{ color: c.sub, marginTop: 12 }}>
                voice clip: {clip.split("/").pop()}
              </Text>
            ) : null}
          </View>
        </>
      ) : (
        <Text style={{ color: c.sub }}>No data.</Text>
      )}
    </View>
  );
}
