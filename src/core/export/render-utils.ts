import { messages, type Locale } from '@/i18n/messages';
import type { NormalizedMessage } from '@/core/model/normalized';

export function roleLabel(message: NormalizedMessage, locale: Locale): string {
  const dict = messages[locale];
  switch (message.role) {
    case 'user':
      return dict.user;
    case 'assistant':
      return dict.assistant;
    case 'tool':
      return dict.tool;
    default:
      return dict.system;
  }
}

export function formatDateTime(epochSeconds: number | undefined, locale: Locale): string {
  if (!epochSeconds) return '';
  return new Date(epochSeconds * 1000).toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const CLAUDE_FAMILIES: Record<string, string> = {
  opus: 'Opus',
  sonnet: 'Sonnet',
  haiku: 'Haiku',
  fable: 'Fable',
  mythos: 'Mythos',
};

function claudeDisplayName(slug: string): string | null {
  if (!slug.startsWith('claude')) return null;
  const familyKey = Object.keys(CLAUDE_FAMILIES).find((family) => slug.includes(family));
  if (!familyKey) return 'Claude';
  const family = CLAUDE_FAMILIES[familyKey];
  const version = slug
    .replace(/[-_]\d{8}$/, '')
    .split(/[-_]/)
    .filter((part) => /^\d{1,2}$/.test(part))
    .join('.');
  return version ? `Claude ${family} ${version}` : `Claude ${family}`;
}

export function modelDisplayName(slug: string | undefined): string {
  if (!slug) return '';

  const normalizedSlug = slug.toLowerCase().trim();

  const claudeName = claudeDisplayName(normalizedSlug);
  if (claudeName) return claudeName;

  const known: Record<string, string> = {
    'gpt-5-6': 'GPT-5.6',
    'gpt-5-6-sol': 'GPT-5.6 Sol',
    'gpt-5-6-sol-pro': 'GPT-5.6 Sol Pro',
    'gpt-5-6-pro': 'GPT-5.6 Pro',
    'gpt-5-6-thinking': 'GPT-5.6 Thinking',
    'gpt-5-6-thinking-mini': 'GPT-5.6 Thinking mini',
    'gpt-5-6-terra': 'GPT-5.6 Terra',
    'gpt-5-6-luna': 'GPT-5.6 Luna',

    'gpt-5.6': 'GPT-5.6',
    'gpt-5.6-sol': 'GPT-5.6 Sol',
    'gpt-5.6-sol-pro': 'GPT-5.6 Sol Pro',
    'gpt-5.6-pro': 'GPT-5.6 Pro',
    'gpt-5.6-thinking': 'GPT-5.6 Thinking',
    'gpt-5.6-thinking-mini': 'GPT-5.6 Thinking mini',
    'gpt-5.6-terra': 'GPT-5.6 Terra',
    'gpt-5.6-luna': 'GPT-5.6 Luna',

    'gpt-5-5': 'GPT-5.5',
    'gpt-5-5-instant': 'GPT-5.5 Instant',
    'gpt-5-5-instant-mini': 'GPT-5.5 Instant mini',
    'gpt-5-5-thinking': 'GPT-5.5 Thinking',
    'gpt-5-5-pro': 'GPT-5.5 Pro',

    'gpt-5.5': 'GPT-5.5',
    'gpt-5.5-instant': 'GPT-5.5 Instant',
    'gpt-5.5-instant-mini': 'GPT-5.5 Instant mini',
    'gpt-5.5-thinking': 'GPT-5.5 Thinking',
    'gpt-5.5-pro': 'GPT-5.5 Pro',

    'gpt-5-4': 'GPT-5.4',
    'gpt-5-4-instant': 'GPT-5.4 Instant',
    'gpt-5-4-thinking': 'GPT-5.4 Thinking',
    'gpt-5-4-thinking-mini': 'GPT-5.4 Thinking mini',
    'gpt-5-4-pro': 'GPT-5.4 Pro',

    'gpt-5.4': 'GPT-5.4',
    'gpt-5.4-instant': 'GPT-5.4 Instant',
    'gpt-5.4-thinking': 'GPT-5.4 Thinking',
    'gpt-5.4-thinking-mini': 'GPT-5.4 Thinking mini',
    'gpt-5.4-pro': 'GPT-5.4 Pro',

    'gpt-5-3': 'GPT-5.3',
    'gpt-5-3-instant': 'GPT-5.3 Instant',
    'gpt-5-3-thinking': 'GPT-5.3 Thinking',
    'gpt-5-3-pro': 'GPT-5.3 Pro',

    'gpt-5.3': 'GPT-5.3',
    'gpt-5.3-instant': 'GPT-5.3 Instant',
    'gpt-5.3-thinking': 'GPT-5.3 Thinking',
    'gpt-5.3-pro': 'GPT-5.3 Pro',

    'gpt-5-2': 'GPT-5.2',
    'gpt-5-2-instant': 'GPT-5.2 Instant',
    'gpt-5-2-thinking': 'GPT-5.2 Thinking',
    'gpt-5-2-pro': 'GPT-5.2 Pro',

    'gpt-5.2': 'GPT-5.2',
    'gpt-5.2-instant': 'GPT-5.2 Instant',
    'gpt-5.2-thinking': 'GPT-5.2 Thinking',
    'gpt-5.2-pro': 'GPT-5.2 Pro',

    'gpt-5-1': 'GPT-5.1',
    'gpt-5-1-instant': 'GPT-5.1 Instant',
    'gpt-5-1-thinking': 'GPT-5.1 Thinking',
    'gpt-5-1-pro': 'GPT-5.1 Pro',

    'gpt-5.1': 'GPT-5.1',
    'gpt-5.1-instant': 'GPT-5.1 Instant',
    'gpt-5.1-thinking': 'GPT-5.1 Thinking',
    'gpt-5.1-pro': 'GPT-5.1 Pro',

    'gpt-5': 'GPT-5',
    'gpt-5-mini': 'GPT-5 mini',
    'gpt-5-nano': 'GPT-5 nano',
    'gpt-5-pro': 'GPT-5 Pro',
    'gpt-5-instant': 'GPT-5 Instant',
    'gpt-5-thinking': 'GPT-5 Thinking',
    'gpt-5-thinking-mini': 'GPT-5 Thinking mini',

    'gpt-4-5': 'GPT-4.5',
    'gpt-4.5': 'GPT-4.5',
    'gpt-4-5-preview': 'GPT-4.5 Preview',
    'gpt-4.5-preview': 'GPT-4.5 Preview',

    'gpt-4-1': 'GPT-4.1',
    'gpt-4.1': 'GPT-4.1',
    'gpt-4-1-mini': 'GPT-4.1 mini',
    'gpt-4.1-mini': 'GPT-4.1 mini',
    'gpt-4-1-nano': 'GPT-4.1 nano',
    'gpt-4.1-nano': 'GPT-4.1 nano',

    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o mini',
    'chatgpt-4o-latest': 'GPT-4o',

    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4-turbo-preview': 'GPT-4 Turbo Preview',
    'gpt-4': 'GPT-4',
    'gpt-4-32k': 'GPT-4 32K',

    o1: 'OpenAI o1',
    'o1-mini': 'OpenAI o1-mini',
    'o1-preview': 'OpenAI o1 Preview',
    'o1-pro': 'OpenAI o1-pro',

    o3: 'OpenAI o3',
    'o3-mini': 'OpenAI o3-mini',
    'o3-pro': 'OpenAI o3-pro',
    'o3-deep-research': 'OpenAI o3 Deep Research',

    'o4-mini': 'OpenAI o4-mini',
    'o4-mini-deep-research': 'OpenAI o4-mini Deep Research',

    'codex-mini-latest': 'Codex mini',
    'gpt-5-codex': 'GPT-5 Codex',
    'gpt-5-1-codex': 'GPT-5.1 Codex',
    'gpt-5-1-codex-mini': 'GPT-5.1 Codex mini',
    'gpt-5-1-codex-max': 'GPT-5.1 Codex Max',
    'gpt-5-2-codex': 'GPT-5.2 Codex',
    'gpt-5-3-codex': 'GPT-5.3 Codex',
    'gpt-5-4-codex': 'GPT-5.4 Codex',
    'gpt-5-5-codex': 'GPT-5.5 Codex',
    'gpt-5-6-codex': 'GPT-5.6 Codex',

    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'text-davinci-002-render-sha': 'GPT-3.5',
  };

  const exactMatch = known[normalizedSlug];

  if (exactMatch) {
    return exactMatch;
  }
  const slugWithoutDate = normalizedSlug.replace(
    /-\d{4}-\d{2}-\d{2}$/,
    '',
  );

  const matchWithoutDate = known[slugWithoutDate];

  if (matchWithoutDate) {
    return matchWithoutDate;
  }

  if (normalizedSlug.startsWith('gpt-')) {
    return normalizedSlug
      .replace(/^gpt-/, 'GPT-')
      .replace(
        /^GPT-(\d+)-(\d+)(?=-|$)/,
        (_, major: string, minor: string) => `GPT-${major}.${minor}`,
      )
      .replace(/-/g, ' ')
      .replace(/\bmini\b/gi, 'mini')
      .replace(/\bnano\b/gi, 'nano')
      .replace(/\binstant\b/gi, 'Instant')
      .replace(/\bthinking\b/gi, 'Thinking')
      .replace(/\bpro\b/gi, 'Pro')
      .replace(/\bpreview\b/gi, 'Preview')
      .replace(/\bcodex\b/gi, 'Codex')
      .replace(/\bsol\b/gi, 'Sol')
      .replace(/\bterra\b/gi, 'Terra')
      .replace(/\bluna\b/gi, 'Luna');
  }

  if (/^o\d/.test(normalizedSlug)) {
    return `OpenAI ${normalizedSlug}`;
  }

  return slug;
}