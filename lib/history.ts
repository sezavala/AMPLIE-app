// lib/history.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type HistoryItem = {
  id: string;
  src: "text" | "voice";
  mode?: "reflect" | "work";
  text?: string;
  clipUri?: string | null;
  emotion: string;
  confidence: number; // 0..1
  createdAt: number;
};

const KEY = "history.v1";
const isWeb = Platform.OS === "web";

// ---------------- Helpers ----------------

async function read(): Promise<HistoryItem[]> {
  try {
    const json = isWeb
      ? localStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
    if (!json) return [];
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? (arr as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

async function write(items: HistoryItem[]) {
  const json = JSON.stringify(items);
  if (isWeb) localStorage.setItem(KEY, json);
  else await SecureStore.setItemAsync(KEY, json);
}

// ---------------- API ----------------

export async function loadHistory(): Promise<HistoryItem[]> {
  return await read();
}

export async function appendHistory(item: HistoryItem): Promise<void> {
  const current = await read();
  // newest first, limit 100
  const next = [item, ...current].slice(0, 100);
  await write(next);
}

export async function clearHistory() {
  if (isWeb) localStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
}
