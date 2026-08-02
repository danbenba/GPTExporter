import type { NormalizedBlock, NormalizedConversation, NormalizedMessage } from '@/core/model/normalized';
import { claudeGet, getOrganizationId } from './api';

const SESSION_HEADERS_BETA = 'ccr-byoc-2025-07-29';
const MAX_PAGES = 100;
const PAGE_SIZE = 500;

export const SESSION_ID_PATTERN = /^(?:session_|cse_)(?:staging_)?[A-Za-z0-9]{1,64}$/;
const CODE_PATH = /^\/code\/((?:session|cse)_(?:staging_)?[A-Za-z0-9]{1,64})(?:[/?#]|$)/;
const COWORK_RESERVED = new Set(['agent', 'tasks', 'project', 'projects', 'scheduled', 'new']);

export function sessionIdFromPath(pathname: string): string | null {
  const code = pathname.match(CODE_PATH)?.[1];
  if (code) return canonicalSessionId(code);

  if (pathname.startsWith('/cowork/')) {
    const segment = pathname.slice('/cowork/'.length).split(/[/?#]/)[0];
    if (!segment || COWORK_RESERVED.has(segment)) return null;
    if (!SESSION_ID_PATTERN.test(segment)) return null;
    return canonicalSessionId(segment);
  }
  return null;
}

export function canonicalSessionId(id: string): string {
  return id.replace(/^session_/, 'cse_');
}

interface SessionMeta {
  id?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  last_event_at?: string;
  config?: { model?: string };
}

interface SessionContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: unknown;
  is_error?: boolean;
}

interface SessionPayload {
  uuid?: string;
  type?: string;
  subtype?: string;
  parent_tool_use_id?: string | null;
  timestamp?: string;
  isMeta?: boolean;
  isSynthetic?: boolean;
  isVisibleInTranscriptOnly?: boolean;
  message?: {
    role?: string;
    model?: string;
    content?: string | SessionContentBlock[];
  };
}

interface EventsPage {
  data?: Array<{ event_id?: string; created_at?: string; payload?: SessionPayload }>;
  next_cursor?: string | null;
}

const SKIPPED_TYPES = new Set([
  'stream_event',
  'env_manager_log',
  'tool_use_summary',
  'rate_limit_event',
  'prompt_suggestion',
  'control_request',
  'control_response',
]);

async function sessionHeaders(): Promise<Record<string, string>> {
  return {
    'anthropic-version': '2023-06-01',
    'anthropic-beta': SESSION_HEADERS_BETA,
    'anthropic-client-feature': 'ccr',
    'x-organization-uuid': await getOrganizationId(),
  };
}

export async function fetchSessionMeta(sessionId: string): Promise<SessionMeta> {
  const headers = await sessionHeaders();
  const body = await claudeGet<{ session?: SessionMeta; response_shape?: SessionMeta }>(
    `/v1/code/sessions/${encodeURIComponent(sessionId)}`,
    headers,
  );
  return body.session ?? body.response_shape ?? {};
}

export async function fetchSessionEvents(sessionId: string): Promise<SessionPayload[]> {
  const headers = await sessionHeaders();
  const payloads: SessionPayload[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), sort_order: 'asc' });
    if (cursor) params.set('cursor', cursor);
    const body = await claudeGet<EventsPage>(
      `/v1/code/sessions/${encodeURIComponent(sessionId)}/events?${params.toString()}`,
      headers,
    );
    for (const entry of body.data ?? []) {
      if (entry.payload) payloads.push({ ...entry.payload, timestamp: entry.payload.timestamp ?? entry.created_at });
    }
    const next = body.next_cursor ?? undefined;
    if (!next || next === cursor) break;
    cursor = next;
  }
  return payloads;
}

function stringifyToolContent(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map((entry) =>
        entry && typeof entry === 'object' && 'text' in entry
          ? String((entry as { text?: string }).text ?? '')
          : '',
      )
      .filter(Boolean)
      .join('\n');
  }
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function blocksFromPayload(payload: SessionPayload, includeTools: boolean): NormalizedBlock[] {
  const content = payload.message?.content;
  if (typeof content === 'string') {
    const text = content.trim();
    return text ? [{ kind: 'paragraph', text }] : [];
  }
  if (!Array.isArray(content)) return [];

  const blocks: NormalizedBlock[] = [];
  for (const block of content) {
    if (block.type === 'text' && block.text?.trim()) {
      blocks.push({ kind: 'paragraph', text: block.text.trim() });
    } else if (block.type === 'thinking' && block.thinking?.trim()) {
      blocks.push({ kind: 'thought', text: block.thinking.trim() });
    } else if (block.type === 'tool_use' && includeTools) {
      const payloadText = stringifyToolContent(block.input);
      if (payloadText.trim()) {
        blocks.push({ kind: 'code', text: payloadText, language: 'json', title: block.name });
      }
    } else if (block.type === 'tool_result' && includeTools) {
      const resultText = stringifyToolContent(block.content);
      if (resultText.trim()) {
        blocks.push(
          block.is_error
            ? { kind: 'error', text: resultText, title: block.name }
            : { kind: 'execution-output', text: resultText },
        );
      }
    }
  }
  return blocks;
}

function isRenderable(payload: SessionPayload): boolean {
  if (!payload.type || SKIPPED_TYPES.has(payload.type)) return false;
  if (payload.isMeta || payload.isSynthetic || payload.isVisibleInTranscriptOnly) return false;
  if (payload.parent_tool_use_id) return false;
  return payload.type === 'user' || payload.type === 'assistant';
}

export function normalizeSession(
  meta: SessionMeta,
  payloads: SessionPayload[],
  url: string,
  sessionId: string,
): NormalizedConversation {
  const seen = new Set<string>();
  const messages: NormalizedMessage[] = [];

  for (const payload of payloads) {
    if (payload.uuid) {
      if (seen.has(payload.uuid)) continue;
      seen.add(payload.uuid);
    }
    if (!isRenderable(payload)) continue;

    const blocks = blocksFromPayload(payload, true);
    if (blocks.length === 0) continue;

    messages.push({
      id: payload.uuid ?? `${messages.length}`,
      role: payload.type === 'user' ? 'user' : 'assistant',
      model: payload.message?.model,
      createTime: payload.timestamp ? Date.parse(payload.timestamp) / 1000 : undefined,
      blocks,
      citations: [],
    });
  }

  return {
    id: meta.id ?? sessionId,
    title: meta.title || 'Claude session',
    url,
    source: 'claude',
    createTime: meta.created_at ? Date.parse(meta.created_at) / 1000 : undefined,
    updateTime: meta.last_event_at
      ? Date.parse(meta.last_event_at) / 1000
      : meta.updated_at
        ? Date.parse(meta.updated_at) / 1000
        : undefined,
    model: meta.config?.model,
    messages,
  };
}
