import { buildFilename } from '@/core/export/filename';
import { formatDateTime, modelDisplayName, roleLabel } from '@/core/export/render-utils';
import type { ExportArtifact, ExportInput, Exporter } from '@/core/export/types';
import type { NormalizedBlock } from '@/core/model/normalized';
import { EXPORT_CREDIT_TEXT, EXPORT_CREDIT_URL } from '@/shared/constants';
import { messages, type Locale } from '@/i18n/messages';

function blockToMarkdown(block: NormalizedBlock, assets: Record<string, string>, locale: Locale): string {
  const dict = messages[locale];
  switch (block.kind) {
    case 'code':
      return `\`\`\`${block.language ?? ''}\n${block.text}\n\`\`\``;
    case 'execution-output':
      return `\`\`\`\n${block.text}\n\`\`\``;
    case 'quote': {
      const source = block.url ? `\n> — [${block.title ?? block.url}](${block.url})` : '';
      return `${block.text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')}${source}`;
    }
    case 'image': {
      const src = block.assetPointer ? assets[block.assetPointer] : undefined;
      return src ? `![${dict.image}](${src})` : `*[${dict.image}]*`;
    }
    case 'writing':
      return `> ✏️ **${dict.writingLabel}**\n>\n${block.text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')}`;
    case 'thought':
      return `> *${dict.reasoning}* : ${block.text.replace(/\n/g, '\n> ')}`;
    case 'error':
      return `> ⚠️ ${block.title ? `**${block.title}** — ` : ''}${block.text}`;
    case 'context':
      return `> *${dict.customInstructions}* : ${block.text.replace(/\n/g, '\n> ')}`;
    default:
      return block.text;
  }
}

export const markdownExporter: Exporter = {
  format: 'markdown',
  async build({ conversation, options, assets, locale }: ExportInput): Promise<ExportArtifact> {
    const dict = messages[locale as Locale];
    const lines: string[] = [`# ${conversation.title}`, ''];

    if (options.includeMetadataHeader) {
      lines.push(`> ${dict.conversationLink} : ${conversation.url}`);
      if (conversation.model) {
        lines.push(`> ${dict.model} : ${modelDisplayName(conversation.model)}`);
      }
      if (conversation.createTime) {
        lines.push(`> ${dict.createdAt} : ${formatDateTime(conversation.createTime, locale as Locale)}`);
      }
      if (conversation.updateTime) {
        lines.push(`> ${dict.updatedAt} : ${formatDateTime(conversation.updateTime, locale as Locale)}`);
      }
      lines.push(`> ${dict.messagesLabel} : ${conversation.messages.length}`, '');
    }

    for (const message of conversation.messages) {
      const heading = roleLabel(message, locale as Locale);
      const time = options.includeTimestamps
        ? ` — ${formatDateTime(message.createTime, locale as Locale)}`
        : '';
      lines.push(`## ${heading}${time}`, '');
      for (const block of message.blocks) {
        lines.push(blockToMarkdown(block, assets, locale as Locale), '');
      }
      if (message.citations.length > 0) {
        lines.push(`**${dict.sources}**`, '');
        for (const citation of message.citations) {
          lines.push(`- [${citation.title ?? citation.url}](${citation.url})`);
        }
        lines.push('');
      }
    }

    lines.push('---', '', `*${EXPORT_CREDIT_TEXT} — [danbenba.dev](${EXPORT_CREDIT_URL})*`);

    return {
      kind: 'download',
      filename: buildFilename(conversation.title, 'md'),
      mime: 'text/markdown',
      content: lines.join('\n'),
    };
  },
};
