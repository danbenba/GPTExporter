import { t } from '@/i18n';
import type { Provider } from '@/core/providers/types';
import { exportIconSvg } from '@/content/ui/icons';
import { buttonStyle, styleIcon, styleSeparator, styleTurnButton } from './button-style';

const TURN_BUTTON_CLASS = 'gptx-turn-btn';
const SEPARATOR_CLASS = 'gptx-turn-sep';

const TURN_MARKERS: Partial<Record<Provider['id'], string>> = {
  claude: '.font-claude-response, [data-testid="user-message"]',
  grok: '.message-bubble, [class*="response-content"]',
  gemini: 'model-response, user-query',
  perplexity: '[class*="prose"]',
};

function resolveTurn(provider: Provider, anchor: Element): HTMLElement | null {
  const marker = TURN_MARKERS[provider.id];
  if (marker) {
    let node: HTMLElement | null = anchor.parentElement;
    for (let depth = 0; depth < 10 && node; depth += 1) {
      if (node.querySelector(marker)) return node;
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

  const style = buttonStyle(provider);

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
    button.innerHTML = exportIconSvg;
    styleTurnButton(button, style);
    styleIcon(button, style.compact ? 16 : 17);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(turn);
    });

    const separator = document.createElement('span');
    separator.className = SEPARATOR_CLASS;
    separator.setAttribute('aria-hidden', 'true');
    styleSeparator(separator, style);

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
  for (const node of document.querySelectorAll(`.${TURN_BUTTON_CLASS}, .${SEPARATOR_CLASS}`)) {
    node.remove();
  }
}
