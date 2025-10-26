// lib/useEmotion.ts
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";

export type EmotionRes = { emotion: string; confidence: number };

export function useEmotion() {
  return useMutation<EmotionRes, Error, string>({
    mutationFn: async (text) => post<EmotionRes>("/emotion", { text }),
  });
}
