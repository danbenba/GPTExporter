import type { Provider, ProviderPalette } from '@/core/providers/types';

export interface InjectedButtonStyle {
  palette: ProviderPalette;
  fontFamily: string;
  radius: string;
  compact: boolean;
}

export function buttonStyle(provider: Provider): InjectedButtonStyle {
  return {
    palette: provider.isDarkTheme() ? provider.theme.dark : provider.theme.light,
    fontFamily: provider.theme.fontFamily,
    radius: provider.theme.radiusControl,
    compact: provider.id === 'claude' || provider.id === 'gemini',
  };
}

function applyBase(element: HTMLElement, style: InjectedButtonStyle): void {
  element.style.setProperty('display', 'inline-flex', 'important');
  element.style.setProperty('align-items', 'center', 'important');
  element.style.setProperty('justify-content', 'center', 'important');
  element.style.setProperty('box-sizing', 'border-box', 'important');
  element.style.setProperty('border', '0', 'important');
  element.style.setProperty('background', 'transparent', 'important');
  element.style.setProperty('font-family', style.fontFamily, 'important');
  element.style.setProperty('font-weight', '500', 'important');
  element.style.setProperty('line-height', '1', 'important');
  element.style.setProperty('white-space', 'nowrap', 'important');
  element.style.setProperty('cursor', 'pointer', 'important');
  element.style.setProperty('transition', 'background .15s ease, color .15s ease', 'important');
}

function bindHover(element: HTMLElement, style: InjectedButtonStyle): void {
  element.addEventListener('pointerenter', () => {
    element.style.setProperty('background', style.palette.surfaceHover, 'important');
    element.style.setProperty('color', style.palette.textPrimary, 'important');
  });
  element.addEventListener('pointerleave', () => {
    element.style.setProperty('background', 'transparent', 'important');
    element.style.setProperty('color', element.dataset.restColor ?? style.palette.textPrimary, 'important');
  });
}

export function styleHeaderButton(element: HTMLElement, style: InjectedButtonStyle): void {
  applyBase(element, style);
  const size = style.compact ? '32px' : '36px';
  element.style.setProperty('width', size, 'important');
  element.style.setProperty('height', size, 'important');
  element.style.setProperty('padding', '0', 'important');
  element.style.setProperty('gap', '0', 'important');
  element.style.setProperty('border-radius', style.radius, 'important');
  element.style.setProperty('color', style.palette.textPrimary, 'important');
  element.style.setProperty('font-size', '14px', 'important');
  element.dataset.restColor = style.palette.textPrimary;
  bindHover(element, style);
}

export function styleTurnButton(element: HTMLElement, style: InjectedButtonStyle): void {
  applyBase(element, style);
  const size = style.compact ? '28px' : '30px';
  element.style.setProperty('width', size, 'important');
  element.style.setProperty('height', size, 'important');
  element.style.setProperty('padding', '0', 'important');
  element.style.setProperty('gap', '0', 'important');
  element.style.setProperty('border-radius', style.compact ? '9999px' : style.radius, 'important');
  element.style.setProperty('color', style.palette.textSecondary, 'important');
  element.style.setProperty('font-size', '13px', 'important');
  element.dataset.restColor = style.palette.textSecondary;
  bindHover(element, style);
}

export function styleIcon(element: HTMLElement, size: number): void {
  const svg = element.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.style.setProperty('width', `${size}px`, 'important');
  svg.style.setProperty('height', `${size}px`, 'important');
  svg.style.setProperty('display', 'block', 'important');
  svg.style.setProperty('flex', 'none', 'important');
}

export function styleSeparator(element: HTMLElement, style: InjectedButtonStyle): void {
  element.style.setProperty('display', 'inline-block', 'important');
  element.style.setProperty('flex', 'none', 'important');
  element.style.setProperty('align-self', 'center', 'important');
  element.style.setProperty('width', '1px', 'important');
  element.style.setProperty('height', style.compact ? '16px' : '18px', 'important');
  element.style.setProperty('margin', '0 6px', 'important');
  element.style.setProperty('background', style.palette.borderDefault, 'important');
}

export function styleMenuItem(element: HTMLElement, style: InjectedButtonStyle, chatgpt: boolean): void {
  applyBase(element, style);
  element.style.setProperty('justify-content', 'flex-start', 'important');
  element.style.setProperty('width', '100%', 'important');
  element.style.setProperty('gap', chatgpt ? '6px' : '8px', 'important');
  element.style.setProperty('height', chatgpt ? '36px' : '32px', 'important');
  element.style.setProperty('padding', chatgpt ? '6px 32px 6px 10px' : '6px 10px', 'important');
  element.style.setProperty('border-radius', chatgpt ? '10px' : '8px', 'important');
  element.style.setProperty('color', style.palette.textPrimary, 'important');
  element.style.setProperty('font-size', '14px', 'important');
  element.style.setProperty('font-weight', '400', 'important');
  element.style.setProperty('text-align', 'start', 'important');
  element.dataset.restColor = style.palette.textPrimary;
  bindHover(element, style);
}
