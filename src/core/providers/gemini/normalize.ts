import type {
  NormalizedBlock,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import type { GeminiTurn } from './rpc';

const ARTIFACT_URL = /https?:\/\/googleusercontent\.com\/\w+\/\d+\n*/g;

function at(node: unknown, path: number[]): unknown {
  let current: unknown = node;
  for (const index of path) {
    if (!Array.isArray(current)) return undefined;
    current = current[index];
  }
  return current;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
  '#x27': "'",
  '#x2F': '/',
};

function unescapeHtml(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    const named = NAMED_ENTITIES[entity];
    if (named) return named;
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return match;
  });
}

function clean(value: string): string {
  return unescapeHtml(value).replace(ARTIFACT_URL, '').trim();
}

function deepestText(node: unknown, depth = 0, best = { text: '' }): string {
  if (depth > 7) return best.text;
  if (typeof node === 'string') {
    if (node.length > best.text.length && !node.startsWith('http')) best.text = node;
    return best.text;
  }
  if (Array.isArray(node)) {
    for (const child of node) deepestText(child, depth + 1, best);
  }
  return best.text;
}

function candidateOf(turn: GeminiTurn): unknown {
  return at(turn, [3, 0, 0]) ?? at(turn, [3, 0]);
}

function collectImageUrls(candidate: unknown): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const walk = (node: unknown, depth: number): void => {
    if (depth > 9 || urls.length > 12) return;
    if (typeof node === 'string') {
      if (/^https?:\/\//.test(node) && !/googleusercontent\.com\/(image_generation|card)_content/.test(node)) {
        if (!seen.has(node)) {
          seen.add(node);
          urls.push(node);
        }
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const child of node) walk(child, depth + 1);
    }
  };

  walk(at(candidate, [12, 7]), 0);
  walk(at(candidate, [12, 1]), 0);
  return urls;
}

export function turnToMessages(turn: GeminiTurn, index: number): NormalizedMessage[] {
  const messages: NormalizedMessage[] = [];
  const requestId = asText(at(turn, [0, 1])) || `turn-${index}`;
  const created = at(turn, [4, 0]);
  const createTime = typeof created === 'number' ? created : undefined;

  const prompt = clean(asText(at(turn, [2, 0, 0])));
  if (prompt) {
    messages.push({
      id: `${requestId}-user`,
      role: 'user',
      createTime,
      blocks: [{ kind: 'paragraph', text: prompt }],
      citations: [],
    });
  }

  const candidate = candidateOf(turn);
  if (candidate) {
    const blocks: NormalizedBlock[] = [];

    const thoughts = clean(asText(at(candidate, [37, 0, 0])));
    if (thoughts) blocks.push({ kind: 'thought', text: thoughts });

    let answer = clean(asText(at(candidate, [1, 0])));
    if (!answer) answer = clean(asText(at(candidate, [22, 0])));
    if (!answer) answer = clean(deepestText(at(candidate, [1])));
    if (answer) blocks.push({ kind: 'paragraph', text: answer });

    for (const url of collectImageUrls(candidate)) {
      blocks.push({ kind: 'image', text: '', assetPointer: url });
    }

    if (blocks.length > 0) {
      messages.push({
        id: `${requestId}-model`,
        role: 'assistant',
        createTime,
        blocks,
        citations: [],
      });
    }
  }

  return messages;
}

export function normalizeGeminiConversation(
  turns: GeminiTurn[],
  conversationId: string,
  title: string,
  url: string,
): NormalizedConversation {
  const chronological = [...turns].reverse();
  const messages = chronological.flatMap((turn, index) => turnToMessages(turn, index));
  const createTime = messages[0]?.createTime;
  const updateTime = messages[messages.length - 1]?.createTime;

  return {
    id: conversationId,
    title: title || 'Gemini conversation',
    url,
    source: 'gemini',
    createTime,
    updateTime,
    messages,
  };
}
