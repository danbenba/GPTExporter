import { CONVERSATION_PATH_PATTERN, URL_POLL_INTERVAL_MS } from '@/shared/constants';

export function getConversationId(pathname = location.pathname): string | null {
  const match = pathname.match(CONVERSATION_PATH_PATTERN);
  return match ? match[1] : null;
}

export function watchLocation(onChange: (conversationId: string | null) => void): () => void {
  let lastHref = location.href;
  onChange(getConversationId());

  const check = () => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      onChange(getConversationId());
    }
  };

  const interval = window.setInterval(check, URL_POLL_INTERVAL_MS);
  window.addEventListener('popstate', check);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener('popstate', check);
  };
}
