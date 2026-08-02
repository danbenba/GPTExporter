import type { ExportOptions } from '@/core/model/export-options';
import type { Provider } from '@/core/providers/types';
import { getLocale } from '@/i18n';
import { collectAssets } from './assets';
import { triggerDownload, triggerPrint } from './download';
import { applyExportOptions } from './filter';
import { getExporter } from './registry';

export type ExportPhase = 'fetching' | 'assets' | 'rendering';

export interface ExportRequest {
  provider: Provider;
  conversationId: string;
  options: ExportOptions;
  messageId?: string | null;
  extraMessageId?: string | null;
  messageIndex?: number | null;
  extraMessageIndex?: number | null;
  toClipboard?: boolean;
  onPhase?: (phase: ExportPhase) => void;
}

export async function runExport(request: ExportRequest): Promise<string> {
  const {
    provider,
    conversationId,
    options,
    messageId,
    extraMessageId,
    messageIndex,
    extraMessageIndex,
    toClipboard,
    onPhase,
  } = request;

  onPhase?.('fetching');
  const { normalized: fetched, raw } = await provider.fetchConversation(conversationId);
  let normalized = applyExportOptions(fetched, options);

  if (messageId) {
    const wanted = new Set([messageId, extraMessageId].filter(Boolean) as string[]);
    normalized = {
      ...normalized,
      messages: normalized.messages.filter((message) => wanted.has(message.id)),
    };
  } else if (typeof messageIndex === 'number' && messageIndex >= 0) {
    const wanted = new Set(
      [messageIndex, extraMessageIndex].filter(
        (index): index is number => typeof index === 'number' && index >= 0,
      ),
    );
    normalized = {
      ...normalized,
      messages: normalized.messages.filter((_, index) => wanted.has(index)),
    };
  }

  onPhase?.('assets');
  const wantsAssets =
    options.format === 'html' || options.format === 'pdf' || options.format === 'markdown';
  const assets = wantsAssets
    ? await collectAssets(
        normalized,
        options.embedImages && options.format !== 'markdown',
        provider,
      )
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
