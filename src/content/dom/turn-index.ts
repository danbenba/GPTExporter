export interface TurnLocation {
  messageId: string | null;
  role: 'user' | 'assistant';
  preview: string;
}

export function describeTurn(turn: HTMLElement): TurnLocation {
  const authored = turn.querySelector('[data-message-id]');
  const messageId = authored?.getAttribute('data-message-id') ?? null;
  const role = authored?.getAttribute('data-message-author-role') === 'user' ? 'user' : 'assistant';
  const source = authored ?? turn;
  const preview = ((source as HTMLElement).innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 240);
  return { messageId, role, preview };
}
