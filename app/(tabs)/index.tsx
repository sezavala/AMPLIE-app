import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";
import { get } from "@/lib/api";

export default function HomeScreen() {
  const c = useColors();
  const router = useRouter();
  const { signOut, isLoaded } = useAuth();
  const { consent, loaded } = useConsent();
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  // ✅ Load consent on mount
  useEffect(() => {
    if (!loaded) {
      useConsent.getState().load();
    }
  }, [loaded]);

  // ✅ Check backend health on mount
  useEffect(() => {
    async function checkBackend() {
      try {
        const health = await get<{ status: string }>("/health");
        if (health.status === "ok") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (err) {
        console.error("Backend health check failed:", err);
        setBackendStatus("offline");
      }
    }
    checkBackend();
  }, []);

  // ✅ Show loading spinner while auth or consent loads
  if (!isLoaded || !loaded) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: c.bg,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={c.text} />
        <Text style={{ color: c.sub, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Backend Status Banner */}
      {backendStatus === "offline" && (
        <View
          style={{
            backgroundColor: "#ff4444",
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            ⚠️ Backend offline. Start the server: cd AMPLIE-cloud && npm run dev
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { color: c.text }]}>Welcome to AMPLIE</Text>

        <Text style={[styles.subtitle, { color: c.sub }]}>
          Your AI-powered music companion
        </Text>

        <View style={styles.features}>
          <FeatureCard
            title="Voice Analysis"
            description="Record your voice and get personalized music"
            emoji="🎤"
            enabled={!!consent?.voice && backendStatus === "online"}
            onPress={() => router.push("/voice")}
            c={c}
          />

          <FeatureCard
            title="Text Input"
            description="Type how you feel and discover new music"
            emoji="✍️"
            enabled={!!consent?.text && backendStatus === "online"}
            onPress={() => router.push("/text")}
            c={c}
          />

          <FeatureCard
            title="Group Room"
            description="Blend moods with friends"
            emoji="👥"
            enabled={backendStatus === "online"}
            onPress={() => router.push("/group")}
            c={c}
          />

          <FeatureCard
            title="History"
            description="Review your past mood analyses"
            emoji="📊"
            enabled={!!consent?.history}
            onPress={() => router.push("/history")}
            c={c}
          />
        </View>

        {(!consent?.voice || !consent?.text || !consent?.history) && (
          <Pressable
            onPress={() => router.push("/consent")}
            style={[
              styles.consentButton,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={{ color: c.text, fontWeight: "600" }}>
              ⚙️ Configure Permissions
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => signOut()}
          style={[
            styles.signOutButton,
            { backgroundColor: "transparent", borderColor: c.border },
          ]}
        >
          <Text style={{ color: c.sub, fontWeight: "600" }}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FeatureCard({
  title,
  description,
  emoji,
  enabled,
  onPress,
  c,
}: {
  title: string;
  description: string;
  emoji: string;
  enabled: boolean;
  onPress: () => void;
  c: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={enabled ? onPress : undefined}
      style={[
        styles.featureCard,
        {
          backgroundColor: enabled ? c.card : c.bg,
          borderColor: enabled ? c.border : c.sub,
          opacity: enabled ? 1 : 0.5,
        },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.featureTitle, { color: c.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: c.sub }]}>
        {description}
      </Text>
      {!enabled && (
        <Text style={[styles.disabledText, { color: c.sub }]}>
          {title === "Group Room" ? "Backend offline" : "Enable in settings"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
  features: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  disabledText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  consentButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  signOutButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    alignItems: "center",
  },
});
