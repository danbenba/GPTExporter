import type {
  ApiConversation,
  ConversationMessage,
  ConversationNode,
} from '@/core/model/conversation';

export function walkActiveBranch(conversation: ApiConversation): ConversationMessage[] {
  const ordered: ConversationMessage[] = [];
  let cursor: string | null | undefined = conversation.current_node;

  while (cursor) {
    const node: ConversationNode | undefined = conversation.mapping[cursor];
    if (!node) break;
    if (node.message) {
      ordered.push(node.message);
    }
    cursor = node.parent;
  }

  ordered.reverse();
  return ordered.filter((message) => !message.metadata?.is_visually_hidden_from_conversation);
}
