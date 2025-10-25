import { create } from "zustand";

// Possible themes
export type Theme = "dark" | "light";

// Color palette helper
export function colors(theme: Theme) {
  return theme === "dark"
    ? {
        bg: "#000000",
        card: "#111111",
        text: "#ffffff",
        sub: "#aaaaaa",
        border: "rgba(255,255,255,0.2)",
      }
    : {
        bg: "#ffffff",
        card: "#f2f2f2",
        text: "#000000",
        sub: "#333333",
        border: "rgba(0,0,0,0.15)",
      };
}

// Zustand store
type ThemeState = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark", // default
  toggle: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
  setTheme: (t) => set({ theme: t }),
}));
