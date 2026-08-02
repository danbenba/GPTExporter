import { ApiError, AuthError, RateLimitError } from '@/core/api/errors';
import type { ClaudeConversation, ClaudeOrganization } from './model';

const CONVERSATION_QUERIES = [
  'tree=True&rendering_mode=messages&render_all_tools=true&consistency=eventual',
  'tree=True&rendering_mode=messages&render_all_tools=true',
  'tree=True&rendering_mode=messages',
  'rendering_mode=messages',
];

const REQUEST_TIMEOUT_MS = 60_000;
const TRANSIENT_STATUSES = new Set([500, 502, 503, 504, 524, 529]);

let cachedOrgId: string | null = null;

export async function claudeGet<T>(
  path: string,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'include',
      headers: { Accept: 'application/json', ...extraHeaders },
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
  if (response.headers.get('cf-mitigated') === 'challenge') {
    throw new AuthError('Cloudflare challenge, reload claude.ai and retry');
  }
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(`Claude request rejected with ${response.status}`);
  }
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') ?? '30');
    throw new RateLimitError(Number.isFinite(retryAfter) ? retryAfter : 30);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Claude request to ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

function organizationFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)lastActiveOrg=([0-9a-f-]{36})/i);
  return match ? match[1] : null;
}

export async function getOrganizationId(force = false): Promise<string> {
  if (!force && cachedOrgId) return cachedOrgId;

  if (!force) {
    const fromCookie = organizationFromCookie();
    if (fromCookie) {
      cachedOrgId = fromCookie;
      return cachedOrgId;
    }
  }

  const organizations = await claudeGet<ClaudeOrganization[]>('/api/organizations');
  const usable =
    organizations.find((org) => org.capabilities?.includes('chat')) ?? organizations[0];
  if (!usable?.uuid) {
    throw new AuthError('No Claude organization available');
  }
  cachedOrgId = usable.uuid;
  return cachedOrgId;
}

export function invalidateOrganization(): void {
  cachedOrgId = null;
}

function conversationPath(
  organizationId: string,
  conversationId: string,
  query: string,
): string {
  const base = `/api/organizations/${organizationId}/chat_conversations/${conversationId}`;
  return query ? `${base}?${query}` : base;
}

export async function fetchClaudeConversation(
  conversationId: string,
): Promise<ClaudeConversation> {
  let organizationId = await getOrganizationId();
  let lastError: unknown = null;
  let retriedOrganization = false;

  for (const query of CONVERSATION_QUERIES) {
    try {
      return await claudeGet<ClaudeConversation>(
        conversationPath(organizationId, conversationId, query),
      );
    } catch (error) {
      lastError = error;
      if (error instanceof RateLimitError) throw error;

      if (error instanceof AuthError && !retriedOrganization) {
        retriedOrganization = true;
        invalidateOrganization();
        organizationId = await getOrganizationId(true);
        try {
          return await claudeGet<ClaudeConversation>(
            conversationPath(organizationId, conversationId, query),
          );
        } catch (retryError) {
          lastError = retryError;
          if (retryError instanceof AuthError) throw retryError;
        }
      }

      const status = error instanceof ApiError ? error.status : 0;
      const isTimeout = error instanceof DOMException && error.name === 'AbortError';
      if (!isTimeout && status !== 0 && !TRANSIENT_STATUSES.has(status) && status < 400) {
        throw error;
      }
    }
  }

  try {
    const latest = await claudeGet<{ snapshot?: ClaudeConversation }>(
      `/api/organizations/${organizationId}/chat_conversations/${conversationId}/latest`,
    );
    if (latest.snapshot?.chat_messages) return latest.snapshot;
  } catch (error) {
    lastError = error;
  }

  throw lastError ?? new ApiError(500, 'Unable to fetch the Claude conversation');
}

export async function resolveClaudeAsset(pointer: string): Promise<string | null> {
  if (!pointer) return null;
  if (/^https?:\/\//.test(pointer)) return pointer;
  return `${location.origin}${pointer.startsWith('/') ? '' : '/'}${pointer}`;
}
