// lib/theme.ts
import { create } from "zustand";

export type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  toggle: () => void;
};

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark",
  toggle: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
}));

// Optional palette helper
export function getThemeColors(theme: Theme) {
  return theme === "dark"
    ? { bg: "#000000", card: "#111111", text: "#ffffff", sub: "#aaaaaa" }
    : { bg: "#ffffff", card: "#f2f2f2", text: "#000000", sub: "#333333" };
}
