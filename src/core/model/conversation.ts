export type AuthorRole = 'system' | 'user' | 'assistant' | 'tool';

export interface MessageAuthor {
  role: AuthorRole;
  name?: string | null;
  metadata?: Record<string, unknown>;
}

export interface TextContent {
  content_type: 'text';
  parts: string[];
}

export interface CodeContent {
  content_type: 'code';
  language?: string;
  text: string;
}

export interface ExecutionOutputContent {
  content_type: 'execution_output';
  text: string;
}

export interface ImageAssetPointer {
  content_type: 'image_asset_pointer';
  asset_pointer: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  metadata?: Record<string, unknown> | null;
}

export interface AudioAssetPointer {
  content_type: 'audio_asset_pointer';
  asset_pointer: string;
  format?: string;
  metadata?: Record<string, unknown> | null;
}

export interface AudioTranscriptionPart {
  content_type: 'audio_transcription';
  text: string;
}

export type MultimodalPart =
  | string
  | ImageAssetPointer
  | AudioAssetPointer
  | AudioTranscriptionPart;

export interface MultimodalTextContent {
  content_type: 'multimodal_text';
  parts: MultimodalPart[];
}

export interface TetherQuoteContent {
  content_type: 'tether_quote';
  url?: string;
  domain?: string;
  title?: string;
  text: string;
}

export interface TetherBrowsingDisplayContent {
  content_type: 'tether_browsing_display';
  result: string;
  summary?: string;
}

export interface SystemErrorContent {
  content_type: 'system_error';
  name?: string;
  text: string;
}

export interface UserEditableContextContent {
  content_type: 'user_editable_context';
  user_profile?: string;
  user_instructions?: string;
}

export interface ThoughtsContent {
  content_type: 'thoughts';
  thoughts: Array<{ summary?: string; content?: string }>;
}

export interface ReasoningRecapContent {
  content_type: 'reasoning_recap';
  content: string;
}

export type MessageContent =
  | TextContent
  | CodeContent
  | ExecutionOutputContent
  | MultimodalTextContent
  | TetherQuoteContent
  | TetherBrowsingDisplayContent
  | SystemErrorContent
  | UserEditableContextContent
  | ThoughtsContent
  | ReasoningRecapContent;

export interface Citation {
  start_ix?: number;
  end_ix?: number;
  metadata?: {
    url?: string;
    title?: string;
    text?: string;
    [key: string]: unknown;
  };
}

export interface AttachmentMeta {
  id: string;
  name?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface MessageMetadata {
  model_slug?: string;
  default_model_slug?: string;
  citations?: Citation[];
  content_references?: Array<Record<string, unknown>>;
  attachments?: AttachmentMeta[];
  finish_details?: { type?: string; [key: string]: unknown };
  is_visually_hidden_from_conversation?: boolean;
  canvas?: { textdoc_id?: string; version?: number; title?: string };
  [key: string]: unknown;
}

export interface ConversationMessage {
  id: string;
  author: MessageAuthor;
  create_time?: number | null;
  update_time?: number | null;
  content: MessageContent;
  status?: string;
  end_turn?: boolean | null;
  recipient?: string;
  metadata?: MessageMetadata;
}

export interface ConversationNode {
  id: string;
  parent?: string | null;
  children: string[];
  message?: ConversationMessage | null;
}

export interface ApiConversation {
  title: string;
  create_time: number;
  update_time: number;
  current_node: string;
  conversation_id?: string;
  mapping: Record<string, ConversationNode>;
}

export interface ApiConversationWithId extends ApiConversation {
  id: string;
}
