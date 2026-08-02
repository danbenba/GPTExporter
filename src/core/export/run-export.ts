import type { ExportOptions } from '@/core/model/export-options';
import type { Provider } from '@/core/providers/types';
import { getLocale } from '@/i18n';
import { collectAssets, downloadAssets, type DownloadedAsset } from './assets';
import { triggerBlobDownload, triggerDownload, triggerPrint } from './download';
import { buildZip } from './zip';
import type { AssetMap } from './types';
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
  const bundleImages = wantsAssets && !options.embedImages && options.format !== 'pdf';

  let assets: AssetMap = {};
  let downloaded: DownloadedAsset[] = [];

  if (bundleImages) {
    downloaded = await downloadAssets(normalized, provider);
    for (const asset of downloaded) assets[asset.pointer] = asset.name;
    if (downloaded.length === 0) {
      assets = await collectAssets(normalized, false, provider);
    }
  } else if (wantsAssets) {
    assets = await collectAssets(normalized, options.embedImages, provider);
  }

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
    return artifact.filename;
  }
  if (artifact.kind === 'print') {
    triggerPrint(artifact);
    return artifact.filename;
  }
  if (downloaded.length > 0) {
    const zipName = artifact.filename.replace(/\.[^.]+$/, '') + '.zip';
    const zip = buildZip([
      { name: artifact.filename, data: new TextEncoder().encode(artifact.content) },
      ...downloaded.map((asset) => ({ name: asset.name, data: asset.data })),
    ]);
    triggerBlobDownload(zip, zipName);
    return zipName;
  }
  triggerDownload(artifact);
  return artifact.filename;
}
