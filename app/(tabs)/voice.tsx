import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";

type Mode = "reflect" | "work";

export default function VoiceScreen() {
  const c = useColors();
  const router = useRouter();
  const { loaded, consent } = useConsent();

  const [mode, setMode] = useState<Mode>("reflect");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // ---- loading / blocked states ----
  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!consent?.voice) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: "center" }}>
        <Text style={{ color: c.text, fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
          Microphone disabled
        </Text>
        <Text style={{ color: c.sub, marginBottom: 12 }}>
          You denied voice snippets. Enable it in Consent to use recording.
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

  // ---- recorder ----
  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Microphone access denied");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setUri(null); // reset previous clip
    } catch (e: any) {
      Alert.alert("Record error", e?.message ?? String(e));
    }
  }

  async function stopRecording() {
    if (!recording) return;
    try {
      setBusy(true);
      await recording.stopAndUnloadAsync();
      setUri(recording.getURI() ?? null);
      setRecording(null);
    } catch (e: any) {
      Alert.alert("Stop error", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function playLast() {
    if (!uri) return;
    try {
      setBusy(true);
      const { sound } = await Audio.Sound.createAsync({ uri });
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
      });
      await sound.playAsync();
    } catch (e: any) {
      Alert.alert("Play error", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  function analyze() {
    if (!uri) return;
    // send the audio clip for analysis later; for now just pass params
    router.push({ pathname: "/result", params: { src: "voice", mode } });
  }

  // ---- tiny UI helpers ----
  const Btn = ({
    title, onPress, ghost = false, disabled = false,
  }: { title: string; onPress: () => void; ghost?: boolean; disabled?: boolean }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: ghost ? "transparent" : c.text,
        borderWidth: ghost ? 1 : 0,
        borderColor: c.border,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 16,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
        marginRight: 10,
      }}
    >
      {busy && !ghost ? (
        <ActivityIndicator color={c.bg} />
      ) : (
        <Text style={{ color: ghost ? c.text : c.bg, fontWeight: "700" }}>{title}</Text>
      )}
    </Pressable>
  );

  const ModeBtn = ({ value, label }: { value: Mode; label: string }) => {
    const selected = mode === value;
    return (
      <Pressable
        onPress={() => setMode(value)}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 12,
          alignItems: "center",
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: selected ? c.card : "transparent",
        }}
      >
        <Text style={{ color: selected ? c.text : c.sub, fontWeight: "700" }}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 12 }}>
        Voice
      </Text>

      {/* Mode picker */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <ModeBtn value="reflect" label="Reflect" />
        <ModeBtn value="work" label="Work With" />
      </View>

      {/* Recorder controls */}
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {!recording ? (
          <Btn title="Start recording" onPress={startRecording} disabled={busy} />
        ) : (
          <Btn title="Stop" onPress={stopRecording} disabled={busy} />
        )}
        <Btn title="Play last" onPress={playLast} ghost disabled={!uri || busy} />
      </View>

      <Text style={{ color: c.sub, marginTop: 8, marginBottom: 16 }}>
        {recording ? "Recording…" : uri ? `Saved clip: ${uri}` : "No recording yet"}
      </Text>

      {/* Analyze (enabled after you have a clip) */}
      <Btn title="Analyze" onPress={analyze} disabled={!uri || busy} />
      {!uri && (
        <Text style={{ color: c.sub, marginTop: 8 }}>
          Record a short clip, then tap Analyze.
        </Text>
      )}
    </View>
  );
}
