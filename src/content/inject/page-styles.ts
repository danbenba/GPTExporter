import type { Provider } from '@/core/providers/types';

const PAGE_STYLE_ID = 'gptx-page-styles';

function css(provider: Provider): string {
  const isClaude = provider.id === 'claude';
  return `
.gptx-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: ${isClaude ? '32px' : '36px'};
  padding: ${isClaude ? '6px 10px' : '8px 12px'};
  border: 0;
  border-radius: ${provider.theme.radiusControl};
  background: transparent;
  color: ${isClaude ? 'var(--text-100, #f9f9f7)' : 'var(--text-primary, #fff)'};
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background .15s cubic-bezier(0.4, 0, 0.2, 1);
}
.gptx-header-btn:hover {
  background: ${isClaude ? 'rgba(255,255,255,.1)' : 'var(--interactive-bg-secondary-hover, rgba(255,255,255,.1))'};
}
.gptx-header-btn svg { width: 18px; height: 18px; flex: none; display: block; }

.gptx-turn-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: ${isClaude ? '24px' : '28px'};
  padding: ${isClaude ? '2px 6px' : '4px 8px'};
  border: 0;
  border-radius: ${isClaude ? '6px' : provider.theme.radiusControl};
  background: transparent;
  color: ${isClaude ? 'currentColor' : 'var(--text-secondary, #cdcdcd)'};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background .15s cubic-bezier(0.4, 0, 0.2, 1);
}
.gptx-turn-btn:hover {
  background: ${isClaude ? 'rgba(255,255,255,.1)' : 'var(--interactive-bg-secondary-hover, rgba(255,255,255,.1))'};
  color: ${isClaude ? 'inherit' : 'var(--text-primary, #fff)'};
}
.gptx-turn-btn svg { width: ${isClaude ? '15px' : '16px'}; height: ${isClaude ? '15px' : '16px'}; flex: none; display: block; }

.gptx-turn-sep {
  display: inline-block;
  flex: none;
  align-self: center;
  width: 1px;
  height: ${isClaude ? '16px' : '18px'};
  margin: 0 6px;
  background: ${isClaude ? 'rgba(255,255,255,.12)' : 'var(--border-default, rgba(255,255,255,.15))'};
}

.gptx-menu-item-gptx {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 6px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 14px;
  text-align: start;
  cursor: pointer;
}
.gptx-menu-item-gptx:hover { background: rgba(255,255,255,.1); }
.gptx-menu-item-gptx svg { width: 16px; height: 16px; flex: none; display: block; }
.gptx-menu-sep {
  height: 1px;
  margin: 4px 6px;
  background: ${isClaude ? 'rgba(255,255,255,.1)' : 'var(--border-light, rgba(255,255,255,.1))'};
}
`;
}

export function ensurePageStyles(provider: Provider): void {
  const existing = document.getElementById(PAGE_STYLE_ID);
  if (existing?.dataset.provider === provider.id) return;
  existing?.remove();
  const style = document.createElement('style');
  style.id = PAGE_STYLE_ID;
  style.dataset.provider = provider.id;
  style.textContent = css(provider);
  document.head.appendChild(style);
}
