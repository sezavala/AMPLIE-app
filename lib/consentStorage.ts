import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "consent.v1";
const isWeb = Platform.OS === "web";

export type ConsentPrefs = {
  consentGiven: boolean;
  localOnly: boolean;
  allowGroup: boolean;
};

export async function saveConsent(prefs: ConsentPrefs) {
  const value = JSON.stringify(prefs);
  if (isWeb) {
    // Web fallback (not secure, but fine for dev/demo)
    window.localStorage.setItem(KEY, value);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

export async function loadConsent(): Promise<ConsentPrefs | null> {
  if (isWeb) {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConsentPrefs) : null;
  }
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? (JSON.parse(raw) as ConsentPrefs) : null;
}

export async function clearConsent() {
  if (isWeb) {
    window.localStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
