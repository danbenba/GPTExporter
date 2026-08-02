import type {
  NormalizedBlock,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import type { GrokConversationMeta, GrokResponse } from './api';

function isAssistant(sender: string | undefined): boolean {
  return (sender ?? '').toLowerCase() !== 'human';
}

function toEpochSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed / 1000 : undefined;
}

function responseToMessage(response: GrokResponse): NormalizedMessage | null {
  if (response.isControl) return null;

  const blocks: NormalizedBlock[] = [];

  for (const step of response.steps ?? []) {
    const thought = (step.thinking ?? '').trim();
    if (thought) blocks.push({ kind: 'thought', text: thought, title: step.title });
  }

  const message = (response.message ?? '').trim();
  if (message) blocks.push({ kind: 'paragraph', text: message });

  for (const url of response.generatedImageUrls ?? []) {
    if (url) blocks.push({ kind: 'image', text: '', assetPointer: url });
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
    .filter((message): message is NormalizedMessage => message !== null);

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
