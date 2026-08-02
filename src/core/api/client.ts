import { ApiError, AuthError, RateLimitError } from './errors';
import { getAccessToken, invalidateSession } from './session';

async function authorizedFetch(path: string, token: string): Promise<Response> {
  return fetch(path, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiGet<T>(path: string): Promise<T> {
  let token = await getAccessToken();
  let response = await authorizedFetch(path, token);

  if (response.status === 401) {
    invalidateSession();
    token = await getAccessToken(true);
    response = await authorizedFetch(path, token);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthError(`Request rejected with ${response.status}`);
  }
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') ?? '30');
    throw new RateLimitError(Number.isFinite(retryAfter) ? retryAfter : 30);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}
