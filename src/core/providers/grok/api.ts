import { ApiError, AuthError, RateLimitError } from '@/core/api/errors';

const REQUEST_TIMEOUT_MS = 60_000;

export interface GrokConversationMeta {
  conversationId: string;
  title?: string;
  createTime?: string;
  modifyTime?: string;
  starred?: boolean;
  temporary?: boolean;
}

export interface GrokWebSearchResult {
  url?: string;
  title?: string;
  preview?: string;
  siteName?: string;
}

export interface GrokStep {
  type?: string;
  title?: string;
  message?: string;
  thinking?: string;
}

export interface GrokResponse {
  responseId: string;
  message?: string;
  sender?: string;
  createTime?: string;
  partial?: boolean;
  isControl?: boolean;
  model?: string;
  steps?: GrokStep[];
  webSearchResults?: GrokWebSearchResult[];
  citedWebSearchResults?: GrokWebSearchResult[];
  generatedImageUrls?: string[];
  imageAttachments?: Array<{ url?: string; fileUri?: string }>;
  fileAttachments?: Array<{ fileName?: string; fileUri?: string }>;
  webpageUrls?: string[];
}

async function grokFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(path, {
      credentials: 'include',
      ...init,
      headers: { Accept: 'application/json', ...(init.headers ?? {}) },
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timer);
  }
}

async function grokJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await grokFetch(path, init);
  if (response.headers.get('cf-mitigated') === 'challenge') {
    throw new AuthError('Cloudflare challenge, reload grok.com and retry');
  }
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(`Grok request rejected with ${response.status}`);
  }
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') ?? '30');
    throw new RateLimitError(Number.isFinite(retryAfter) ? retryAfter : 30);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Grok request to ${path} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchGrokMeta(conversationId: string): Promise<GrokConversationMeta> {
  return grokJson<GrokConversationMeta>(
    `/rest/app-chat/conversations/${encodeURIComponent(conversationId)}`,
  );
}

export async function fetchGrokResponses(conversationId: string): Promise<GrokResponse[]> {
  const listing = await grokJson<{ responses?: GrokResponse[] }>(
    `/rest/app-chat/conversations/${encodeURIComponent(conversationId)}/responses`,
  );
  const responses = listing.responses ?? [];
  if (responses.length === 0) return [];

  const loaded = await grokJson<{ responses?: GrokResponse[] }>(
    `/rest/app-chat/conversations/${encodeURIComponent(conversationId)}/load-responses`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responseIds: responses.map((entry) => entry.responseId) }),
    },
  );

  const byId = new Map((loaded.responses ?? []).map((entry) => [entry.responseId, entry]));
  return responses.map((entry) => ({ ...entry, ...(byId.get(entry.responseId) ?? {}) }));
}
