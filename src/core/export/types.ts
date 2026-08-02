import type { ApiConversationWithId } from '@/core/model/conversation';
import type { ExportFormat, ExportOptions } from '@/core/model/export-options';
import type { NormalizedConversation } from '@/core/model/normalized';

export interface AssetMap {
  [assetPointer: string]: string;
}

export interface ExportInput {
  conversation: NormalizedConversation;
  raw: ApiConversationWithId;
  options: ExportOptions;
  assets: AssetMap;
  locale: string;
}

export interface ExportArtifact {
  kind: 'download' | 'print';
  filename: string;
  mime: string;
  content: string;
}

export interface Exporter {
  format: ExportFormat;
  build(input: ExportInput): Promise<ExportArtifact>;
}
