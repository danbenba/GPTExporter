import { fetchConversation } from '@/core/api/conversation-service';
import type { ExportOptions } from '@/core/model/export-options';
import { getLocale } from '@/i18n';
import { collectAssets } from './assets';
import { triggerDownload, triggerPrint } from './download';
import { applyExportOptions } from './filter';
import { getExporter } from './registry';
import { normalizeConversation } from '@/core/tree/normalize';

export type ExportPhase = 'fetching' | 'assets' | 'rendering';

export interface ExportRequest {
  conversationId: string;
  options: ExportOptions;
  messageId?: string | null;
  extraMessageId?: string | null;
  toClipboard?: boolean;
  onPhase?: (phase: ExportPhase) => void;
}

export async function runExport(request: ExportRequest): Promise<string> {
  const { conversationId, options, messageId, extraMessageId, toClipboard, onPhase } = request;

  onPhase?.('fetching');
  const raw = await fetchConversation(conversationId);
  const url = `${location.origin}/c/${raw.id}`;
  let normalized = applyExportOptions(normalizeConversation(raw, url), options);

  if (messageId) {
    const wanted = new Set([messageId, extraMessageId].filter(Boolean) as string[]);
    normalized = {
      ...normalized,
      messages: normalized.messages.filter((message) => wanted.has(message.id)),
    };
  }

  onPhase?.('assets');
  const wantsAssets =
    options.format === 'html' || options.format === 'pdf' || options.format === 'markdown';
  const assets = wantsAssets
    ? await collectAssets(normalized, options.embedImages && options.format !== 'markdown')
    : {};

  onPhase?.('rendering');
  const exporter = getExporter(options.format);
  const artifact = await exporter.build({
    conversation: normalized,
    raw,
    options,
    assets,
    locale: getLocale(),
  });

  if (toClipboard) {
    await navigator.clipboard.writeText(artifact.content);
  } else if (artifact.kind === 'print') {
    triggerPrint(artifact);
  } else {
    triggerDownload(artifact);
  }
  return artifact.filename;
}
