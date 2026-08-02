import { detectProvider } from '@/core/providers/registry';
import type { Provider } from '@/core/providers/types';
import { detectLocale, setLocale } from '@/i18n';
import { RUNTIME_MESSAGES } from '@/shared/constants';
import { logger } from '@/shared/logger';
import { observeDom } from './dom/observe';
import { describeTurn } from './dom/turn-index';
import { mountChatMenuItem } from './inject/chat-menu';
import { mountHeaderButton, unmountHeaderButton } from './inject/header-button';
import { mountTurnButtons, unmountTurnButtons } from './inject/turn-buttons';
import { watchLocation } from './router';
import { exportModal } from './ui/modal';

let provider: Provider | null = null;
let activeConversationId: string | null = null;
let mountScheduled = false;

function openModal(): void {
  if (!provider) return;
  const conversationId = activeConversationId ?? provider.getConversationId();
  if (!conversationId) return;
  void exportModal.open({ provider, conversationId });
}

function openModalFor(conversationId: string): void {
  if (!provider) return;
  void exportModal.open({ provider, conversationId });
}

function openMessageModal(turn: HTMLElement): void {
  if (!provider) return;
  const conversationId = activeConversationId ?? provider.getConversationId();
  if (!conversationId) return;
  void exportModal.open({ provider, conversationId, turn: describeTurn(provider, turn) });
}

function scheduleMount(): void {
  if (mountScheduled) return;
  mountScheduled = true;
  setTimeout(() => {
    mountScheduled = false;
    if (!provider) return;
    setLocale(detectLocale());
    mountChatMenuItem(provider, openModalFor);
    if (!activeConversationId) return;
    mountHeaderButton(provider, openModal);
    mountTurnButtons(provider, openMessageModal);
  }, 50);
}

function handleConversationChange(conversationId: string | null): void {
  activeConversationId = conversationId;
  if (!conversationId) {
    unmountHeaderButton();
    unmountTurnButtons();
    return;
  }
  scheduleMount();
}

function bootstrap(): void {
  provider = detectProvider();
  if (!provider) return;

  setLocale(detectLocale());
  watchLocation(provider, handleConversationChange);
  observeDom(() => scheduleMount());

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === RUNTIME_MESSAGES.openExportModal) {
      openModal();
      sendResponse({ ok: true });
    }
    if (message?.type === RUNTIME_MESSAGES.getPageStatus) {
      sendResponse({
        provider: provider?.id ?? null,
        label: provider?.label ?? null,
        conversationId: activeConversationId ?? provider?.getConversationId() ?? null,
      });
    }
    return undefined;
  });

  logger.info(`content script ready (${provider.label})`);
}

bootstrap();
