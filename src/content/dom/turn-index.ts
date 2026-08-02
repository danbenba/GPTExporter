import type { Provider } from '@/core/providers/types';

export interface TurnLocation {
  messageId: string | null;
  messageIndex: number | null;
  userMessageIndex: number | null;
  role: 'user' | 'assistant';
  userPreview: string | null;
  assistantPreview: string | null;
  userMessageId: string | null;
}

interface RawTurn {
  id: string | null;
  role: 'user' | 'assistant';
  text: string;
}

function clean(value: string): string {
  return value
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1200);
}

function readChatgptTurn(turn: Element | null): RawTurn | null {
  const authored = turn?.querySelector('[data-message-id]');
  if (!authored) return null;
  return {
    id: authored.getAttribute('data-message-id'),
    role: authored.getAttribute('data-message-author-role') === 'user' ? 'user' : 'assistant',
    text: clean((authored as HTMLElement).innerText ?? ''),
  };
}

function readClaudeTurn(turn: HTMLElement | null): RawTurn | null {
  if (!turn) return null;
  const userMessage = turn.querySelector('[data-testid="user-message"]');
  if (userMessage) {
    return { id: null, role: 'user', text: clean((userMessage as HTMLElement).innerText ?? '') };
  }
  const response = turn.querySelector('.font-claude-response');
  if (response) {
    return { id: null, role: 'assistant', text: clean((response as HTMLElement).innerText ?? '') };
  }
  return null;
}

function claudeTurns(): HTMLElement[] {
  const nodes = document.querySelectorAll('[data-testid="user-message"], .font-claude-response');
  return [...nodes].map((node) => node as HTMLElement);
}

function claudeIndexOf(turn: HTMLElement): number {
  return claudeTurns().findIndex((node) => turn.contains(node) || node === turn);
}

const POSITIONAL_MARKERS: Partial<Record<Provider['id'], string>> = {
  claude: '[data-testid="user-message"], .font-claude-response',
  grok: '.message-bubble, [class*="response-content"]',
  gemini: 'user-query, model-response',
  perplexity: '[class*="prose"]',
};

function positionalNodes(provider: Provider): HTMLElement[] {
  const marker = POSITIONAL_MARKERS[provider.id];
  if (!marker) return [];
  return [...document.querySelectorAll<HTMLElement>(marker)];
}

function isUserNode(provider: Provider, node: HTMLElement): boolean {
  if (provider.id === 'claude') return node.getAttribute('data-testid') === 'user-message';
  if (provider.id === 'gemini') return node.tagName.toLowerCase() === 'user-query';
  if (provider.id === 'grok') return node.classList.contains('message-bubble');
  return false;
}

export function describeTurn(provider: Provider, turn: HTMLElement): TurnLocation {
  if (provider.id !== 'chatgpt' && provider.id !== 'claude') {
    const nodes = positionalNodes(provider);
    const position = nodes.findIndex((node) => turn.contains(node) || node === turn);
    const current = nodes[position] ?? null;
    const role = current && isUserNode(provider, current) ? 'user' : 'assistant';
    const preview = current ? clean(current.innerText ?? '') : null;

    let previousUser: string | null = null;
    let previousUserIndex: number | null = null;
    for (let index = position - 1; index >= 0; index -= 1) {
      if (isUserNode(provider, nodes[index])) {
        previousUser = clean(nodes[index].innerText ?? '');
        previousUserIndex = index;
        break;
      }
    }

    return {
      messageId: null,
      messageIndex: position >= 0 ? position : null,
      userMessageIndex: role === 'user' ? position : previousUserIndex,
      role,
      userPreview: role === 'user' ? preview : previousUser,
      assistantPreview: role === 'assistant' ? preview : null,
      userMessageId: null,
    };
  }

  if (provider.id === 'claude') {
    const nodes = claudeTurns();
    const position = claudeIndexOf(turn);
    const current = readClaudeTurn(turn);
    const role = current?.role ?? 'assistant';

    if (role === 'user') {
      return {
        messageId: null,
        messageIndex: position,
        userMessageIndex: position,
        role,
        userPreview: current?.text ?? null,
        assistantPreview: null,
        userMessageId: null,
      };
    }

    let previousUser: string | null = null;
    let previousUserIndex: number | null = null;
    for (let index = position - 1; index >= 0; index -= 1) {
      const node = nodes[index];
      if (node?.getAttribute('data-testid') === 'user-message') {
        previousUser = clean(node.innerText ?? '');
        previousUserIndex = index;
        break;
      }
    }
    return {
      messageId: null,
      messageIndex: position,
      userMessageIndex: previousUserIndex,
      role,
      userPreview: previousUser,
      assistantPreview: current?.text ?? null,
      userMessageId: null,
    };
  }

  const current = readChatgptTurn(turn);
  const role = current?.role ?? 'assistant';

  if (role === 'user') {
    return {
      messageId: current?.id ?? null,
      messageIndex: null,
      userMessageIndex: null,
      role,
      userPreview: current?.text ?? null,
      assistantPreview: null,
      userMessageId: current?.id ?? null,
    };
  }

  const turns = [...document.querySelectorAll<HTMLElement>(provider.selectors.conversationTurn)];
  const position = turns.indexOf(turn);
  let previousUser: RawTurn | null = null;
  for (let index = position - 1; index >= 0; index -= 1) {
    const candidate = readChatgptTurn(turns[index]);
    if (candidate?.role === 'user') {
      previousUser = candidate;
      break;
    }
  }

  return {
    messageId: current?.id ?? null,
    messageIndex: null,
    userMessageIndex: null,
    role,
    userPreview: previousUser?.text ?? null,
    assistantPreview: current?.text ?? null,
    userMessageId: previousUser?.id ?? null,
  };
}
