import { ApiError, AuthError, RateLimitError } from '@/core/api/errors';
import type { ClaudeConversation, ClaudeOrganization } from './model';

const CONVERSATION_QUERY = 'tree=True&rendering_mode=messages&render_all_tools=true';

let cachedOrgId: string | null = null;

async function claudeGet<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: 'include' });
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

export async function getOrganizationId(force = false): Promise<string> {
  if (!force && cachedOrgId) return cachedOrgId;
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

export async function fetchClaudeConversation(
  conversationId: string,
): Promise<ClaudeConversation> {
  const organizationId = await getOrganizationId();
  const path = `/api/organizations/${organizationId}/chat_conversations/${conversationId}?${CONVERSATION_QUERY}`;
  try {
    return await claudeGet<ClaudeConversation>(path);
  } catch (error) {
    if (error instanceof AuthError) {
      invalidateOrganization();
      const retryOrganization = await getOrganizationId(true);
      return claudeGet<ClaudeConversation>(
        `/api/organizations/${retryOrganization}/chat_conversations/${conversationId}?${CONVERSATION_QUERY}`,
      );
    }
    throw error;
  }
}

export async function resolveClaudeAsset(pointer: string): Promise<string | null> {
  if (!pointer) return null;
  if (/^https?:\/\//.test(pointer)) return pointer;
  return `${location.origin}${pointer.startsWith('/') ? '' : '/'}${pointer}`;
}
