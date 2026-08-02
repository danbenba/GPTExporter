import type {
  NormalizedBlock,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import {
  CLAUDE_ROOT_PARENT,
  type ClaudeContentBlock,
  type ClaudeConversation,
  type ClaudeMessage,
} from './model';

export function walkClaudeBranch(conversation: ClaudeConversation): ClaudeMessage[] {
  const byUuid = new Map(conversation.chat_messages.map((message) => [message.uuid, message]));
  const ordered: ClaudeMessage[] = [];
  const seen = new Set<string>();

  let cursor: string | null | undefined = conversation.current_leaf_message_uuid;
  while (cursor && cursor !== CLAUDE_ROOT_PARENT && byUuid.has(cursor) && !seen.has(cursor)) {
    seen.add(cursor);
    const message = byUuid.get(cursor)!;
    ordered.push(message);
    cursor = message.parent_message_uuid;
  }

  if (ordered.length === 0) {
    return [...conversation.chat_messages].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }
  ordered.reverse();
  return ordered;
}

function toolLabel(name: string | undefined): string {
  if (!name) return 'tool';
  return name.replace(/[_:]/g, ' ').trim();
}

function stringifyToolPayload(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function blockToNormalized(block: ClaudeContentBlock): NormalizedBlock[] {
  switch (block.type) {
    case 'text': {
      const text = (block.text ?? '').trim();
      return text ? [{ kind: 'paragraph', text }] : [];
    }
    case 'thinking': {
      if (block.hidden || block.thinking_hidden) return [];
      const text = (block.thinking ?? '').trim();
      return text ? [{ kind: 'thought', text }] : [];
    }
    case 'tool_use': {
      if (block.name === 'artifacts') {
        const input = block.input ?? {};
        const content = typeof input.content === 'string' ? input.content : '';
        if (!content.trim()) return [];
        const language = typeof input.language === 'string' ? input.language : undefined;
        const title = typeof input.title === 'string' ? input.title : undefined;
        const isCode = typeof input.type === 'string' && input.type.includes('code');
        return [
          isCode || language
            ? { kind: 'code', text: content, language, title }
            : { kind: 'writing', text: content, title },
        ];
      }
      const payload = stringifyToolPayload(block.input);
      return payload
        ? [{ kind: 'code', text: payload, language: 'json', title: toolLabel(block.name) }]
        : [];
    }
    case 'tool_result': {
      const payload = stringifyToolPayload(block.content);
      if (!payload.trim()) return [];
      return [
        block.is_error
          ? { kind: 'error', text: payload, title: toolLabel(block.name) }
          : { kind: 'execution-output', text: payload },
      ];
    }
    default:
      return [];
  }
}

function messageToNormalized(message: ClaudeMessage): NormalizedMessage | null {
  const blocks: NormalizedBlock[] = [];

  for (const attachment of message.attachments ?? []) {
    const text = (attachment.extracted_content ?? '').trim();
    if (text) {
      blocks.push({ kind: 'context', text, title: attachment.file_name });
    }
  }

  for (const file of message.files ?? []) {
    const url = file.preview_asset?.url ?? file.preview_url ?? file.thumbnail_url;
    if (url) {
      blocks.push({
        kind: 'image',
        text: '',
        assetPointer: url,
        width: file.preview_asset?.image_width,
        height: file.preview_asset?.image_height,
      });
    }
  }

  if (message.content?.length) {
    for (const block of message.content) blocks.push(...blockToNormalized(block));
  } else if (message.text?.trim()) {
    blocks.push({ kind: 'paragraph', text: message.text.trim() });
  }

  if (blocks.length === 0) return null;

  const citations = (message.content ?? [])
    .flatMap((block) => (block.type === 'text' ? (block.citations ?? []) : []))
    .map((citation) => ({
      url: typeof citation.url === 'string' ? citation.url : undefined,
      title: typeof citation.title === 'string' ? citation.title : undefined,
    }))
    .filter((citation) => Boolean(citation.url));

  return {
    id: message.uuid,
    role: message.sender === 'human' ? 'user' : 'assistant',
    createTime: message.created_at ? Date.parse(message.created_at) / 1000 : undefined,
    blocks,
    citations,
  };
}

export function normalizeClaudeConversation(
  conversation: ClaudeConversation,
  url: string,
): NormalizedConversation {
  const messages = walkClaudeBranch(conversation)
    .map(messageToNormalized)
    .filter((message): message is NormalizedMessage => message !== null);

  return {
    id: conversation.uuid,
    title: conversation.name || 'Claude conversation',
    url,
    createTime: conversation.created_at ? Date.parse(conversation.created_at) / 1000 : undefined,
    updateTime: conversation.updated_at ? Date.parse(conversation.updated_at) / 1000 : undefined,
    model: conversation.model ?? undefined,
    messages,
  };
}
