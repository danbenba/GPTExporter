const PAGE_STYLE_ID = 'gptx-page-styles';

const css = `
.gptx-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary, #fff);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}
.gptx-header-btn:hover {
  background: var(--interactive-bg-secondary-hover, rgba(255,255,255,.1));
}
.gptx-header-btn svg { width: 18px; height: 18px; flex: none; display: block; }

.gptx-turn-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 4px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary, #cdcdcd);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
}
.gptx-turn-btn:hover {
  background: var(--interactive-bg-secondary-hover, rgba(255,255,255,.1));
  color: var(--text-primary, #fff);
}
.gptx-turn-btn svg { width: 16px; height: 16px; flex: none; display: block; }
`;

export function ensurePageStyles(): void {
  if (document.getElementById(PAGE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PAGE_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
