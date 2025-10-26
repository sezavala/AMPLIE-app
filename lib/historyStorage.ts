import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { nanoid } from "nanoid/non-secure"; // optional; or make your own id
// If you don't want nanoid, replace with: const id = String(Date.now())

const KEY = "history.v1";
const isWeb = Platform.OS === "web";

export type HistoryItem = {
  id: string;
  text: string;
  emotion: string;
  confidence: number; // 0..1
  ts: number;         // epoch ms
};

async function readRaw(): Promise<HistoryItem[]> {
  const json = isWeb ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr as HistoryItem[] : [];
  } catch {
    return [];
  }
}

async function writeRaw(items: HistoryItem[]) {
  const json = JSON.stringify(items);
  if (isWeb) localStorage.setItem(KEY, json);
  else await SecureStore.setItemAsync(KEY, json);
}

export async function loadHistory(): Promise<HistoryItem[]> {
  return await readRaw();
}

export async function appendHistory(item: Omit<HistoryItem, "id" | "ts">) {
  const items = await readRaw();
  const entry: HistoryItem = {
    id: nanoid ? nanoid() : String(Date.now()),
    ts: Date.now(),
    ...item,
  };
  // keep most recent first, cap to 100
  const next = [entry, ...items].slice(0, 100);
  await writeRaw(next);
}

export async function clearHistory() {
  if (isWeb) localStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
}
