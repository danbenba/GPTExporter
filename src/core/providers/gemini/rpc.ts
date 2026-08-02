import { callRpc } from './batchexecute';

export const RPC_READ_CHAT = 'hNvQHb';
export const RPC_LIST_CHATS = 'MaZiqc';

export const MAX_TURNS = 1000;

export type GeminiTurn = unknown[];

export async function readChat(conversationId: string, sourcePath?: string): Promise<GeminiTurn[]> {
  const body = await callRpc<unknown[]>(
    RPC_READ_CHAT,
    [conversationId, MAX_TURNS, null, 1, [1], [4], null, 1],
    sourcePath,
  );
  const turns = Array.isArray(body) ? body[0] : null;
  return Array.isArray(turns) ? (turns as GeminiTurn[]) : [];
}
