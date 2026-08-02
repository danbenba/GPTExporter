export const CHATGPT_ORIGINS = ['https://chatgpt.com', 'https://chat.openai.com'] as const;

export const CONVERSATION_PATH_PATTERN = /\/(?:g\/[^/]+\/)?c\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export const EXTENSION_PREFIX = 'gptx';

export const STORAGE_KEYS = {
  exportOptions: 'gptx:export-options',
} as const;

export const RUNTIME_MESSAGES = {
  openExportModal: 'gptx/open-export-modal',
  getPageStatus: 'gptx/get-page-status',
} as const;

export const URL_POLL_INTERVAL_MS = 400;
export const DOM_RETRY_INTERVAL_MS = 500;
export const SESSION_TOKEN_SAFETY_WINDOW_MS = 60_000;
