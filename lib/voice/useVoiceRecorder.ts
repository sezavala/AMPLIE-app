import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export type RecorderState =
  | "idle"
  | "recording"
  | "recorded"
  | "playing"
  | "error"
  | "denied";

export function useVoiceRecorder({ maxMs = 6000, minMs = 3000 } = {}) {
  const [state, setState] = useState<RecorderState>("idle");
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([]);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordVizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const playVizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  async function ensurePermission() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setState("denied");
        setError(
          permission.canAskAgain
            ? "Microphone permission was denied."
            : "Microphone access is blocked in Settings."
        );
        return false;
      }
      setError(null);
      return true;
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to request permissions");
      return false;
    }
  }

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
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setState("recording");
      setLevels([]);
      startedAtRef.current = Date.now();

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;

      autoStopTimeoutRef.current = setTimeout(stop, maxMs);
      recordVizIntervalRef.current = setInterval(
        () => pushVizSample([0.06, 0.28]),
        60
      );
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to start recording");
    }
  }

  async function stop() {
    const rec = recordingRef.current;
    if (!rec) return;

    try {
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      if (elapsed < minMs) {
        await new Promise((r) => setTimeout(r, minMs - elapsed));
      }

      await rec.stopAndUnloadAsync();
      const recordingUri = rec.getURI();
      setUri(recordingUri ?? null);
      setState("recorded");

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to stop recording");
    } finally {
      clearRecordTimers();
      recordingRef.current = null;
    }
  }

  async function play() {
    if (!uri || state === "playing") return;
    try {
      setState("playing");

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          stopPlayback();
        }
      });

      playVizIntervalRef.current = setInterval(
        () => pushVizSample([0.12, 0.5]),
        80
      );
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Failed to play");
    }
  }

  async function stopPlayback() {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
      soundRef.current = null;
    } catch {}
    setState("recorded");
    clearPlayViz();
  }

  function discard() {
    setUri(null);
    setLevels([]);
    setError(null);
    setState("idle");
  }

  function clearError() {
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
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
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
    clearError,
    isRecording: state === "recording",
    isPlaying: state === "playing",
    isReady: state === "recorded",
    isDenied: state === "denied",
  };
}
