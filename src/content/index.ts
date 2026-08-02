import { detectLocale, setLocale } from '@/i18n';
import { RUNTIME_MESSAGES } from '@/shared/constants';
import { logger } from '@/shared/logger';
import { observeDom } from './dom/observe';
import { mountHeaderButton, unmountHeaderButton } from './inject/header-button';
import { mountTurnButtons, unmountTurnButtons } from './inject/turn-buttons';
import { getConversationId, watchLocation } from './router';
import { exportModal } from './ui/modal';

let activeConversationId: string | null = null;
let mountScheduled = false;

function openModal(): void {
  const conversationId = activeConversationId ?? getConversationId();
  if (!conversationId) return;
  void exportModal.open(conversationId);
}

function scheduleMount(): void {
  if (mountScheduled) return;
  mountScheduled = true;
  requestAnimationFrame(() => {
    mountScheduled = false;
    if (!activeConversationId) return;
    setLocale(detectLocale());
    mountHeaderButton(openModal);
    mountTurnButtons(openModal);
  });
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
  setLocale(detectLocale());
  watchLocation(handleConversationChange);
  observeDom(() => {
    if (activeConversationId) scheduleMount();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === RUNTIME_MESSAGES.openExportModal) {
      openModal();
      sendResponse({ ok: true });
    }
    if (message?.type === RUNTIME_MESSAGES.getPageStatus) {
      sendResponse({ conversationId: activeConversationId ?? getConversationId() });
    }
    return undefined;
  });

  logger.info('content script ready');
}

bootstrap();
