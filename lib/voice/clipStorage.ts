// lib/voice/clipStorage.ts
import * as FileSystem from "expo-file-system";

// Try to resolve native directories (native only)
const docDir =
  ((FileSystem as any).documentDirectory as string | null | undefined) ?? null;
const cacheDir =
  ((FileSystem as any).cacheDirectory as string | null | undefined) ?? null;

const storageAvailable = !!(docDir || cacheDir);

// Native path (iOS/Android). On web these are null.
export const CLIPS_DIR = storageAvailable
  ? `${(docDir ?? cacheDir)!}clips/`
  : "memory://clips/";

// --- In-memory fallback for web (session only) ---
const memoryClips: { name: string; uri: string; ts: number }[] = [];

async function ensureClipsDir() {
  if (!storageAvailable) return;
  const info = await FileSystem.getInfoAsync(CLIPS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CLIPS_DIR, { intermediates: true });
  }
}

function extFromUri(uri: string) {
  const name = uri.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : "m4a";
}

/** Save a temp recording URI into persistent clips/ (native) or session memory (web). */
export async function saveClip(
  tempUri: string,
  opts?: { name?: string; ext?: string }
) {
  const base = opts?.name || `clip-${Date.now()}`;
  const ext = (opts?.ext ?? extFromUri(tempUri)).replace(/^\./, "");

  if (!storageAvailable) {
    // Web: session-only list
    const name = `${base}.${ext}`;
    memoryClips.unshift({ name, uri: tempUri, ts: Date.now() });
    return `${CLIPS_DIR}${name}`; // memory://clips/clip-*.m4a
  }

  await ensureClipsDir();
  const dest = `${CLIPS_DIR}${base}.${ext}`;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest; // file:///.../clips/clip-*.m4a
}

/** List saved clips (newest first). */
export async function listClips(): Promise<{ name: string; uri: string }[]> {
  if (!storageAvailable) {
    return memoryClips.map(({ name, uri }) => ({ name, uri }));
  }
  await ensureClipsDir();
  const names = await FileSystem.readDirectoryAsync(CLIPS_DIR);
  names.sort((a, b) => (a < b ? 1 : -1));
  return names.map((n) => ({ name: n, uri: CLIPS_DIR + n }));
}

/** Delete a clip by name or full URI (idempotent). */
export async function deleteClip(uriOrName: string) {
  if (!storageAvailable) {
    const key = uriOrName.startsWith("memory://clips/")
      ? uriOrName.replace("memory://clips/", "")
      : uriOrName;
    const idx = memoryClips.findIndex((c) => c.name === key || c.uri === uriOrName);
    if (idx >= 0) memoryClips.splice(idx, 1);
    return;
  }
  const uri = uriOrName.startsWith("file://")
    ? uriOrName
    : CLIPS_DIR + uriOrName;
  await FileSystem.deleteAsync(uri, { idempotent: true });
}
