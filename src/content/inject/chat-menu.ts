import { t } from '@/i18n';
import type { Provider } from '@/core/providers/types';
import { logoSvg } from '@/content/ui/icons';
import { ensurePageStyles } from './page-styles';

const MENU_ITEM_CLASS = 'gptx-menu-item-gptx';
const CONVERSATION_ID_PATTERN =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
const DELETE_LABEL = /^(supprimer|delete|effacer|remove)/i;

function findConversationId(menu: Element, provider: Provider): string | null {
  const trigger = document.querySelector(
    '[aria-expanded="true"][aria-haspopup], [data-state="open"][aria-haspopup]',
  );
  const row =
    trigger?.closest('li, [role="listitem"], a')?.querySelector('a[href]') ??
    trigger?.closest('a[href]');
  const fromHref = row?.getAttribute('href')?.match(CONVERSATION_ID_PATTERN)?.[1];
  if (fromHref) return fromHref;

  const labelled = menu.getAttribute('aria-labelledby');
  if (labelled) {
    const source = document.getElementById(labelled);
    const anchor = source?.closest('li, a')?.querySelector('a[href]');
    const id = anchor?.getAttribute('href')?.match(CONVERSATION_ID_PATTERN)?.[1];
    if (id) return id;
  }

  return provider.getConversationId();
}

function insertionPoint(items: Element[]): { anchor: Element; before: boolean } {
  const destructive = items.find((item) => DELETE_LABEL.test(item.textContent?.trim() ?? ''));
  if (destructive) return { anchor: destructive, before: true };
  return { anchor: items[items.length - 1], before: false };
}

export function mountChatMenuItem(
  provider: Provider,
  onSelect: (conversationId: string) => void,
): void {
  const menuSelector = provider.selectors.chatMenu;
  const itemSelector = provider.selectors.chatMenuItem;
  if (!menuSelector || !itemSelector) return;

  for (const menu of document.querySelectorAll(menuSelector)) {
    if (menu.querySelector(`.${MENU_ITEM_CLASS}`)) continue;
    const items = [...menu.querySelectorAll(itemSelector)];
    if (items.length === 0) continue;

    const conversationId = findConversationId(menu, provider);
    if (!conversationId) continue;

    ensurePageStyles(provider);

    const shortcut = provider.selectors.chatMenuShortcut;
    const item = document.createElement('button');
    item.className = MENU_ITEM_CLASS;
    item.type = 'button';
    item.setAttribute('role', 'menuitem');
    item.innerHTML =
      `<span class="gptx-menu-icon">${logoSvg}</span>` +
      `<span class="gptx-menu-label">${t('exportChat')}</span>` +
      (shortcut ? `<span class="gptx-menu-kbd">${shortcut}</span>` : '');

    let cleanup = (): void => {};
    const trigger = () => {
      cleanup();
      onSelect(conversationId);
    };

    item.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      trigger();
    });

    if (shortcut) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== shortcut.toLowerCase()) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;
        if (!document.body.contains(item)) {
          cleanup();
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        trigger();
      };
      const observer = new MutationObserver(() => {
        if (!document.body.contains(item)) cleanup();
      });
      cleanup = () => {
        document.removeEventListener('keydown', onKeyDown, true);
        observer.disconnect();
      };
      observer.observe(document.body, { childList: true, subtree: true });
      document.addEventListener('keydown', onKeyDown, true);
    }

    const { anchor, before } = insertionPoint(items);
    if (before) anchor.before(item);
    else anchor.after(item);
  }
}
