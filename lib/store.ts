import { create } from "zustand";
import type { ConsentPrefs } from "./consentStorage";

type Mode = "reflect" | "work";

type State = {
  consent: ConsentPrefs | null;         // full object
  setConsent: (prefs: ConsentPrefs) => void;
  mode: Mode | null;
  setMode: (m: Mode) => void;
};

export const useStore = create<State>((set) => ({
  consent: null,
  setConsent: (prefs) => set({ consent: prefs }),
  mode: null,
  setMode: (m) => set({ mode: m }),
}));
