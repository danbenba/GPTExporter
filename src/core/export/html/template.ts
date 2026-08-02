import { escapeHtml } from './mini-markdown';
import { pageStyles } from './page-styles';

export interface HtmlPageInput {
  title: string;
  lang: string;
  metaRows: Array<[string, string]>;
  body: string;
  footer: string;
}

export function renderHtmlPage(input: HtmlPageInput): string {
  const meta = input.metaRows
    .map(([label, value]) => `<span>${escapeHtml(label)}</span><span>${value}</span>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="${input.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(input.title)}</title>
<style>${pageStyles}</style>
</head>
<body>
<div class="page">
<header class="meta">
<h1>${escapeHtml(input.title)}</h1>
<div class="meta-grid">
${meta}
</div>
</header>
<main>
${input.body}
</main>
<footer class="credits">${escapeHtml(input.footer)}</footer>
</div>
</body>
</html>`;
}
