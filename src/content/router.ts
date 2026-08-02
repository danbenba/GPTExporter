import type { Provider } from '@/core/providers/types';
import { URL_POLL_INTERVAL_MS } from '@/shared/constants';

export function watchLocation(
  provider: Provider,
  onChange: (conversationId: string | null) => void,
): () => void {
  let lastHref = location.href;
  onChange(provider.getConversationId());

  const check = () => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      onChange(provider.getConversationId());
    }
  };

  const interval = window.setInterval(check, URL_POLL_INTERVAL_MS);
  window.addEventListener('popstate', check);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener('popstate', check);
  };
}
