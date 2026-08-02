import type { ExportFormat } from '@/core/model/export-options';
import { htmlExporter } from './html/exporter';
import { jsonExporter } from './json/exporter';
import { markdownExporter } from './markdown/exporter';
import { pdfExporter } from './pdf/exporter';
import { textExporter } from './text/exporter';
import type { Exporter } from './types';

const exporters: Record<ExportFormat, Exporter> = {
  markdown: markdownExporter,
  html: htmlExporter,
  json: jsonExporter,
  text: textExporter,
  pdf: pdfExporter,
};

export function getExporter(format: ExportFormat): Exporter {
  return exporters[format];
}
