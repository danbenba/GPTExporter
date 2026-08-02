import { buildFilename } from '@/core/export/filename';
import { buildConversationHtml } from '@/core/export/html/exporter';
import type { ExportArtifact, ExportInput, Exporter } from '@/core/export/types';
import type { Locale } from '@/i18n/messages';

export const pdfExporter: Exporter = {
  format: 'pdf',
  async build({ conversation, options, assets, locale }: ExportInput): Promise<ExportArtifact> {
    return {
      kind: 'print',
      filename: buildFilename(conversation.title, 'pdf'),
      mime: 'application/pdf',
      content: buildConversationHtml(conversation, options, assets, locale as Locale),
    };
  },
};
