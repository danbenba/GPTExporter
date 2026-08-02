export type ExportFormat = 'markdown' | 'html' | 'json' | 'text' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeUserMessages: boolean;
  includeAssistantMessages: boolean;
  includeThoughts: boolean;
  includeToolBlocks: boolean;
  includeCitations: boolean;
  includeTimestamps: boolean;
  includeMetadataHeader: boolean;
  embedImages: boolean;
  messageLimit: number | null;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'markdown',
  includeUserMessages: true,
  includeAssistantMessages: true,
  includeThoughts: false,
  includeToolBlocks: false,
  includeCitations: true,
  includeTimestamps: false,
  includeMetadataHeader: true,
  embedImages: true,
  messageLimit: null,
};

export const EXPORT_FORMATS: Array<{ id: ExportFormat; extension: string; mime: string }> = [
  { id: 'markdown', extension: 'md', mime: 'text/markdown' },
  { id: 'html', extension: 'html', mime: 'text/html' },
  { id: 'json', extension: 'json', mime: 'application/json' },
  { id: 'text', extension: 'txt', mime: 'text/plain' },
  { id: 'pdf', extension: 'pdf', mime: 'application/pdf' },
];
