import { buildFilename } from '@/core/export/filename';
import { formatDateTime, modelDisplayName, roleLabel } from '@/core/export/render-utils';
import type { AssetMap, ExportArtifact, ExportInput, Exporter } from '@/core/export/types';
import type { NormalizedBlock, NormalizedConversation, NormalizedMessage } from '@/core/model/normalized';
import type { ExportOptions } from '@/core/model/export-options';
import { messages, type Locale } from '@/i18n/messages';
import { escapeHtml, renderMarkdown } from './mini-markdown';
import { renderHtmlPage } from './template';

function blockToHtml(block: NormalizedBlock, assets: AssetMap, locale: Locale): string {
  const dict = messages[locale];
  switch (block.kind) {
    case 'code':
      return `<pre class="codeblock"><div class="codeblock-head">${escapeHtml(block.language ?? '')}</div><code>${escapeHtml(block.text)}</code></pre>`;
    case 'execution-output':
      return `<pre class="codeblock"><div class="codeblock-head">stdout</div><code>${escapeHtml(block.text)}</code></pre>`;
    case 'quote': {
      const source = block.url
        ? `<div><a href="${escapeHtml(block.url)}" target="_blank" rel="noopener">${escapeHtml(block.title ?? block.url)}</a></div>`
        : '';
      return `<blockquote>${escapeHtml(block.text)}${source}</blockquote>`;
    }
    case 'image': {
      const src = block.assetPointer ? assets[block.assetPointer] : undefined;
      return src
        ? `<img class="chat-image" src="${escapeHtml(src)}" alt="${dict.image}">`
        : `<p><em>[${dict.image}]</em></p>`;
    }
    case 'thought':
      return `<details class="thought"><summary>${dict.reasoning}</summary>${renderMarkdown(block.text)}</details>`;
    case 'error':
      return `<blockquote>⚠️ ${block.title ? `<strong>${escapeHtml(block.title)}</strong> — ` : ''}${escapeHtml(block.text)}</blockquote>`;
    case 'context':
      return `<details class="thought"><summary>${dict.customInstructions}</summary>${renderMarkdown(block.text)}</details>`;
    default:
      return renderMarkdown(block.text);
  }
}

function messageToHtml(
  message: NormalizedMessage,
  options: ExportOptions,
  assets: AssetMap,
  locale: Locale,
): string {
  const dict = messages[locale];
  const label = roleLabel(message, locale);
  const time = options.includeTimestamps
    ? ` <span class="timestamp">· ${formatDateTime(message.createTime, locale)}</span>`
    : '';

  const citations =
    message.citations.length > 0
      ? `<div class="sources">${dict.sources}<ul>${message.citations
          .map(
            (citation) =>
              `<li><a href="${escapeHtml(citation.url ?? '')}" target="_blank" rel="noopener">${escapeHtml(citation.title ?? citation.url ?? '')}</a></li>`,
          )
          .join('')}</ul></div>`
      : '';

  if (message.role === 'user') {
    const text = message.blocks
      .map((block) =>
        block.kind === 'image'
          ? blockToHtml(block, assets, locale)
          : escapeHtml(block.text),
      )
      .join('\n');
    return `<div class="turn turn-user"><div><div class="turn-label">${label}${time}</div><div class="bubble">${text}</div></div></div>`;
  }

  const body = message.blocks.map((block) => blockToHtml(block, assets, locale)).join('\n');
  return `<div class="turn turn-assistant"><div class="turn-label">${label}${time}</div><div class="content">${body}${citations}</div></div>`;
}

export function buildConversationHtml(
  conversation: NormalizedConversation,
  options: ExportOptions,
  assets: AssetMap,
  locale: Locale,
): string {
  const dict = messages[locale];
  const metaRows: Array<[string, string]> = [];
  if (options.includeMetadataHeader) {
    metaRows.push([
      dict.conversationLink,
      `<a href="${escapeHtml(conversation.url)}">${escapeHtml(conversation.url)}</a>`,
    ]);
    if (conversation.model) {
      metaRows.push([dict.model, escapeHtml(modelDisplayName(conversation.model))]);
    }
    if (conversation.createTime) {
      metaRows.push([dict.createdAt, formatDateTime(conversation.createTime, locale)]);
    }
    if (conversation.updateTime) {
      metaRows.push([dict.updatedAt, formatDateTime(conversation.updateTime, locale)]);
    }
    metaRows.push([dict.messagesLabel, String(conversation.messages.length)]);
  }

  const body = conversation.messages
    .map((message) => messageToHtml(message, options, assets, locale))
    .join('\n');

  return renderHtmlPage({
    title: conversation.title,
    lang: locale,
    metaRows,
    body,
    footer: dict.exportedWith,
  });
}

export const htmlExporter: Exporter = {
  format: 'html',
  async build({ conversation, options, assets, locale }: ExportInput): Promise<ExportArtifact> {
    return {
      kind: 'download',
      filename: buildFilename(conversation.title, 'html'),
      mime: 'text/html',
      content: buildConversationHtml(conversation, options, assets, locale as Locale),
    };
  },
};
