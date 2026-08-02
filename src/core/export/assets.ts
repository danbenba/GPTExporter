import { fetchAsDataUrl } from '@/core/api/files';
import type { NormalizedConversation } from '@/core/model/normalized';
import type { Provider } from '@/core/providers/types';
import type { AssetMap } from './types';

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
