import type { Provider } from '../types';
import { fetchClaudeConversation, resolveClaudeAsset } from './api';
import { normalizeClaudeConversation } from './normalize';
import { claudeTheme } from './theme';

const PATH_PATTERN =
  /\/chat\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export const claudeProvider: Provider = {
  id: 'claude',
  label: 'Claude',
  origins: ['https://claude.ai'],
  conversationPathPattern: PATH_PATTERN,
  theme: claudeTheme,
  selectors: {
    headerAnchor: 'button[aria-label="Fichiers"]',
    turnActionButton: '[data-testid="action-bar-copy"]',
    conversationTurn: '.font-claude-response',
    messageIdAttribute: 'data-message-uuid',
    messageRoleAttribute: 'data-testid',
  },
  matches(url = location.href) {
    return this.origins.some((origin) => url.startsWith(origin));
  },
  getConversationId(pathname = location.pathname) {
    return pathname.match(PATH_PATTERN)?.[1] ?? null;
  },
  conversationUrl(conversationId) {
    return `${location.origin}/chat/${conversationId}`;
  },
  async fetchConversation(conversationId) {
    const raw = await fetchClaudeConversation(conversationId);
    const normalized = normalizeClaudeConversation(raw, this.conversationUrl(raw.uuid));
    return { normalized: { ...normalized, source: 'claude' }, raw };
  },
  resolveAsset(pointer) {
    return resolveClaudeAsset(pointer);
  },
  isDarkTheme() {
    const scheme = getComputedStyle(document.documentElement).colorScheme;
    if (scheme.includes('dark') && !scheme.includes('light')) return true;
    if (document.documentElement.classList.contains('light')) return false;
    if (document.documentElement.classList.contains('dark')) return true;
    const background = getComputedStyle(document.body).backgroundColor;
    const channels = background.match(/\d+/g);
    if (!channels) return true;
    const [r, g, b] = channels.slice(0, 3).map(Number);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  },
};
