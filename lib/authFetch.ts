import { useAuth } from '@clerk/clerk-expo';

/** Hook that returns a fetch wrapper injecting Authorization: Bearer <JWT> */
export function useAuthFetch() {
  const { getToken } = useAuth();

  const authFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    // ✅ No template — use the default Clerk session token
    const token = await getToken();
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    return fetch(input, { ...init, headers });
  };

  return { authFetch };
}
