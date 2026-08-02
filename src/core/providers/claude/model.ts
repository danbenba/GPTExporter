export const CLAUDE_ROOT_PARENT = '00000000-0000-4000-8000-000000000000';

export type ClaudeSender = 'human' | 'assistant';

export interface ClaudeTextBlock {
  type: 'text';
  text: string;
  citations?: Array<{ url?: string; title?: string; [key: string]: unknown }>;
}

export interface ClaudeThinkingBlock {
  type: 'thinking';
  thinking: string;
  summaries?: Array<{ summary?: string }>;
  hidden?: boolean;
  thinking_hidden?: boolean;
}

export interface ClaudeToolUseBlock {
  type: 'tool_use';
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  message?: string;
  display_content?: unknown;
}

export interface ClaudeToolResultBlock {
  type: 'tool_result';
  tool_use_id?: string;
  name?: string;
  content?: unknown;
  is_error?: boolean;
}

export type ClaudeContentBlock =
  | ClaudeTextBlock
  | ClaudeThinkingBlock
  | ClaudeToolUseBlock
  | ClaudeToolResultBlock;

export interface ClaudeAsset {
  url?: string;
  image_width?: number;
  image_height?: number;
}

export interface ClaudeFile {
  file_uuid?: string;
  uuid?: string;
  id?: string;
  file_name?: string;
  file_kind?: string;
  preview_url?: string;
  thumbnail_url?: string;
  document_url?: string;
  original_url?: string;
  url?: string;
  preview_asset?: ClaudeAsset;
  thumbnail_asset?: ClaudeAsset;
  document_asset?: ClaudeAsset;
}

export interface ClaudeAttachment {
  id?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  extracted_content?: string;
}

export interface ClaudeMessage {
  uuid: string;
  parent_message_uuid?: string | null;
  sender: ClaudeSender;
  index?: number;
  text?: string;
  content?: ClaudeContentBlock[];
  created_at?: string;
  updated_at?: string;
  truncated?: boolean;
  stop_reason?: string;
  files?: ClaudeFile[];
  files_v2?: ClaudeFile[];
  attachments?: ClaudeAttachment[];
}

export interface ClaudeConversation {
  uuid: string;
  name: string;
  summary?: string;
  model?: string | null;
  created_at?: string;
  updated_at?: string;
  current_leaf_message_uuid?: string;
  chat_messages: ClaudeMessage[];
}

export interface ClaudeOrganization {
  uuid: string;
  name?: string;
  capabilities?: string[];
}
