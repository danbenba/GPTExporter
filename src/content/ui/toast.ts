import { isDarkTheme } from '@/content/dom/observe';
import { checkIconSvg } from './icons';

const HOST_ID = 'gptx-toast-host';
const AUTO_DISMISS_MS = 3200;

const toastStyles = `
:host { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; }
.gptx-toast-root {
  position: fixed;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 2147483001;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
}
.gptx-toast {
  pointer-events: all;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  box-shadow: rgba(67, 90, 111, .3) 0 0 1px, rgba(67, 90, 111, .3) 0 5px 8px -4px;
  animation: gptx-toast-open .24s cubic-bezier(.175, .885, .32, 1) both;
}
.gptx-toast.closing {
  animation: gptx-toast-close .12s cubic-bezier(.4, 0, 1, 1) both;
}
.gptx-toast[data-theme="dark"] {
  background: #1b1b1b;
  color: #fff;
  border: 1px solid #ffffff1a;
}
.gptx-toast[data-theme="light"] {
  background: #fff;
  color: #0d0d0d;
  border: 1px solid #0000001a;
}
.gptx-toast svg { width: 18px; height: 18px; flex: none; }
.gptx-toast[data-tone="success"] svg { color: #53b559; }
.gptx-toast[data-tone="error"] svg { color: #ff8583; }
@keyframes gptx-toast-open {
  0% { opacity: 0; transform: translateY(-100%); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes gptx-toast-close {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
`;

let hideTimer: number | null = null;

function ensureHost(): ShadowRoot {
  const existing = document.getElementById(HOST_ID);
  if (existing?.shadowRoot) return existing.shadowRoot;

  const host = document.createElement('div');
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = toastStyles;
  const root = document.createElement('div');
  root.className = 'gptx-toast-root';
  shadow.append(style, root);
  document.body.appendChild(host);
  return shadow;
}

export function showToast(message: string, tone: 'success' | 'error' = 'success'): void {
  const shadow = ensureHost();
  const root = shadow.querySelector('.gptx-toast-root');
  if (!root) return;

  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
  root.replaceChildren();

  const toast = document.createElement('div');
  toast.className = 'gptx-toast';
  toast.dataset.theme = isDarkTheme() ? 'dark' : 'light';
  toast.dataset.tone = tone;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${checkIconSvg}<span></span>`;
  const label = toast.querySelector('span');
  if (label) label.textContent = message;
  root.appendChild(toast);

  hideTimer = window.setTimeout(() => {
    toast.classList.add('closing');
    window.setTimeout(() => {
      toast.remove();
      document.getElementById(HOST_ID)?.remove();
    }, 140);
  }, AUTO_DISMISS_MS);
}
