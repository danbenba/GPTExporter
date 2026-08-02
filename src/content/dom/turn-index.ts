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

export function describeTurn(provider: Provider, turn: HTMLElement): TurnLocation {
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
