import type { NormalizedConversation } from '@/core/model/normalized';

export type ProviderId = 'chatgpt' | 'claude' | 'grok' | 'gemini' | 'perplexity';

export interface ProviderTheme {
  fontFamily: string;
  radiusModal: string;
  radiusControl: string;
  radiusPill: string;
  spring: string;
  dark: ProviderPalette;
  light: ProviderPalette;
}

export interface ProviderPalette {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  scrim: string;
  scrimBlur: string;
  borderDefault: string;
  borderLight: string;
  borderExtraLight: string;
  borderButton: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverted: string;
  surfaceHover: string;
  accent: string;
  primaryBg: string;
  primaryBgHover: string;
  danger: string;
  success: string;
  shadowModal: string;
}

export interface ProviderSelectors {
  headerAnchor: string;
  turnActionButton: string;
  conversationTurn: string;
  messageIdAttribute: string;
  messageRoleAttribute: string;
  competitorHeaderButton?: string;
  competitorTurnButton?: string;
  chatMenu?: string;
  chatMenuItem?: string;
  chatMenuTrigger?: string;
  chatMenuShortcut?: string;
}

export interface ProviderToastStyle {
  placement: 'top-center' | 'bottom-right';
  openAnimation: string;
  openDuration: string;
  openEasing: string;
  closeAnimation: string;
  closeDuration: string;
  closeEasing: string;
  radius: string;
  shadow: string;
}

export interface Provider {
  id: ProviderId;
  label: string;
  origins: readonly string[];
  conversationPathPattern: RegExp;
  theme: ProviderTheme;
  selectors: ProviderSelectors;
  toast: ProviderToastStyle;
  resolveHeaderAnchor?(): Element | null;
  matches(url?: string): boolean;
  getConversationId(pathname?: string): string | null;
  conversationUrl(conversationId: string): string;
  fetchConversation(conversationId: string): Promise<{
    normalized: NormalizedConversation;
    raw: unknown;
  }>;
  resolveAsset(pointer: string): Promise<string | null>;
  isDarkTheme(): boolean;
}
