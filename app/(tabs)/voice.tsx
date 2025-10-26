// app/(tabs)/voice.tsx
import * as React from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";
import { useVoiceRecorder } from "@/lib/voice/useVoiceRecorder";
import { saveClip } from "@/lib/voice/clipStorage";
import { MicButton } from "../../components/MicButton";
import { WaveformMini } from "../../components/WaveFormMini";

type Mode = "reflect" | "work";

export default function VoiceTab() {
  const c = useColors();
  const router = useRouter();
  const { loaded, consent } = useConsent();

  const {
    state, uri, error, levels,
    start, stop, play, stopPlayback, discard,
    clearError, isRecording, isPlaying, isReady, isDenied
  } = useVoiceRecorder({ maxMs: 6000, minMs: 3000 });

  const [mode, setMode] = React.useState<Mode>("reflect");

  // 👇 track the last persisted clip so we don't save duplicates
  const [savedUri, setSavedUri] = React.useState<string | null>(null);
  const savedOnceRef = React.useRef(false);

  // Reset the saved guard whenever we start a new recording
  const onMicPress = React.useCallback(() => {
    if (isPlaying) return;
    if (isRecording) {
      stop();
    } else {
      // new take → clear saved flag so we can save next finished recording
      savedOnceRef.current = false;
      setSavedUri(null);
      start();
    }
  }, [isPlaying, isRecording, start, stop]);

  // Auto-save to clips/ as soon as a recording is ready
  React.useEffect(() => {
    (async () => {
      if (!isReady || !uri) return;
      if (savedOnceRef.current) return;      // already saved this take
      try {
        const dest = await saveClip(uri);    // file:///.../clips/clip-*.m4a  (web: session memory)
        setSavedUri(dest);
        savedOnceRef.current = true;
        // (optional) tiny toast/alert:
        // Alert.alert("Saved", dest.replace(/^file:\/\//, ""));
      } catch (e: any) {
        Alert.alert("Save failed", e?.message ?? String(e));
      }
    })();
  }, [isReady, uri]);

  // ---------- consent / loading ----------
  if (!loaded) {
    return (
      <View style={{ flex:1, backgroundColor:c.bg, alignItems:"center", justifyContent:"center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!consent?.voice) {
    return (
      <View style={{ flex:1, backgroundColor:c.bg, padding:24, justifyContent:"center" }}>
        <Text style={{ color:c.text, fontSize:20, fontWeight:"800", marginBottom:8 }}>Microphone disabled</Text>
        <Text style={{ color:c.sub, marginBottom:12 }}>Enable “Voice snippets” in Consent to record.</Text>
        <Pressable onPress={() => router.push("/consent")} style={{ backgroundColor:c.text, borderRadius:16, paddingVertical:12, alignItems:"center" }}>
          <Text style={{ color:c.bg, fontWeight:"700" }}>Open Consent</Text>
        </Pressable>
      </View>
    );
  }
  if (isDenied || error) {
    return (
      <View style={{ flex:1, backgroundColor:c.bg, padding:24, justifyContent:"center" }}>
        <Text style={{ color:c.text, fontSize:20, fontWeight:"800", marginBottom:8 }}>Microphone permission</Text>
        <Text style={{ color:c.sub, marginBottom:12 }}>{error ?? "Microphone access is required to record a clip."}</Text>
        <Pressable onPress={() => Alert.alert("Settings", "Enable mic in device settings.")} style={{ backgroundColor:c.text, borderRadius:16, paddingVertical:12, alignItems:"center" }}>
          <Text style={{ color:c.bg, fontWeight:"700" }}>Open Settings</Text>
        </Pressable>
        <Pressable onPress={clearError} style={{ borderWidth:1, borderColor:c.border, borderRadius:16, paddingVertical:12, alignItems:"center", marginTop:10 }}>
          <Text style={{ color:c.text, fontWeight:"700" }}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <View style={{ flex:1, backgroundColor:c.bg, padding:24 }}>
      <Text style={{ color:c.text, fontSize:22, fontWeight:"800", marginBottom:12 }}>Voice</Text>

      {/* mode picker */}
      <View style={{ flexDirection:"row", gap:10, marginBottom:16 }}>
        <ModeBtn label="Reflect" value="reflect" mode={mode} setMode={setMode} colors={c} />
        <ModeBtn label="Work With" value="work" mode={mode} setMode={setMode} colors={c} />
      </View>

      {/* waveform + status */}
      <View style={{ backgroundColor:c.card, borderColor:c.border, borderWidth:1, borderRadius:16, padding:16, marginBottom:14 }}>
        <WaveformMini levels={levels} color={c.sub} height={32} />
        <Text style={{ color:c.sub, marginTop:8 }}>
          {isRecording
            ? "Recording… tap again to stop (auto 6s max)"
            : isPlaying
            ? "Playing…"
            : isReady
            ? `Clip ready${(savedUri ?? uri) ? ` (${(savedUri ?? uri)!.split("/").pop()})` : ""}`
            : "Tap mic to start recording (3–6s)"}
        </Text>
      </View>

      {/* mic button (tap to toggle) */}
      <View style={{ alignItems:"center", marginBottom:16 }}>
        <MicButton onPress={onMicPress} disabled={isPlaying} recording={isRecording} />
      </View>

      {/* actions */}
      <Row gap={10} center>
        <Btn title="Play" onPress={play} disabled={!isReady || isPlaying} filled />
        <Btn title="Stop" onPress={stopPlayback} disabled={!isPlaying} ghost />
        <Btn title="Discard" onPress={() => { discard(); setSavedUri(null); savedOnceRef.current = false; }} disabled={!isReady && !isPlaying} ghost />
      </Row>

      {/* Analyze uses the saved file if available */}
      {isReady && (
        <Btn
          title="Analyze"
          onPress={() => router.push({ pathname: "/result", params: { src: "voice", mode, clip: savedUri ?? uri ?? "" } })}
          style={{ marginTop: 14 }}
          filled
        />
      )}
    </View>
  );
}

/* ---- small helpers (same as before) ---- */
function ModeBtn({ label, value, mode, setMode, colors: c }:{label:string; value:Mode; mode:Mode; setMode:(m:Mode)=>void; colors:ReturnType<typeof useColors>;}) {
  const selected = mode === value;
  return (
    <Pressable
      onPress={() => setMode(value)}
      style={{ flex:1, paddingVertical:10, borderRadius:12, alignItems:"center", borderWidth:1, borderColor:c.border, backgroundColor:selected?c.card:"transparent" }}
    >
      <Text style={{ color: selected ? c.text : c.sub, fontWeight:"700" }}>{label}</Text>
    </Pressable>
  );
}
function Row({ children, gap = 8, center = false }:{ children:React.ReactNode; gap?:number; center?:boolean }) {
  return <View style={{ flexDirection:"row", columnGap:gap, justifyContent:center?"center":"flex-start" }}>{children}</View>;
}
function Btn({ title, onPress, disabled, filled=false, ghost=false, style }:{ title:string; onPress:()=>void; disabled?:boolean; filled?:boolean; ghost?:boolean; style?:any; }) {
  const bg = filled ? "#111" : ghost ? "transparent" : "transparent";
  const border = ghost ? "#444" : filled ? "transparent" : "#444";
  const color = filled ? "#fff" : "#ddd";
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ opacity: disabled?0.5:1, paddingVertical:12, paddingHorizontal:16, borderRadius:14, backgroundColor:bg, borderWidth: border==="transparent"?0:1, borderColor:border, alignItems:"center", minWidth:110 }, style ]}>
      <Text style={{ color, fontWeight:"700" }}>{title}</Text>
    </Pressable>
  );
}
