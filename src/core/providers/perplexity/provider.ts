import type { Provider } from '@/core/providers/types';
import { fetchPerplexityThread } from './api';
import { normalizePerplexityThread } from './normalize';
import { perplexityTheme } from './theme';

const PATH_PATTERN =
  /^\/(?:search|page|session)\/([^/?#]+)|^\/(?:spaces|projects)\/[^/]+\/([^/?#]+)|^\/computer\/(?:t|tasks|a|live|gallery)\/([^/?#]+)/;

const RESERVED = new Set(['new', 'undefined', '']);

export const perplexityProvider: Provider = {
  id: 'perplexity',
  label: 'Perplexity',
  origins: ['https://www.perplexity.ai', 'https://perplexity.ai'],
  conversationPathPattern: PATH_PATTERN,
  theme: perplexityTheme,
  selectors: {
    headerAnchor: 'button[aria-label="Partager"], button[aria-label="Share"]',
    turnActionButton: 'button[aria-label="Copier"], button[aria-label="Copy"]',
    conversationTurn: '[class*="prose"]',
    messageIdAttribute: 'data-entry-uuid',
    messageRoleAttribute: 'data-role',
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
    shadow: '0 16px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(214,213,212,.07)',
  },
  resolveHeaderAnchor() {
    const candidates = [...document.querySelectorAll('button')].filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.top < 70 && rect.width > 0 && rect.left > window.innerWidth * 0.5;
    });
    return candidates[0]?.parentElement ?? null;
  },
  matches(url = location.href) {
    return this.origins.some((origin) => url.startsWith(origin));
  },
  getConversationId(pathname = location.pathname) {
    const match = pathname.match(PATH_PATTERN);
    if (!match) return null;
    const raw = match[1] ?? match[2] ?? match[3];
    if (!raw) return null;
    const id = decodeURIComponent(raw);
    return RESERVED.has(id) ? null : id;
  },
  conversationUrl(conversationId) {
    return `${location.origin}/search/${conversationId}`;
  },
  async fetchConversation(conversationId) {
    const thread = await fetchPerplexityThread(conversationId);
    const slug = thread.entries[0]?.thread_url_slug ?? conversationId;
    const normalized = normalizePerplexityThread(
      thread,
      conversationId,
      `${location.origin}/search/${slug}`,
    );
    return { normalized, raw: thread };
  },
  async resolveAsset(pointer) {
    if (!pointer) return null;
    if (/^https?:\/\//.test(pointer)) return pointer;
    return `${location.origin}${pointer.startsWith('/') ? '' : '/'}${pointer}`;
  },
  isDarkTheme() {
    const scheme = document.documentElement.dataset.colorScheme;
    if (scheme === 'light') return false;
    if (scheme === 'dark') return true;
    const channels = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    if (!channels) return true;
    const [r, g, b] = channels.slice(0, 3).map(Number);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  },
};
