import type {
  NormalizedBlock,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import type { GrokConversationMeta, GrokResponse } from './api';

function isAssistant(sender: string | undefined): boolean {
  const value = (sender ?? '').toLowerCase();
  return value !== 'human' && value !== 'user';
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stripToolSentinels(text: string): string {
  return text.replace(/<xai:tool_usage_card>[\s\S]*?<\/xai:tool_usage_card>/g, '').trim();
}

function cardImageUrls(cards: string[] | undefined): string[] {
  const urls: string[] = [];
  for (const raw of cards ?? []) {
    try {
      const card = JSON.parse(raw) as {
        image_chunk?: { imageUrl?: string; progress?: number; moderated?: boolean };
      };
      const chunk = card.image_chunk;
      if (chunk?.imageUrl && chunk.progress === 100 && !chunk.moderated) {
        urls.push(chunk.imageUrl);
      }
    } catch {
      continue;
    }
  }
  return urls;
}

function toEpochSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed / 1000 : undefined;
}

function responseToMessage(response: GrokResponse): NormalizedMessage | null {
  if (response.isControl) return null;

  const blocks: NormalizedBlock[] = [];

  const trace = asString(response.thinkingTrace);
  if (trace) blocks.push({ kind: 'thought', text: trace });

  for (const step of response.steps ?? []) {
    const thought = asString(step.thinking) || asString(step.text);
    if (thought) {
      blocks.push({ kind: 'thought', text: stripToolSentinels(thought), title: asString(step.title) || undefined });
    }
  }

  const message = asString(response.message);
  if (message) blocks.push({ kind: 'paragraph', text: message });

  for (const url of response.generatedImageUrls ?? []) {
    if (url) blocks.push({ kind: 'image', text: '', assetPointer: url });
  }
  for (const url of cardImageUrls(response.cardAttachmentsJson)) {
    blocks.push({ kind: 'image', text: '', assetPointer: url });
  }
  for (const attachment of response.imageAttachments ?? []) {
    const pointer = attachment.url ?? attachment.fileUri;
    if (pointer) blocks.push({ kind: 'image', text: '', assetPointer: pointer });
  }
  for (const file of response.fileAttachments ?? []) {
    if (file.fileName) {
      blocks.push({ kind: 'context', text: file.fileName, title: file.fileName, url: file.fileUri });
    }
  }

  if (blocks.length === 0) return null;

  const sources = response.citedWebSearchResults?.length
    ? response.citedWebSearchResults
    : (response.webSearchResults ?? []);
  const citations = sources
    .map((result) => ({ url: result.url, title: result.title ?? result.siteName }))
    .filter((citation) => Boolean(citation.url));

  return {
    id: response.responseId,
    role: isAssistant(response.sender) ? 'assistant' : 'user',
    model: response.model,
    createTime: toEpochSeconds(response.createTime),
    blocks,
    citations,
  };
}

export function normalizeGrokConversation(
  meta: GrokConversationMeta,
  responses: GrokResponse[],
  url: string,
): NormalizedConversation {
  const messages = responses
    .map(responseToMessage)
    .filter((message): message is NormalizedMessage => message !== null)
    .sort((a, b) => (a.createTime ?? 0) - (b.createTime ?? 0));

  const model = [...messages].reverse().find((message) => message.model)?.model;

  return {
    id: meta.conversationId,
    title: meta.title || 'Grok conversation',
    url,
    source: 'grok',
    createTime: toEpochSeconds(meta.createTime),
    updateTime: toEpochSeconds(meta.modifyTime),
    model,
    messages,
  };
}
