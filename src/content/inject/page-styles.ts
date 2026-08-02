import type { Provider } from '@/core/providers/types';

const PAGE_STYLE_ID = 'gptx-page-styles';

function css(provider: Provider): string {
  const dark = provider.isDarkTheme();
  const palette = dark ? provider.theme.dark : provider.theme.light;
  const compact = provider.id === 'claude' || provider.id === 'gemini';

  return `
.gptx-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: ${compact ? '32px' : '36px'};
  padding: ${compact ? '6px 10px' : '8px 12px'};
  border: 0;
  border-radius: ${provider.theme.radiusControl};
  background: transparent;
  color: ${palette.textPrimary};
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background .15s cubic-bezier(.4, 0, .2, 1);
}
.gptx-header-btn:hover { background: ${palette.surfaceHover}; }
.gptx-header-btn svg { width: 18px; height: 18px; flex: none; display: block; }

.gptx-turn-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: ${compact ? '24px' : '28px'};
  padding: ${compact ? '2px 6px' : '4px 8px'};
  border: 0;
  border-radius: ${compact ? '6px' : provider.theme.radiusControl};
  background: transparent;
  color: ${palette.textSecondary};
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background .15s cubic-bezier(.4, 0, .2, 1), color .15s ease;
}
.gptx-turn-btn:hover {
  background: ${palette.surfaceHover};
  color: ${palette.textPrimary};
}
.gptx-turn-btn svg { width: ${compact ? '15px' : '16px'}; height: ${compact ? '15px' : '16px'}; flex: none; display: block; }

.gptx-turn-sep {
  display: inline-block;
  flex: none;
  align-self: center;
  width: 1px;
  height: ${compact ? '16px' : '18px'};
  margin: 0 6px;
  background: ${palette.borderDefault};
}

.gptx-menu-item-gptx {
  display: flex;
  width: 100%;
  align-items: center;
  gap: ${provider.id === 'chatgpt' ? '6px' : '8px'};
  height: ${provider.id === 'chatgpt' ? '36px' : '32px'};
  padding: ${provider.id === 'chatgpt' ? '6px 32px 6px 10px' : '6px 10px'};
  border: 0;
  border-radius: ${provider.id === 'chatgpt' ? '10px' : '8px'};
  background: transparent;
  color: ${palette.textPrimary};
  font-family: inherit;
  font-size: 14px;
  text-align: start;
  cursor: pointer;
}
.gptx-menu-item-gptx:hover { background: ${palette.surfaceHover}; }
.gptx-menu-item-gptx svg { width: 16px; height: 16px; flex: none; display: block; }
.gptx-menu-icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
}
.gptx-menu-label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gptx-menu-kbd {
  margin-left: 16px;
  flex: none;
  font-size: 13px;
  line-height: 20px;
  color: ${palette.textTertiary};
}
@media (pointer: coarse) { .gptx-menu-kbd { display: none; } }
`;
}

export function ensurePageStyles(provider: Provider): void {
  const existing = document.getElementById(PAGE_STYLE_ID) as HTMLElement | null;
  const signature = `${provider.id}:${provider.isDarkTheme() ? 'dark' : 'light'}`;
  if (existing?.dataset.signature === signature) return;
  existing?.remove();

  const style = document.createElement('style');
  style.id = PAGE_STYLE_ID;
  style.dataset.signature = signature;
  style.textContent = css(provider);
  document.head.appendChild(style);
}
