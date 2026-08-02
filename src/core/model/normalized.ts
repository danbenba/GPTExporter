export type BlockKind =
  | 'paragraph'
  | 'code'
  | 'execution-output'
  | 'quote'
  | 'image'
  | 'thought'
  | 'error'
  | 'context'
  | 'writing';

export interface NormalizedBlock {
  kind: BlockKind;
  text: string;
  language?: string;
  url?: string;
  title?: string;
  assetPointer?: string;
  width?: number;
  height?: number;
}

export type ConversationSource = 'chatgpt' | 'claude' | 'grok' | 'gemini' | 'perplexity';

export interface NormalizedCitation {
  url?: string;
  title?: string;
}

export interface NormalizedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  authorName?: string;
  model?: string;
  createTime?: number;
  blocks: NormalizedBlock[];
  citations: NormalizedCitation[];
}

export interface NormalizedConversation {
  id: string;
  title: string;
  url: string;
  source?: ConversationSource;
  createTime?: number;
  updateTime?: number;
  model?: string;
  messages: NormalizedMessage[];
}
