import { t } from '@/i18n';
import { selectors } from '@/content/dom/selectors';
import { exportIconSvg } from '@/content/ui/icons';
import { ensurePageStyles } from './page-styles';

const TURN_BUTTON_CLASS = 'gptx-turn-btn';

export function mountTurnButtons(onClick: (turnElement: HTMLElement) => void): void {
  const copyButtons = document.querySelectorAll(selectors.copyTurnButton);
  if (copyButtons.length === 0) return;

  ensurePageStyles();

  for (const copyButton of copyButtons) {
    const bar = copyButton.parentElement;
    if (!bar || bar.querySelector(`.${TURN_BUTTON_CLASS}`)) continue;

    const turn = copyButton.closest<HTMLElement>(selectors.conversationTurn);
    if (!turn) continue;

    const button = document.createElement('button');
    button.className = TURN_BUTTON_CLASS;
    button.setAttribute('aria-label', t('exportMessage'));
    button.innerHTML = `${exportIconSvg}<span>${t('exportMessage')}</span>`;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(turn);
    });

    const acrobat = bar.querySelector(selectors.acrobatTurnButton);
    if (acrobat?.parentElement === bar) {
      bar.insertBefore(button, acrobat);
    } else {
      bar.appendChild(button);
    }
  }
}

export function unmountTurnButtons(): void {
  for (const button of document.querySelectorAll(`.${TURN_BUTTON_CLASS}`)) {
    button.remove();
  }
}
