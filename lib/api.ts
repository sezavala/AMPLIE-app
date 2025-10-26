export const BASE_URL = process.env.EXPO_PUBLIC_API ?? "";

export async function post<T>(path: string, body: any): Promise<T> {
  if (!BASE_URL) {
    throw new Error("API URL not configured. Set EXPO_PUBLIC_API in .env");
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(`API error ${res.status}: ${errorText}`);
    }

    return res.json();
  } catch (err: any) {
    // Network error or JSON parse error
    if (
      err.message?.includes("Failed to fetch") ||
      err.message?.includes("Network request failed")
    ) {
      throw new Error("Cannot connect to server. Is the backend running?");
    }
    throw err;
  }
}

export async function get<T>(path: string): Promise<T> {
  if (!BASE_URL) {
    throw new Error("API URL not configured. Set EXPO_PUBLIC_API in .env");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  return res.json();
}
