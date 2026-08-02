import type { ApiConversation, ApiConversationWithId } from '@/core/model/conversation';
import { apiGet } from './client';
import { endpoints } from './endpoints';

export async function fetchConversation(conversationId: string): Promise<ApiConversationWithId> {
  const conversation = await apiGet<ApiConversation>(endpoints.conversation(conversationId));
  return { ...conversation, id: conversation.conversation_id ?? conversationId };
}
