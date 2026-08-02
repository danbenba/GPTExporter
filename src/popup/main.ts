import { detectLocale, setLocale, t } from '@/i18n';
import { RUNTIME_MESSAGES, SUPPORTED_ORIGINS } from '@/shared/constants';

const statusEl = document.getElementById('status') as HTMLParagraphElement;
const actionEl = document.getElementById('action') as HTMLButtonElement;

function isSupportedUrl(url: string | undefined): boolean {
  return Boolean(url && SUPPORTED_ORIGINS.some((origin) => url.startsWith(origin)));
}

async function init(): Promise<void> {
  setLocale(detectLocale(navigator.language));

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !isSupportedUrl(tab.url)) {
    statusEl.textContent = t('popupNotChatGpt');
    actionEl.hidden = false;
    actionEl.textContent = t('popupGoToChatGpt');
    actionEl.addEventListener('click', () => {
      void chrome.tabs.create({ url: 'https://chatgpt.com/' });
      window.close();
    });
    return;
  }

  const tabId = tab.id;
  let conversationId: string | null = null;
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: RUNTIME_MESSAGES.getPageStatus,
    });
    conversationId = response?.conversationId ?? null;
  } catch {
    conversationId = null;
  }

  if (!conversationId) {
    statusEl.textContent = t('popupOpenChat');
    return;
  }

  statusEl.textContent = t('popupReady');
  actionEl.hidden = false;
  actionEl.textContent = t('popupExport');
  actionEl.addEventListener('click', () => {
    void chrome.tabs.sendMessage(tabId, { type: RUNTIME_MESSAGES.openExportModal });
    window.close();
  });
}

void init();
