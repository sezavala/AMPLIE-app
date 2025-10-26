import { create } from "zustand";
import type { Consent } from "./consentStorage";

type Mode = "reflect" | "work";

type State = {
  consent: Consent | null;         // full object
  setConsent: (prefs: Consent) => void;
  mode: Mode | null;
  setMode: (m: Mode) => void;
};

export const useStore = create<State>((set) => ({
  consent: null,
  setConsent: (prefs) => set({ consent: prefs }),
  mode: null,
  setMode: (m) => set({ mode: m }),
}));
