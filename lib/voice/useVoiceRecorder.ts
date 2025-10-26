// lib/voice/useVoiceRecorder.ts
import { useEffect, useRef, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

export type RecorderState = "idle" | "recording" | "recorded" | "playing" | "error" | "denied";

export function useVoiceRecorder({ maxMs = 6000, minMs = 3000 } = {}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([]); // 0..1 values for fake waveform

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // RN timers return numbers
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordVizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playVizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function ensurePermission() {
    const { granted, canAskAgain, status } = await Audio.requestPermissionsAsync();
    if (!granted) {
      setState("denied");
      setError(
        status === "denied" && !canAskAgain
          ? "Microphone access is blocked in Settings."
          : "Microphone permission was denied."
      );
      return false;
    }
    return true;
  }

  // simple visual “wiggle” for waveform (no true metering)
  function pushVizSample(range: [number, number]) {
    const [lo, hi] = range;
    const v = lo + Math.random() * (hi - lo);
    setLevels((prev) => [...prev.slice(-39), v]);
  }

  async function start() {
    setError(null);
    const ok = await ensurePermission();
    if (!ok) return;

    try {
      setState("recording");
      setLevels([]);
      startedAtRef.current = Date.now();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      // Use HIGH_QUALITY preset; no metering flags
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      // auto-stop at maxMs
      autoStopTimeoutRef.current = setTimeout(stop, maxMs);
      // fake waveform during recording (subtle)
      recordVizIntervalRef.current = setInterval(() => pushVizSample([0.06, 0.28]), 60);
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to start recording");
    }
  }

  async function stop() {
    const rec = recordingRef.current;
    if (!rec) return;

    try {
      // enforce minimum duration
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      if (elapsed < minMs) await new Promise((r) => setTimeout(r, minMs - elapsed));

      await rec.stopAndUnloadAsync();
      setUri(rec.getURI() ?? null);
      setState("recorded");
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to stop recording");
    } finally {
      clearRecordTimers();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      }).catch(() => {});
    }
  }

  async function play() {
    if (!uri || state === "playing") return;
    try {
      setState("playing");
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true }, onPlayStatus);
      soundRef.current = sound;
      // more energetic fake waveform while playing
      playVizIntervalRef.current = setInterval(() => pushVizSample([0.12, 0.5]), 80);
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to play");
    }
  }

  async function stopPlayback() {
    const s = soundRef.current;
    if (!s) return;
    try {
      await s.stopAsync();
      await s.unloadAsync();
    } catch {}
    soundRef.current = null;
    setState("recorded");
    clearPlayViz();
  }

  function onPlayStatus(status: AVPlaybackStatus) {
    if (!status.isLoaded) return;
    if (status.didJustFinish) stopPlayback();
  }

  function discard() {
    setUri(null);
    setLevels([]);
    setError(null);
    setState("idle");
  }

  function clearRecordTimers() {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (recordVizIntervalRef.current) {
      clearInterval(recordVizIntervalRef.current);
      recordVizIntervalRef.current = null;
    }
  }

  function clearPlayViz() {
    if (playVizIntervalRef.current) {
      clearInterval(playVizIntervalRef.current);
      playVizIntervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearRecordTimers();
      clearPlayViz();
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  return {
    state,
    uri,
    error,
    levels,
    start,
    stop,
    play,
    stopPlayback,
    discard,
    clearError: () => setError(null),
    isRecording: state === "recording",
    isPlaying: state === "playing",
    isReady: state === "recorded",
    isDenied: state === "denied",
  };
}
