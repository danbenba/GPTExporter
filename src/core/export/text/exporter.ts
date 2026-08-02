import { buildFilename } from '@/core/export/filename';
import { formatDateTime, modelDisplayName, roleLabel } from '@/core/export/render-utils';
import type { ExportArtifact, ExportInput, Exporter } from '@/core/export/types';
import { messages, type Locale } from '@/i18n/messages';

export const textExporter: Exporter = {
  format: 'text',
  async build({ conversation, options, locale }: ExportInput): Promise<ExportArtifact> {
    const dict = messages[locale as Locale];
    const lines: string[] = [conversation.title, '='.repeat(conversation.title.length), ''];

    if (options.includeMetadataHeader) {
      lines.push(`${dict.conversationLink} : ${conversation.url}`);
      if (conversation.model) lines.push(`${dict.model} : ${modelDisplayName(conversation.model)}`);
      if (conversation.createTime) {
        lines.push(`${dict.createdAt} : ${formatDateTime(conversation.createTime, locale as Locale)}`);
      }
      lines.push('');
    }

    for (const message of conversation.messages) {
      const time = options.includeTimestamps
        ? ` (${formatDateTime(message.createTime, locale as Locale)})`
        : '';
      lines.push(`${roleLabel(message, locale as Locale)}${time} :`);
      for (const block of message.blocks) {
        if (block.kind === 'image') {
          lines.push(`[${dict.image}]`);
        } else if (block.kind === 'thought') {
          lines.push(`[${dict.reasoning}] ${block.text}`);
        } else {
          lines.push(block.text);
        }
      }
      if (message.citations.length > 0) {
        lines.push(`${dict.sources} :`);
        for (const citation of message.citations) {
          lines.push(`- ${citation.title ? `${citation.title} — ` : ''}${citation.url}`);
        }
      }
      lines.push('', '----------------------------------------', '');
    }

    lines.push(dict.exportedWith);

    return {
      kind: 'download',
      filename: buildFilename(conversation.title, 'txt'),
      mime: 'text/plain',
      content: lines.join('\n'),
    };
  },
};
