import { fetchConversation } from '@/core/api/conversation-service';
import { resolveFileUrl } from '@/core/api/files';
import { normalizeConversation } from '@/core/tree/normalize';
import type { Provider } from '../types';
import { chatgptTheme } from './theme';

const PATH_PATTERN =
  /\/(?:g\/[^/]+\/)?c\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export const chatgptProvider: Provider = {
  id: 'chatgpt',
  label: 'ChatGPT',
  origins: ['https://chatgpt.com', 'https://chat.openai.com'],
  conversationPathPattern: PATH_PATTERN,
  theme: chatgptTheme,
  selectors: {
    headerAnchor: '#conversation-header-actions',
    turnActionButton: '[data-testid="copy-turn-action-button"]',
    conversationTurn: '[data-testid^="conversation-turn"]',
    messageIdAttribute: 'data-message-id',
    messageRoleAttribute: 'data-message-author-role',
    competitorHeaderButton: '#acrobat-chatgpt-convert-to-pdf',
    competitorTurnButton: '.acrobat-chatgpt-response-convert-btn',
    chatMenu: '[role="menu"]',
    chatMenuItem: '[role="menuitem"]',
  },
  toast: {
    placement: 'top-center',
    openAnimation: 'gptx-toast-slide-down',
    openDuration: '.24s',
    openEasing: 'cubic-bezier(.175, .885, .32, 1)',
    closeAnimation: 'gptx-toast-fade',
    closeDuration: '.12s',
    closeEasing: 'cubic-bezier(.4, 0, 1, 1)',
    radius: '12px',
    shadow: 'rgba(67, 90, 111, .3) 0 0 1px, rgba(67, 90, 111, .3) 0 5px 8px -4px',
  },
  matches(url = location.href) {
    return this.origins.some((origin) => url.startsWith(origin));
  },
  getConversationId(pathname = location.pathname) {
    return pathname.match(PATH_PATTERN)?.[1] ?? null;
  },
  conversationUrl(conversationId) {
    return `${location.origin}/c/${conversationId}`;
  },
  async fetchConversation(conversationId) {
    const raw = await fetchConversation(conversationId);
    const normalized = normalizeConversation(raw, this.conversationUrl(raw.id));
    return { normalized: { ...normalized, source: 'chatgpt' }, raw };
  },
  resolveAsset(pointer) {
    return resolveFileUrl(pointer);
  },
  isDarkTheme() {
    return document.documentElement.classList.contains('dark');
  },
};
