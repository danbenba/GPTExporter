export const SUPPORTED_ORIGINS = [
  'https://chatgpt.com',
  'https://chat.openai.com',
  'https://claude.ai',
  'https://grok.com',
  'https://gemini.google.com',
] as const;

export const EXTENSION_PREFIX = 'gptx';

export const STORAGE_KEYS = {
  exportOptions: 'gptx:export-options',
} as const;

export const RUNTIME_MESSAGES = {
  openExportModal: 'gptx/open-export-modal',
  getPageStatus: 'gptx/get-page-status',
} as const;

export const EXPORT_CREDIT_TEXT = 'Exported by GPT Exporter';
export const EXPORT_CREDIT_URL = 'https://danbenba.dev';

export const URL_POLL_INTERVAL_MS = 400;
export const DOM_RETRY_INTERVAL_MS = 500;
export const SESSION_TOKEN_SAFETY_WINDOW_MS = 60_000;
