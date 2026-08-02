import { chatgptProvider } from './chatgpt/provider';
import { claudeProvider } from './claude/provider';
import type { Provider, ProviderId } from './types';

export const providers: Provider[] = [chatgptProvider, claudeProvider];

export function detectProvider(url = location.href): Provider | null {
  return providers.find((provider) => provider.matches(url)) ?? null;
}

export function getProvider(id: ProviderId): Provider {
  const provider = providers.find((candidate) => candidate.id === id);
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider;
}
