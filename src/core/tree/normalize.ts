import type {
  ApiConversationWithId,
  ConversationMessage,
  MessageContent,
  MultimodalPart,
} from '@/core/model/conversation';
import type {
  NormalizedBlock,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import { walkActiveBranch } from './branch';

const WRITING_PATTERN = /:::writing\{[^}]*\}([\s\S]*?)(?::::|$)/g;

function tidy(text: string): string {
  return text.replace(/^\s*:::\S*\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

function textToBlocks(text: string): NormalizedBlock[] {
  const blocks: NormalizedBlock[] = [];
  let lastIndex = 0;
  WRITING_PATTERN.lastIndex = 0;
  for (let match = WRITING_PATTERN.exec(text); match; match = WRITING_PATTERN.exec(text)) {
    const before = tidy(text.slice(lastIndex, match.index));
    if (before) blocks.push({ kind: 'paragraph', text: before });
    const inner = tidy(match[1]);
    if (inner) blocks.push({ kind: 'writing', text: inner });
    lastIndex = WRITING_PATTERN.lastIndex;
  }
  const rest = tidy(text.slice(lastIndex));
  if (rest) blocks.push({ kind: 'paragraph', text: rest });
  return blocks;
}

function partToBlocks(part: MultimodalPart): NormalizedBlock[] {
  if (typeof part === 'string') {
    return textToBlocks(part);
  }
  if (part.content_type === 'image_asset_pointer') {
    return [
      {
        kind: 'image',
        text: '',
        assetPointer: String(part.asset_pointer ?? ''),
        width: typeof part.width === 'number' ? part.width : undefined,
        height: typeof part.height === 'number' ? part.height : undefined,
      },
    ];
  }
  if (part.content_type === 'audio_transcription' && typeof part.text === 'string') {
    return [{ kind: 'paragraph', text: part.text }];
  }
  return [];
}

function contentToBlocks(content: MessageContent): NormalizedBlock[] {
  switch (content.content_type) {
    case 'text':
      return (content.parts ?? [])
        .filter((part): part is string => typeof part === 'string')
        .flatMap((part) => textToBlocks(part));
    case 'multimodal_text':
      return (content.parts ?? []).flatMap(partToBlocks);
    case 'code':
      return [{ kind: 'code', text: content.text ?? '', language: content.language }];
    case 'execution_output':
      return [{ kind: 'execution-output', text: content.text ?? '' }];
    case 'tether_quote':
      return [
        {
          kind: 'quote',
          text: content.text ?? '',
          url: content.url,
          title: content.title ?? content.domain,
        },
      ];
    case 'tether_browsing_display':
      return content.result ? [{ kind: 'quote', text: content.result }] : [];
    case 'system_error':
      return [{ kind: 'error', text: content.text ?? '', title: content.name }];
    case 'user_editable_context': {
      const chunks: string[] = [];
      if (content.user_profile) chunks.push(content.user_profile);
      if (content.user_instructions) chunks.push(content.user_instructions);
      return chunks.map((text) => ({ kind: 'context' as const, text }));
    }
    case 'thoughts':
      return (content.thoughts ?? [])
        .map((thought) => thought.content ?? thought.summary ?? '')
        .filter((text) => text.trim().length > 0)
        .map((text) => ({ kind: 'thought' as const, text }));
    case 'reasoning_recap':
      return content.content ? [{ kind: 'thought', text: content.content }] : [];
    default:
      return [];
  }
}

function normalizeMessage(message: ConversationMessage): NormalizedMessage | null {
  const blocks = contentToBlocks(message.content);
  if (blocks.length === 0) return null;

  const role = message.author.role;
  if (role === 'system' && message.content.content_type !== 'user_editable_context') {
    return null;
  }

  const citations = (message.metadata?.citations ?? [])
    .map((citation) => ({
      url: citation.metadata?.url,
      title: citation.metadata?.title,
    }))
    .filter((citation) => Boolean(citation.url));

  return {
    id: message.id,
    role,
    authorName: message.author.name ?? undefined,
    model: message.metadata?.model_slug ?? message.metadata?.default_model_slug,
    createTime: message.create_time ?? undefined,
    blocks,
    citations,
  };
}

export function normalizeConversation(
  conversation: ApiConversationWithId,
  url: string,
): NormalizedConversation {
  const messages = walkActiveBranch(conversation)
    .map(normalizeMessage)
    .filter((message): message is NormalizedMessage => message !== null);

  const model = [...messages].reverse().find((message) => message.model)?.model;

  return {
    id: conversation.id,
    title: conversation.title || 'ChatGPT conversation',
    url,
    createTime: conversation.create_time,
    updateTime: conversation.update_time,
    model,
    messages,
  };
}
