import { create } from "zustand";
import type { Consent } from "./consentStorage";
import { loadConsent, saveConsent, clearConsent } from "./consentStorage";

type CState = {
  loaded: boolean;
  consent: Consent | null;
  load: () => Promise<void>;
  setConsent: (c: Consent) => Promise<void>;
  denyAll: () => Promise<void>;
  reset: () => Promise<void>;
};

export const useConsent = create<CState>((set, get) => ({
  loaded: false,
  consent: null,

  load: async () => {
    const c = await loadConsent();
    set({ consent: c, loaded: true });
  },

  setConsent: async (c) => {
    const withTs = { ...c, ts: Date.now() };
    await saveConsent(withTs);
    set({ consent: withTs });
  },

  denyAll: async () => {
    const c: Consent = { voice: false, text: false, history: false, ts: Date.now() };
    await saveConsent(c);
    set({ consent: c });
  },

  reset: async () => {
    await clearConsent();
    set({ consent: null });
  },
}));

// Small helpers
export function hasVoice()  { return !!getSafe().consent?.voice; }
export function hasText()   { return !!getSafe().consent?.text;  }
function getSafe() { try { return useConsent.getState(); } catch { return { consent: null } as any; } }
