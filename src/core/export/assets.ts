import { fetchAsDataUrl } from '@/core/api/files';
import type { NormalizedConversation } from '@/core/model/normalized';
import type { Provider } from '@/core/providers/types';
import { extensionFromMime } from './zip';
import type { AssetMap } from './types';

export interface DownloadedAsset {
  pointer: string;
  name: string;
  data: Uint8Array<ArrayBuffer>;
}

export async function downloadAssets(
  conversation: NormalizedConversation,
  provider: Provider,
): Promise<DownloadedAsset[]> {
  const pointers = new Set<string>();
  for (const message of conversation.messages) {
    for (const block of message.blocks) {
      if (block.kind === 'image' && block.assetPointer) pointers.add(block.assetPointer);
    }
  }

  const assets: DownloadedAsset[] = [];
  let index = 0;
  for (const pointer of pointers) {
    index += 1;
    const url = await provider.resolveAsset(pointer);
    if (!url) continue;
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) continue;
      const buffer = new Uint8Array(await response.arrayBuffer());
      const mime = response.headers.get('content-type') ?? '';
      assets.push({
        pointer,
        name: `images/image-${String(index).padStart(3, '0')}.${extensionFromMime(mime)}`,
        data: buffer,
      });
    } catch {
      continue;
    }
  }
  return assets;
}

export async function collectAssets(
  conversation: NormalizedConversation,
  embed: boolean,
  provider: Provider,
): Promise<AssetMap> {
  const pointers = new Set<string>();
  for (const message of conversation.messages) {
    for (const block of message.blocks) {
      if (block.kind === 'image' && block.assetPointer) {
        pointers.add(block.assetPointer);
      }
    }
  }

  const assets: AssetMap = {};
  await Promise.all(
    [...pointers].map(async (pointer) => {
      const url = await provider.resolveAsset(pointer);
      if (!url) return;
      if (!embed) {
        assets[pointer] = url;
        return;
      }
      const dataUrl = await fetchAsDataUrl(url);
      assets[pointer] = dataUrl ?? url;
    }),
  );
  return assets;
}
