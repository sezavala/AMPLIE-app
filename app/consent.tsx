import { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useConsent } from "@/lib/consent";
import { useColors } from "@/lib/useColors";

export default function ConsentScreen() {
  const c = useColors();
  const router = useRouter();
  const { loaded, consent, setConsent, denyAll } = useConsent();

  const [voice, setVoice] = useState(false);
  const [text, setText] = useState(false);
  const [history, setHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    setVoice(!!consent?.voice);
    setText(!!consent?.text);
    setHistory(!!consent?.history);
  }, [loaded, consent]);

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
        }}
      >
        <ActivityIndicator size="large" color={c.text} />
      </View>
    );
  }

  async function onAllow() {
    setSaving(true);
    try {
      await setConsent({ voice, text, history, ts: Date.now() });
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Failed to save consent:", err);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onDeny() {
    setSaving(true);
    try {
      await denyAll();
      router.replace("/(tabs)");
    } catch (err) {
      console.error("Failed to deny consent:", err);
    } finally {
      setSaving(false);
    }
  }

  function onMoreInfo() {
    Linking.openURL("https://example.com/privacy");
  }

  const Row = ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <Text style={{ color: c.text, fontSize: 16 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} disabled={saving} />
    </View>
  );

  const Btn = ({
    title,
    onPress,
    ghost = false,
  }: {
    title: string;
    onPress: () => void;
    ghost?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={saving}
      style={{
        backgroundColor: ghost ? "transparent" : c.text,
        borderWidth: ghost ? 1 : 0,
        borderColor: c.border,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 12,
        opacity: saving ? 0.5 : 1,
      }}
    >
      {saving ? (
        <ActivityIndicator color={ghost ? c.text : c.bg} />
      ) : (
        <Text style={{ color: ghost ? c.text : c.bg, fontWeight: "700" }}>
          {title}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        padding: 24,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: c.text,
          fontSize: 28,
          fontWeight: "800",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Privacy Settings
      </Text>

      <Text style={{ color: c.sub, marginBottom: 24, textAlign: "center" }}>
        Choose what data AMPLIE can use to personalize your experience
      </Text>

      <View
        style={{
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 8,
        }}
      >
        <Row
          label="🎤 Voice recordings"
          value={voice}
          onValueChange={setVoice}
        />
        <Row label="✍️ Text analysis" value={text} onValueChange={setText} />
        <Row
          label="📊 Mood history"
          value={history}
          onValueChange={setHistory}
        />
      </View>

      <Btn title="Save Preferences" onPress={onAllow} />
      <Btn title="Disable All" onPress={onDeny} ghost />

      <Pressable
        onPress={onMoreInfo}
        style={{ marginTop: 16, alignItems: "center" }}
      >
        <Text style={{ color: c.sub, textDecorationLine: "underline" }}>
          Privacy Policy
        </Text>
      </Pressable>
    </View>
  );
}
