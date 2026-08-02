import type { Provider } from '@/core/providers/types';
import { checkIconSvg } from './icons';

const HOST_ID = 'gptx-toast-host';
const AUTO_DISMISS_MS = 3200;

function toastStyles(provider: Provider): string {
  const style = provider.toast;
  const bottomRight = style.placement === 'bottom-right';
  return `
:host { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; }
.gptx-toast-root {
  position: fixed;
  ${bottomRight ? 'right: 20px; bottom: 20px;' : 'top: 16px; left: 0; right: 0;'}
  z-index: 2147483001;
  display: flex;
  flex-direction: column;
  align-items: ${bottomRight ? 'flex-end' : 'center'};
  pointer-events: none;
  font-family: ${provider.theme.fontFamily};
}
.gptx-toast {
  pointer-events: all;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 10px 16px;
  border-radius: ${style.radius};
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  box-shadow: ${style.shadow};
  animation: ${style.openAnimation} ${style.openDuration} ${style.openEasing} both;
}
.gptx-toast.closing {
  animation: ${style.closeAnimation} ${style.closeDuration} ${style.closeEasing} both;
}
.gptx-toast[data-theme="dark"] {
  background: ${provider.theme.dark.bgElevated};
  color: ${provider.theme.dark.textPrimary};
  border: 1px solid ${provider.theme.dark.borderExtraLight};
}
.gptx-toast[data-theme="light"] {
  background: ${provider.theme.light.bgPrimary};
  color: ${provider.theme.light.textPrimary};
  border: 1px solid ${provider.theme.light.borderExtraLight};
}
.gptx-toast svg { width: 18px; height: 18px; flex: none; }
.gptx-toast[data-tone="success"] svg { color: ${provider.theme.dark.success}; }
.gptx-toast[data-tone="error"] svg { color: ${provider.theme.dark.danger}; }
@keyframes gptx-toast-slide-down {
  0% { opacity: 0; transform: translateY(-100%); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes gptx-toast-slide-x {
  0% { opacity: 0; transform: translateX(calc(100% + 20px)); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes gptx-toast-fade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;
}

let hideTimer: number | null = null;

function ensureHost(provider: Provider): ShadowRoot {
  const existing = document.getElementById(HOST_ID);
  if (existing?.shadowRoot && existing.dataset.provider === provider.id) {
    return existing.shadowRoot;
  }
  existing?.remove();

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.dataset.provider = provider.id;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = toastStyles(provider);
  const root = document.createElement('div');
  root.className = 'gptx-toast-root';
  shadow.append(style, root);
  document.body.appendChild(host);
  return shadow;
}

export function showToast(
  provider: Provider,
  message: string,
  tone: 'success' | 'error' = 'success',
): void {
  const shadow = ensureHost(provider);
  const root = shadow.querySelector('.gptx-toast-root');
  if (!root) return;

  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
  root.replaceChildren();

  const toast = document.createElement('div');
  toast.className = 'gptx-toast';
  toast.dataset.theme = provider.isDarkTheme() ? 'dark' : 'light';
  toast.dataset.tone = tone;
  toast.setAttribute('role', 'status');
  toast.innerHTML = checkIconSvg;
  const label = document.createElement('span');
  label.textContent = message;
  toast.appendChild(label);
  root.appendChild(toast);

  hideTimer = window.setTimeout(() => {
    toast.classList.add('closing');
    window.setTimeout(() => {
      toast.remove();
      document.getElementById(HOST_ID)?.remove();
    }, 220);
  }, AUTO_DISMISS_MS);
}
