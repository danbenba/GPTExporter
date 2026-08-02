import { ApiError, AuthError, RateLimitError } from '@/core/api/errors';

const API_VERSION = '2.18';
const PAGE_FIRST = 10;
const PAGE_REST = 100;
const HARD_CAP = 1010;

const BLOCK_USE_CASES = [
  'answer_modes',
  'media_items',
  'knowledge_cards',
  'inline_entity_cards',
  'inline_images',
  'inline_assets',
  'diff_blocks',
  'inline_knowledge_cards',
  'refinement_filters',
  'preserve_latex',
  'in_context_suggestions',
  'pending_followups',
  'inline_claims',
  'unified_assets',
  'workflow_steps',
  'navigation_results',
  'background_agents',
];

export interface PerplexityWebResult {
  name?: string;
  url?: string;
  snippet?: string;
  web_result?: PerplexityWebResult;
  meta_data?: { domain_name?: string; published_date?: string };
}

export interface PerplexityBlock {
  intended_usage?: string;
  markdown_block?: { answer?: string };
  sources_mode_block?: {
    web_results?: PerplexityWebResult[];
    rows?: Array<{ web_result?: PerplexityWebResult; citation?: number }>;
  };
  web_result_block?: { web_results?: PerplexityWebResult[] };
  media_block?: { media_items?: Array<Record<string, unknown>> };
  image_mode_block?: { media_items?: Array<Record<string, unknown>> };
  plan_block?: {
    goals?: Array<{ description?: string }>;
    steps?: Array<Record<string, unknown> & { uuid?: string; step_type?: string }>;
  };
}

export interface PerplexityEntry {
  backend_uuid?: string;
  context_uuid?: string;
  query_str?: string;
  thread_title?: string;
  thread_url_slug?: string;
  display_model?: string;
  mode?: string;
  updated_datetime?: string;
  text?: string;
  blocks?: PerplexityBlock[];
}

export interface PerplexityThread {
  entries: PerplexityEntry[];
  title?: string;
}

function buildQuery(limit: number, cursor: string | null): string {
  const params = new URLSearchParams({
    with_parent_info: 'true',
    with_schematized_response: 'true',
    version: API_VERSION,
    source: 'default',
    limit: String(limit),
    offset: '0',
    from_first: 'true',
  });
  for (const useCase of BLOCK_USE_CASES) params.append('supported_block_use_cases', useCase);
  if (cursor) params.set('cursor', cursor);
  return params.toString();
}

async function threadPage(
  idOrSlug: string,
  limit: number,
  cursor: string | null,
): Promise<{
  entries?: PerplexityEntry[];
  next_cursor?: string | null;
  status?: string;
  thread_metadata?: { title?: string };
}> {
  const response = await fetch(`/rest/thread/${encodeURIComponent(idOrSlug)}?${buildQuery(limit, cursor)}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-App-ApiClient': 'default',
      'X-App-ApiVersion': API_VERSION,
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (
    response.status === 403 &&
    (response.headers.get('cf-mitigated') === 'challenge' || contentType.startsWith('text/html'))
  ) {
    throw new AuthError('Cloudflare challenge, reload perplexity.ai and retry');
  }
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(`Perplexity rejected the request with ${response.status}`);
  }
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') ?? '30');
    throw new RateLimitError(Number.isFinite(retryAfter) ? retryAfter : 30);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Perplexity thread request failed with ${response.status}`);
  }
  return response.json();
}

export async function fetchPerplexityThread(idOrSlug: string): Promise<PerplexityThread> {
  const entries: PerplexityEntry[] = [];
  let cursor: string | null = null;
  let first = true;
  let title: string | undefined;

  for (;;) {
    const page = await threadPage(idOrSlug, first ? PAGE_FIRST : PAGE_REST, cursor);
    const pageEntries = page.entries ?? [];
    if (pageEntries.length === 0) break;

    if (first && page.thread_metadata?.title) title = page.thread_metadata.title;
    entries.push(...pageEntries);

    const next = page.next_cursor ?? null;
    if (!next || next === cursor || entries.length >= HARD_CAP) break;
    cursor = next;
    first = false;
  }

  return { entries, title };
}
