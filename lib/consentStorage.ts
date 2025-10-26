import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "consent.v1";

export type Consent = {
  voice: boolean;   // mic / voice snippets
  text: boolean;    // text analysis
  history: boolean; // saving results locally or to cloud
  ts: number;       // epoch millis
};

const isWeb = Platform.OS === "web";

export async function saveConsent(c: Consent) {
  const json = JSON.stringify(c);
  if (isWeb) localStorage.setItem(KEY, json);
  else await SecureStore.setItemAsync(KEY, json);
}

export async function loadConsent(): Promise<Consent | null> {
  const json = isWeb ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
  if (!json) return null;
  try { return JSON.parse(json) as Consent; } catch { return null; }
}

export async function clearConsent() {
  if (isWeb) localStorage.removeItem(KEY);
  else await SecureStore.deleteItemAsync(KEY);
}
