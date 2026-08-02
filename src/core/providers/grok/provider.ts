import type { Provider } from '@/core/providers/types';
import { fetchGrokMeta, fetchGrokResponses } from './api';
import { normalizeGrokConversation } from './normalize';
import { grokTheme } from './theme';

const PATH_PATTERN = /\/c\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export const grokProvider: Provider = {
  id: 'grok',
  label: 'Grok',
  origins: ['https://grok.com'],
  conversationPathPattern: PATH_PATTERN,
  theme: grokTheme,
  selectors: {
    headerAnchor: 'button[aria-label="Créer un lien de partage"], button[aria-label="Share"]',
    turnActionButton:
      'button[aria-label="Copy response"], button[aria-label="Copier la réponse"], button[aria-label="Copier"], button[aria-label="Copy"]',
    conversationTurn: '.message-bubble',
    messageIdAttribute: 'data-response-id',
    messageRoleAttribute: 'data-sender',
    chatMenu: '[role="menu"]',
    chatMenuItem: '[role="menuitem"]',
  },
  toast: {
    placement: 'bottom-right',
    openAnimation: 'gptx-toast-slide-x',
    openDuration: '.2s',
    openEasing: 'cubic-bezier(.16, 1, .3, 1)',
    closeAnimation: 'gptx-toast-fade',
    closeDuration: '.15s',
    closeEasing: 'ease-in',
    radius: '12px',
    shadow: '0 16px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06)',
  },
  resolveHeaderAnchor() {
    const candidates = [...document.querySelectorAll('button')].filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.top < 60 && rect.width > 0 && rect.left > window.innerWidth * 0.5;
    });
    return candidates[0]?.parentElement ?? null;
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
    const [meta, responses] = await Promise.all([
      fetchGrokMeta(conversationId),
      fetchGrokResponses(conversationId),
    ]);
    const normalized = normalizeGrokConversation(
      meta,
      responses,
      this.conversationUrl(conversationId),
    );
    return { normalized, raw: { meta, responses } };
  },
  async resolveAsset(pointer) {
    if (!pointer) return null;
    if (/^https?:\/\//.test(pointer)) return pointer;
    return `https://assets.grok.com/${pointer.replace(/^\//, '')}`;
  },
  isDarkTheme() {
    if (document.documentElement.classList.contains('light')) return false;
    if (document.documentElement.classList.contains('dark')) return true;
    const channels = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    if (!channels) return true;
    const [r, g, b] = channels.slice(0, 3).map(Number);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  },
};
