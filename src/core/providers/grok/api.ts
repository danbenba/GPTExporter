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
  text?: string;
  tags?: string[];
}

export interface GrokResponse {
  responseId: string;
  parentResponseId?: string;
  threadParentId?: string;
  message?: string;
  sender?: string;
  createTime?: string;
  partial?: boolean;
  isControl?: boolean;
  model?: string;
  thinkingTrace?: string;
  cardAttachmentsJson?: string[];
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

const PLACEHOLDER_PREFIXES = ['optimistic_', 'streaming_in_progress_'];
const LOAD_BATCH_SIZE = 40;

function isPlaceholder(responseId: string): boolean {
  return PLACEHOLDER_PREFIXES.some((prefix) => responseId.startsWith(prefix));
}

export function activeGrokBranch(responses: GrokResponse[]): GrokResponse[] {
  const main = responses.filter((entry) => !entry.threadParentId);
  if (main.length === 0) return [];

  const byId = new Map(main.map((entry) => [entry.responseId, entry]));
  const parents = new Set(main.map((entry) => entry.parentResponseId).filter(Boolean));
  const leaves = main.filter((entry) => !parents.has(entry.responseId));
  const leaf =
    leaves.sort((a, b) =>
      String(a.createTime ?? '').localeCompare(String(b.createTime ?? '')),
    )[leaves.length - 1] ?? main[main.length - 1];

  const branch: GrokResponse[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined = leaf.responseId;
  while (cursor && byId.has(cursor) && !seen.has(cursor)) {
    seen.add(cursor);
    const node: GrokResponse = byId.get(cursor)!;
    branch.push(node);
    cursor = node.parentResponseId || undefined;
  }

  branch.reverse();
  return branch;
}

export async function fetchGrokResponses(conversationId: string): Promise<GrokResponse[]> {
  const listing = await grokJson<{ responses?: GrokResponse[] }>(
    `/rest/app-chat/conversations/${encodeURIComponent(conversationId)}/responses`,
  );
  const listed = (listing.responses ?? []).filter((entry) => !isPlaceholder(entry.responseId));
  if (listed.length === 0) return [];

  const branch = activeGrokBranch(listed);
  const wanted = branch.length > 0 ? branch : listed;
  const missing = wanted.filter((entry) => !entry.message?.trim());

  if (missing.length > 0) {
    const hydrated = new Map<string, GrokResponse>();
    for (let index = 0; index < missing.length; index += LOAD_BATCH_SIZE) {
      const slice = missing.slice(index, index + LOAD_BATCH_SIZE);
      const loaded = await grokJson<{ responses?: GrokResponse[] }>(
        `/rest/app-chat/conversations/${encodeURIComponent(conversationId)}/load-responses`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responseIds: slice.map((entry) => entry.responseId) }),
        },
      );
      for (const entry of loaded.responses ?? []) hydrated.set(entry.responseId, entry);
    }
    return wanted.map((entry) => ({ ...entry, ...(hydrated.get(entry.responseId) ?? {}) }));
  }

  return wanted;
}
