import { escapeHtml } from './mini-markdown';
import { pageStyles } from './page-styles';

export interface HtmlPageInput {
  title: string;
  lang: string;
  metaRows: Array<[string, string]>;
  body: string;
  creditText: string;
  creditUrl: string;
  copiedLabel: string;
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
<footer class="credits">${escapeHtml(input.creditText)}<a href="${escapeHtml(input.creditUrl)}" target="_blank" rel="noopener">${escapeHtml(input.creditUrl.replace(/^https?:\/\//, ''))}</a></footer>
</div>
<script>
var COPIED_LABEL = ${JSON.stringify(input.copiedLabel)};
document.addEventListener('click', function (event) {
  var button = event.target.closest('[data-copy]');
  if (!button) return;
  var container = button.closest('pre, .writing-card');
  var source = container ? container.querySelector('code, .writing-body') : null;
  if (!source) return;
  navigator.clipboard.writeText(source.innerText).then(function () {
    var previous = button.textContent;
    button.textContent = COPIED_LABEL;
    setTimeout(function () { button.textContent = previous; }, 1500);
  });
});
</script>
</body>
</html>`;
}
