import type {
  NormalizedBlock,
  NormalizedConversation,
  NormalizedMessage,
} from '@/core/model/normalized';
import {
  CLAUDE_ROOT_PARENT,
  type ClaudeContentBlock,
  type ClaudeConversation,
  type ClaudeFile,
  type ClaudeMessage,
} from './model';
import {
  applyArtifactCommand,
  ARTIFACT_TOOLS,
  extractLegacyArtifacts,
  isCodeArtifact,
  stripLegacyArtifactTags,
  type ArtifactState,
} from './artifacts';

export function walkClaudeBranch(conversation: ClaudeConversation): ClaudeMessage[] {
  const all = conversation.chat_messages ?? [];
  const byUuid = new Map(all.map((message) => [message.uuid, message]));
  const ordered: ClaudeMessage[] = [];
  const seen = new Set<string>();

  let cursor: string | null | undefined = conversation.current_leaf_message_uuid;
  if (!cursor || !byUuid.has(cursor)) {
    cursor = all[all.length - 1]?.uuid;
  }
  while (cursor && cursor !== CLAUDE_ROOT_PARENT && byUuid.has(cursor) && !seen.has(cursor)) {
    seen.add(cursor);
    const message: ClaudeMessage = byUuid.get(cursor)!;
    ordered.push(message);
    cursor = message.parent_message_uuid ?? null;
  }

  if (ordered.length === 0) {
    return [...all].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }
  ordered.reverse();
  return ordered;
}

function fileUrl(file: ClaudeFile): string | null {
  return (
    file.preview_asset?.url ??
    file.preview_url ??
    file.document_asset?.url ??
    file.document_url ??
    file.thumbnail_asset?.url ??
    file.thumbnail_url ??
    file.original_url ??
    file.url ??
    null
  );
}

function mergeFiles(message: ClaudeMessage): ClaudeFile[] {
  const merged = new Map<string, ClaudeFile>();
  for (const file of [...(message.files_v2 ?? []), ...(message.files ?? [])]) {
    const key = file.file_uuid ?? file.uuid ?? file.id;
    if (!key) continue;
    const existing = merged.get(key);
    if (!existing || (!fileUrl(existing) && fileUrl(file))) merged.set(key, file);
  }
  return [...merged.values()];
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

function blockToNormalized(
  block: ClaudeContentBlock,
  artifacts: Map<string, ArtifactState>,
): NormalizedBlock[] {
  switch (block.type) {
    case 'text': {
      const raw = block.text ?? '';
      const legacy = extractLegacyArtifacts(raw);
      const text = legacy.length > 0 ? stripLegacyArtifactTags(raw) : raw.trim();
      const blocks: NormalizedBlock[] = text ? [{ kind: 'paragraph', text }] : [];
      for (const artifact of legacy) {
        blocks.push(
          isCodeArtifact(artifact)
            ? { kind: 'code', text: artifact.text, language: artifact.language, title: artifact.title }
            : { kind: 'writing', text: artifact.text, title: artifact.title },
        );
      }
      return blocks;
    }
    case 'thinking': {
      const summary = (block.summaries ?? [])
        .map((entry) => (entry.summary ?? '').trim())
        .filter(Boolean)
        .join(' — ');
      const detail = block.hidden || block.thinking_hidden ? '' : (block.thinking ?? '').trim();

      if (!detail && !summary) return [];
      const text = detail || summary;
      const title = summary && summary !== text ? summary : undefined;
      return [{ kind: 'thought', text, title }];
    }
    case 'tool_use': {
      if (block.name && ARTIFACT_TOOLS.has(block.name)) {
        const previousId =
          (typeof block.input?.id === 'string' && block.input.id) ||
          (typeof block.input?.path === 'string' && block.input.path) ||
          '';
        const state = applyArtifactCommand(block, artifacts.get(previousId));
        if (!state) return [];
        artifacts.set(state.id, state);
        if (!state.text.trim()) return [];
        return [
          isCodeArtifact(state)
            ? { kind: 'code', text: state.text, language: state.language, title: state.title }
            : { kind: 'writing', text: state.text, title: state.title },
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

function messageToNormalized(
  message: ClaudeMessage,
  artifacts: Map<string, ArtifactState>,
): NormalizedMessage | null {
  const blocks: NormalizedBlock[] = [];

  for (const attachment of message.attachments ?? []) {
    const text = (attachment.extracted_content ?? '').trim();
    if (text) {
      blocks.push({ kind: 'context', text, title: attachment.file_name });
    }
  }

  for (const file of mergeFiles(message)) {
    const url = fileUrl(file);
    if (!url) continue;
    if (file.file_kind && file.file_kind !== 'image') {
      blocks.push({ kind: 'context', text: file.file_name ?? url, title: file.file_name, url });
      continue;
    }
    blocks.push({
      kind: 'image',
      text: '',
      assetPointer: url,
      width: file.preview_asset?.image_width ?? file.thumbnail_asset?.image_width,
      height: file.preview_asset?.image_height ?? file.thumbnail_asset?.image_height,
    });
  }

  if (message.content?.length) {
    for (const block of message.content) blocks.push(...blockToNormalized(block, artifacts));
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
  const artifacts = new Map<string, ArtifactState>();
  const messages = walkClaudeBranch(conversation)
    .map((message) => messageToNormalized(message, artifacts))
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
