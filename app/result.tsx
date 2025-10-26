import * as React from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useColors } from "../lib/useColors";
import { useConsent } from "../lib/consent";
import { appendHistory } from "../lib/history";
import { post } from "@/lib/api";

// ✅ REAL API CALL - Connect to backend /emotion endpoint
async function fetchEmotion(input: {
  src: "text" | "voice";
  text?: string;
  clip?: string;
}): Promise<{ emotion: string; confidence: number }> {
  // For text input
  if (input.src === "text" && input.text) {
    return await post<{ emotion: string; confidence: number }>("/emotion", {
      text: input.text,
    });
  }

  // For voice input - send the clip URI
  if (input.src === "voice" && input.clip) {
    // ⚠️ For demo: if clip is local file URI, just analyze as text "voice input"
    // In production, you'd upload the file first
    return await post<{ emotion: string; confidence: number }>("/emotion", {
      text: "User provided voice input for mood analysis",
    });
  }

  throw new Error("Invalid input: provide either text or clip");
}

export default function ResultScreen() {
  const c = useColors();
  const router = useRouter();
  const { consent } = useConsent();

  const { src, mode, text, clip } = useLocalSearchParams<{
    src?: "text" | "voice";
    mode?: "reflect" | "work";
    text?: string;
    clip?: string;
  }>();

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{
    emotion: string;
    confidence: number;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // 🔹 Fetch emotion result from backend
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchEmotion({
      src: (src ?? "text") as "text" | "voice",
      text,
      clip,
    })
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((err) => {
        if (alive) {
          console.error("Emotion fetch error:", err);
          setError(err.message || "Failed to analyze emotion");
        }
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
    }).catch((err) => {
      console.error("Failed to save history:", err);
    });
  }, [data, consent?.history, src, mode, text, clip]);

  // 🔹 Render
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          alignSelf: "flex-start",
          paddingVertical: 8,
          paddingHorizontal: 12,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: c.text, fontSize: 16 }}>← Back</Text>
      </Pressable>

      {/* Content */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={c.text} />
          <Text style={{ color: c.sub, marginTop: 12 }}>
            Analyzing your mood...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text
            style={{
              color: c.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Analysis Failed
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
            <Text style={{ color: c.bg, fontWeight: "700" }}>Try Again</Text>
          </Pressable>
        </View>
      ) : data ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 64, marginBottom: 24 }}>
            {getEmotionEmoji(data.emotion)}
          </Text>
          <Text
            style={{
              color: c.text,
              fontSize: 32,
              fontWeight: "800",
              marginBottom: 8,
            }}
          >
            {data.emotion}
          </Text>
          <Text style={{ color: c.sub, fontSize: 18, marginBottom: 32 }}>
            {Math.round(data.confidence * 100)}% confident
          </Text>

          {src === "text" && text && (
            <View
              style={{
                backgroundColor: c.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                width: "100%",
                maxWidth: 400,
              }}
            >
              <Text style={{ color: c.sub, fontSize: 14, marginBottom: 4 }}>
                Your input:
              </Text>
              <Text
                style={{ color: c.text, fontSize: 16, fontStyle: "italic" }}
              >
                "{text}"
              </Text>
            </View>
          )}

          {/* ADD THIS: Show Playlist Button */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/playlist",
                params: { emotion: data.emotion, mode: mode || "reflect" },
              })
            }
            style={{
              backgroundColor: c.text,
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: c.bg, fontWeight: "700", fontSize: 16 }}>
              🎵 View Playlist
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={{
              backgroundColor: "transparent",
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>
              Done
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function getEmotionEmoji(emotion: string): string {
  const map: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    relaxed: "😌",
    hopeful: "🌟",
    tired: "😴",
    calm: "🧘",
    excited: "🎉",
    anxious: "😰",
    neutral: "😐",
  };
  return map[emotion.toLowerCase()] || "🤔";
}
