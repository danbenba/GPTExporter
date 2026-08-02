import type { Provider } from '@/core/providers/types';
import { accountPath } from './batchexecute';
import { normalizeGeminiConversation } from './normalize';
import { readChat } from './rpc';
import { geminiTheme } from './theme';

const PATH_PATTERN = /^(?:\/u\/\d+)?\/(?:app|gem\/[^/]+)\/(c_[a-zA-Z0-9_-]+|[0-9a-f]{8,})/;

function withPrefix(id: string): string {
  return id.startsWith('c_') ? id : `c_${id}`;
}

function documentTitle(): string {
  const heading = document.querySelector('[data-test-id="conversation-title"], .conversation.selected .conversation-title');
  const fromDom = heading?.textContent?.trim();
  if (fromDom) return fromDom;
  return document.title.replace(/\s*[-–]\s*Google Gemini\s*$/i, '').trim();
}

export const geminiProvider: Provider = {
  id: 'gemini',
  label: 'Gemini',
  origins: ['https://gemini.google.com'],
  conversationPathPattern: PATH_PATTERN,
  theme: geminiTheme,
  selectors: {
    headerAnchor: '.gem-conversation-actions-menu-button',
    turnActionButton:
      'button[aria-label="Copier le prompt"], button[aria-label="Copy prompt"], button[aria-label="Copier"], button[aria-label="Copy"]',
    conversationTurn: '.conversation-container',
    messageIdAttribute: 'data-turn-id',
    messageRoleAttribute: 'data-role',
    chatMenu: '[role="menu"], .mat-mdc-menu-panel',
    chatMenuItem: '[role="menuitem"], .mat-mdc-menu-item',
  },
  toast: {
    placement: 'bottom-right',
    openAnimation: 'gptx-toast-slide-x',
    openDuration: '.25s',
    openEasing: 'cubic-bezier(.2, 0, 0, 1)',
    closeAnimation: 'gptx-toast-fade',
    closeDuration: '.15s',
    closeEasing: 'ease-in',
    radius: '8px',
    shadow: '0 8px 24px rgba(0,0,0,.4), 0 2px 6px rgba(0,0,0,.3)',
  },
  resolveHeaderAnchor() {
    const menu = document.querySelector('.gem-conversation-actions-menu-button');
    if (menu) return menu;
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
    const id = pathname.match(PATH_PATTERN)?.[1];
    return id ? withPrefix(id) : null;
  },
  conversationUrl(conversationId) {
    return `${location.origin}${accountPath()}/app/${conversationId}`;
  },
  async fetchConversation(conversationId) {
    const sourcePath = `${accountPath()}/app/${conversationId}`;
    const turns = await readChat(conversationId, sourcePath);
    const normalized = normalizeGeminiConversation(
      turns,
      conversationId,
      documentTitle(),
      this.conversationUrl(conversationId),
    );
    return { normalized, raw: turns };
  },
  async resolveAsset(pointer) {
    if (!pointer) return null;
    if (/^https?:\/\//.test(pointer)) return pointer;
    return `${location.origin}${pointer.startsWith('/') ? '' : '/'}${pointer}`;
  },
  isDarkTheme() {
    const channels = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    if (!channels) return true;
    const [r, g, b] = channels.slice(0, 3).map(Number);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  },
};
