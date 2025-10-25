import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Audio } from "expo-av";
import { useColors } from "@/lib/useColors";

export default function VoiceScreen() {
  const c = useColors();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      sound.setOnPlaybackStatusUpdate(s => {
        if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
      });
      await sound.playAsync();
    } catch (e: any) {
      Alert.alert("Play error", e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  const Btn = ({ title, onPress, ghost=false, disabled=false }: any) => (
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
      }}
    >
      {busy && !ghost ? (
        <ActivityIndicator color={c.bg} />
      ) : (
        <Text style={{ color: ghost ? c.text : c.bg, fontWeight: "700" }}>{title}</Text>
      )}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, gap: 12, justifyContent: "center" }}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: "800", marginBottom: 6 }}>Voice</Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {!recording ? (
          <Btn title="Start recording" onPress={startRecording} disabled={busy} />
        ) : (
          <Btn title="Stop" onPress={stopRecording} disabled={busy} />
        )}
        <Btn title="Play last" onPress={playLast} ghost disabled={!uri || busy} />
      </View>

      <Text style={{ color: c.sub, marginTop: 8 }}>
        {recording ? "Recording…" : uri ? `Saved: ${uri}` : "No recording yet"}
      </Text>
    </View>
  );
}
