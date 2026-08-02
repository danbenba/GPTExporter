import { buildFilename } from '@/core/export/filename';
import { formatDateTime, modelDisplayName } from '@/core/export/render-utils';
import type { AssetMap, ExportArtifact, ExportInput, Exporter } from '@/core/export/types';
import type { NormalizedBlock, NormalizedConversation, NormalizedMessage } from '@/core/model/normalized';
import type { ExportOptions } from '@/core/model/export-options';
import { EXPORT_CREDIT_TEXT, EXPORT_CREDIT_URL } from '@/shared/constants';
import { messages, type Locale } from '@/i18n/messages';
import { codeBlockHtml, escapeHtml, renderMarkdown, setCopyLabel } from './mini-markdown';
import { renderHtmlPage } from './template';

const USER_AVATAR = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 19.4C5.9 16.4 8.7 14.6 12 14.6C15.3 14.6 18.1 16.4 19.2 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

const ASSISTANT_AVATAR = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L13.9 8.1L19 10L13.9 11.9L12 17L10.1 11.9L5 10L10.1 8.1L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M18.5 15.5L19.3 17.7L21.5 18.5L19.3 19.3L18.5 21.5L17.7 19.3L15.5 18.5L17.7 17.7L18.5 15.5Z" fill="currentColor"/></svg>`;

const PENCIL_ICON = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.6 3.2L16.8 6.4L7.2 16H4V12.8L13.6 3.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

function blockToHtml(block: NormalizedBlock, assets: AssetMap, locale: Locale): string {
  const dict = messages[locale];
  switch (block.kind) {
    case 'code':
      return codeBlockHtml(block.text, block.language ?? '');
    case 'execution-output':
      return codeBlockHtml(block.text, 'stdout');
    case 'writing':
      return `<div class="writing-card"><div class="writing-head"><span class="writing-title">${PENCIL_ICON}${dict.writingLabel}</span><button class="copy-btn" type="button" data-copy>${dict.copy}</button></div><div class="writing-body">${renderMarkdown(block.text)}</div></div>`;
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
  const time = options.includeTimestamps
    ? `<div class="turn-time">${formatDateTime(message.createTime, locale)}</div>`
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
      .map((block) => (block.kind === 'image' ? blockToHtml(block, assets, locale) : escapeHtml(block.text)))
      .join('\n');
    return `<div class="turn">${time}<div class="turn-user"><div class="avatar avatar-user">${USER_AVATAR}</div><div class="bubble">${text}</div></div></div>`;
  }

  const body = message.blocks.map((block) => blockToHtml(block, assets, locale)).join('\n');
  return `<div class="turn">${time}<div class="turn-assistant"><div class="avatar avatar-assistant">${ASSISTANT_AVATAR}</div><div class="content">${body}${citations}</div></div></div>`;
}

export function buildConversationHtml(
  conversation: NormalizedConversation,
  options: ExportOptions,
  assets: AssetMap,
  locale: Locale,
): string {
  const dict = messages[locale];
  setCopyLabel(dict.copy);

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
    creditText: EXPORT_CREDIT_TEXT,
    creditUrl: EXPORT_CREDIT_URL,
    copiedLabel: dict.copied,
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
