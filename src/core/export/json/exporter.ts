import { buildFilename } from '@/core/export/filename';
import type { ExportArtifact, ExportInput, Exporter } from '@/core/export/types';

export const jsonExporter: Exporter = {
  format: 'json',
  async build({ conversation, raw }: ExportInput): Promise<ExportArtifact> {
    const payload = {
      exporter: 'GPT Exporter',
      exported_at: new Date().toISOString(),
      url: conversation.url,
      conversation: raw,
      normalized: conversation,
    };
    return {
      kind: 'download',
      filename: buildFilename(conversation.title, 'json'),
      mime: 'application/json',
      content: JSON.stringify(payload, null, 2),
    };
  },
};
