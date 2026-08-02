import { t } from '@/i18n';
import type { Provider } from '@/core/providers/types';
import { logoSvg } from '@/content/ui/icons';
import { ensurePageStyles } from './page-styles';

const MENU_ITEM_CLASS = 'gptx-menu-item-gptx';
const CONVERSATION_ID_PATTERN =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

function findConversationId(menu: Element, provider: Provider): string | null {
  const trigger = document.querySelector('[aria-expanded="true"][aria-haspopup], [data-state="open"][aria-haspopup]');
  const row = trigger?.closest('li, [role="listitem"], a')?.querySelector('a[href]') ?? trigger?.closest('a[href]');
  const href = row?.getAttribute('href');
  const fromHref = href?.match(CONVERSATION_ID_PATTERN)?.[1];
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

export function mountChatMenuItem(
  provider: Provider,
  onSelect: (conversationId: string) => void,
): void {
  const menuSelector = provider.selectors.chatMenu;
  const itemSelector = provider.selectors.chatMenuItem;
  if (!menuSelector || !itemSelector) return;

  for (const menu of document.querySelectorAll(menuSelector)) {
    if (menu.querySelector(`.${MENU_ITEM_CLASS}`)) continue;
    const items = menu.querySelectorAll(itemSelector);
    if (items.length === 0) continue;

    const conversationId = findConversationId(menu, provider);
    if (!conversationId) continue;

    ensurePageStyles(provider);

    const lastItem = items[items.length - 1];
    const container = lastItem.parentElement ?? menu;

    const item = document.createElement('button');
    item.className = MENU_ITEM_CLASS;
    item.type = 'button';
    item.setAttribute('role', 'menuitem');
    item.innerHTML = `${logoSvg}<span>${t('exportChat')}</span>`;
    item.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(conversationId);
    });

    lastItem.after(item);
    void container;
  }
}
