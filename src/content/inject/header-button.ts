import { t } from '@/i18n';
import { selectors } from '@/content/dom/selectors';
import { logoSvg } from '@/content/ui/icons';
import { ensurePageStyles } from './page-styles';

const BUTTON_ID = 'gptx-header-export';

export function mountHeaderButton(onClick: () => void): void {
  if (document.getElementById(BUTTON_ID)) return;
  const headerActions = document.querySelector(selectors.headerActions);
  if (!headerActions) return;

  ensurePageStyles();

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.className = 'gptx-header-btn';
  button.setAttribute('aria-label', t('exportChat'));
  button.title = t('exportChat');
  button.innerHTML = `${logoSvg}<span>${t('exportChat')}</span>`;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  const acrobat = document.querySelector(selectors.acrobatHeaderButton);
  if (acrobat?.parentElement) {
    acrobat.parentElement.insertBefore(button, acrobat);
    return;
  }
  headerActions.insertBefore(button, headerActions.firstChild);
}

export function unmountHeaderButton(): void {
  document.getElementById(BUTTON_ID)?.remove();
}
