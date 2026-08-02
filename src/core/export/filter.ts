import type { ExportOptions } from '@/core/model/export-options';
import type { NormalizedConversation, NormalizedMessage } from '@/core/model/normalized';

function filterMessage(message: NormalizedMessage, options: ExportOptions): NormalizedMessage | null {
  if (message.role === 'user' && !options.includeUserMessages) return null;
  if (message.role === 'assistant' && !options.includeAssistantMessages) return null;
  if (message.role === 'tool' && !options.includeToolBlocks) return null;

  const blocks = message.blocks.filter((block) => {
    if (block.kind === 'thought') return options.includeThoughts;
    if (block.kind === 'execution-output') return options.includeToolBlocks;
    return true;
  });
  if (blocks.length === 0) return null;

  return {
    ...message,
    blocks,
    citations: options.includeCitations ? message.citations : [],
  };
}

export function applyExportOptions(
  conversation: NormalizedConversation,
  options: ExportOptions,
): NormalizedConversation {
  let messages = conversation.messages
    .map((message) => filterMessage(message, options))
    .filter((message): message is NormalizedMessage => message !== null);

  if (options.messageLimit && options.messageLimit > 0) {
    messages = messages.slice(-options.messageLimit);
  }

  return { ...conversation, messages };
}
