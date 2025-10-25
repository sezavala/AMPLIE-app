// lib/useColors.ts
import { useTheme, colors } from "@/lib/theme";

export function useColors() {
  const theme = useTheme((s) => s.theme);
  return colors(theme);
}
