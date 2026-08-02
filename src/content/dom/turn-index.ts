import { selectors } from './selectors';

export interface TurnLocation {
  messageId: string | null;
  role: 'user' | 'assistant';
  userPreview: string | null;
  assistantPreview: string | null;
  userMessageId: string | null;
}

function readMessage(turn: Element | null): { id: string | null; role: string; text: string } | null {
  const authored = turn?.querySelector('[data-message-id]');
  if (!authored) return null;
  return {
    id: authored.getAttribute('data-message-id'),
    role: authored.getAttribute('data-message-author-role') ?? 'assistant',
    text: ((authored as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim(),
  };
}

export function describeTurn(turn: HTMLElement): TurnLocation {
  const current = readMessage(turn);
  const role = current?.role === 'user' ? 'user' : 'assistant';

  if (role === 'user') {
    return {
      messageId: current?.id ?? null,
      role,
      userPreview: current?.text ?? null,
      assistantPreview: null,
      userMessageId: current?.id ?? null,
    };
  }

  const turns = [...document.querySelectorAll<HTMLElement>(selectors.conversationTurn)];
  const position = turns.indexOf(turn);
  let previousUser: ReturnType<typeof readMessage> = null;
  for (let index = position - 1; index >= 0; index -= 1) {
    const candidate = readMessage(turns[index]);
    if (candidate?.role === 'user') {
      previousUser = candidate;
      break;
    }
  }

  return {
    messageId: current?.id ?? null,
    role,
    userPreview: previousUser?.text ?? null,
    assistantPreview: current?.text ?? null,
    userMessageId: previousUser?.id ?? null,
  };
}
