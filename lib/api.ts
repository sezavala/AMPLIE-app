// lib/api.ts
export const BASE_URL = process.env.EXPO_PUBLIC_API ?? "";

export async function post<T>(path: string, body: any): Promise<T> {
  if (!BASE_URL) {
    // Mocked response for local dev
    await new Promise((r) => setTimeout(r, 500));
    // @ts-expect-error caller defines T
    return { emotion: "calm", confidence: 0.82 };
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
