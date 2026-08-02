import { t } from '@/i18n';
import type { Provider } from '@/core/providers/types';
import { logoSvg } from '@/content/ui/icons';
import { buttonStyle, styleHeaderButton, styleIcon } from './button-style';

const BUTTON_ID = 'gptx-header-export';

export function mountHeaderButton(provider: Provider, onClick: () => void): void {
  if (document.getElementById(BUTTON_ID)) return;
  const anchor =
    document.querySelector(provider.selectors.headerAnchor) ??
    provider.resolveHeaderAnchor?.() ??
    null;
  if (!anchor) return;

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.className = 'gptx-header-btn';
  button.type = 'button';
  button.setAttribute('aria-label', t('exportChat'));
  button.title = t('exportChat');
  button.innerHTML = logoSvg;

  const style = buttonStyle(provider);
  styleHeaderButton(button, style);
  styleIcon(button, style.compact ? 18 : 19);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  const competitor = provider.selectors.competitorHeaderButton
    ? document.querySelector(provider.selectors.competitorHeaderButton)
    : null;
  if (competitor?.parentElement) {
    competitor.parentElement.insertBefore(button, competitor);
    return;
  }

  if (anchor.tagName === 'BUTTON') {
    anchor.parentElement?.insertBefore(button, anchor);
    return;
  }
  anchor.insertBefore(button, anchor.firstChild);
}

export function unmountHeaderButton(): void {
  document.getElementById(BUTTON_ID)?.remove();
}
