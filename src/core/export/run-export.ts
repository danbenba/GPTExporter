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
  toClipboard?: boolean;
  onPhase?: (phase: ExportPhase) => void;
}

export async function runExport(request: ExportRequest): Promise<string> {
  const { conversationId, options, messageId, toClipboard, onPhase } = request;

  onPhase?.('fetching');
  const raw = await fetchConversation(conversationId);
  const url = `${location.origin}/c/${raw.id}`;
  let normalized = applyExportOptions(normalizeConversation(raw, url), options);

  if (messageId) {
    const selected = normalized.messages.find((message) => message.id === messageId);
    normalized = { ...normalized, messages: selected ? [selected] : [] };
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
