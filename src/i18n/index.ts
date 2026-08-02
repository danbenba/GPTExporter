import { messages, type Locale, type MessageKey } from './messages';

let currentLocale: Locale = 'en';

export function detectLocale(candidate?: string): Locale {
  const value = (candidate ?? document.documentElement.lang ?? navigator.language ?? 'en')
    .toLowerCase();
  return value.startsWith('fr') ? 'fr' : 'en';
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: MessageKey): string {
  return messages[currentLocale][key] ?? messages.en[key];
}
