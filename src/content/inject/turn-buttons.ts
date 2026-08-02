import { t } from '@/i18n';
import type { Provider } from '@/core/providers/types';
import { exportIconSvg } from '@/content/ui/icons';
import { ensurePageStyles } from './page-styles';

const TURN_BUTTON_CLASS = 'gptx-turn-btn';

function resolveTurn(provider: Provider, anchor: Element): HTMLElement | null {
  if (provider.id === 'claude') {
    let node: HTMLElement | null = anchor.parentElement;
    for (let depth = 0; depth < 8 && node; depth += 1) {
      if (node.querySelector('.font-claude-response, [data-testid="user-message"]')) return node;
      node = node.parentElement;
    }
    return anchor.parentElement;
  }
  return anchor.closest<HTMLElement>(provider.selectors.conversationTurn);
}

export function mountTurnButtons(
  provider: Provider,
  onClick: (turnElement: HTMLElement) => void,
): void {
  const anchors = document.querySelectorAll(provider.selectors.turnActionButton);
  if (anchors.length === 0) return;

  ensurePageStyles(provider);

  for (const anchor of anchors) {
    const bar = anchor.parentElement;
    if (!bar || bar.querySelector(`.${TURN_BUTTON_CLASS}`)) continue;

    const turn = resolveTurn(provider, anchor);
    if (!turn) continue;

    const button = document.createElement('button');
    button.className = TURN_BUTTON_CLASS;
    button.type = 'button';
    button.setAttribute('aria-label', t('exportMessage'));
    button.title = t('exportMessage');
    button.innerHTML = `${exportIconSvg}<span>${t('exportMessage')}</span>`;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(turn);
    });

    const separator = document.createElement('span');
    separator.className = 'gptx-turn-sep';
    separator.setAttribute('aria-hidden', 'true');

    const competitor = provider.selectors.competitorTurnButton
      ? bar.querySelector(provider.selectors.competitorTurnButton)
      : null;
    if (competitor?.parentElement === bar) {
      bar.insertBefore(separator, competitor);
      bar.insertBefore(button, competitor);
    } else {
      bar.append(separator, button);
    }
  }
}

export function unmountTurnButtons(): void {
  for (const node of document.querySelectorAll(`.${TURN_BUTTON_CLASS}, .gptx-turn-sep`)) {
    node.remove();
  }
}
