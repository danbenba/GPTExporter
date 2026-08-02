import type { ProviderPalette, ProviderTheme } from '@/core/providers/types';

function paletteVars(palette: ProviderPalette): string {
  return `
  --bg-primary: ${palette.bgPrimary};
  --bg-secondary: ${palette.bgSecondary};
  --bg-tertiary: ${palette.bgTertiary};
  --bg-elevated: ${palette.bgElevated};
  --scrim: ${palette.scrim};
  --scrim-blur: ${palette.scrimBlur};
  --border-default: ${palette.borderDefault};
  --border-light: ${palette.borderLight};
  --border-xlight: ${palette.borderExtraLight};
  --border-btn: ${palette.borderButton};
  --text-primary: ${palette.textPrimary};
  --text-secondary: ${palette.textSecondary};
  --text-tertiary: ${palette.textTertiary};
  --text-inverted: ${palette.textInverted};
  --surface-hover: ${palette.surfaceHover};
  --accent: ${palette.accent};
  --btn-primary-bg: ${palette.primaryBg};
  --btn-primary-bg-hover: ${palette.primaryBgHover};
  --danger: ${palette.danger};
  --success: ${palette.success};
  --shadow-long: ${palette.shadowModal};`;
}

export function themeVars(theme: ProviderTheme): string {
  return `
.gptx-root {
  --font: ${theme.fontFamily};
  --spring: ${theme.spring};
  --radius-modal: ${theme.radiusModal};
  --radius-control: ${theme.radiusControl};
  --radius-pill: ${theme.radiusPill};
}
.gptx-root[data-theme="dark"] {${paletteVars(theme.dark)}
  color-scheme: dark;
}
.gptx-root[data-theme="light"] {${paletteVars(theme.light)}
  color-scheme: light;
}
`;
}
