import { SESSION_TOKEN_SAFETY_WINDOW_MS } from '@/shared/constants';
import { endpoints } from './endpoints';
import { AuthError } from './errors';

interface SessionResponse {
  accessToken?: string;
  expires?: string;
  user?: { id?: string; email?: string; name?: string };
}

interface CachedSession {
  accessToken: string;
  expiresAt: number;
}

let cached: CachedSession | null = null;

export async function getAccessToken(force = false): Promise<string> {
  if (!force && cached && cached.expiresAt - SESSION_TOKEN_SAFETY_WINDOW_MS > Date.now()) {
    return cached.accessToken;
  }
  const response = await fetch(endpoints.session(), { credentials: 'include' });
  if (!response.ok) {
    throw new AuthError(`Session endpoint returned ${response.status}`);
  }
  const data = (await response.json()) as SessionResponse;
  if (!data.accessToken) {
    throw new AuthError();
  }
  const expiresAt = data.expires ? Date.parse(data.expires) : Date.now() + 5 * 60_000;
  cached = { accessToken: data.accessToken, expiresAt };
  return cached.accessToken;
}

export function invalidateSession(): void {
  cached = null;
}
