export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

function flushList(items: string[], ordered: boolean, out: string[]): void {
  if (items.length === 0) return;
  const tag = ordered ? 'ol' : 'ul';
  out.push(`<${tag}>${items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`);
  items.length = 0;
}

function renderTable(rows: string[]): string {
  const cells = rows
    .filter((row) => !/^\s*\|?[\s:-]+\|[\s|:-]*$/.test(row))
    .map((row) =>
      row
        .replace(/^\s*\|/, '')
        .replace(/\|\s*$/, '')
        .split('|')
        .map((cell) => inline(cell.trim())),
    );
  if (cells.length === 0) return '';
  const [head, ...body] = cells;
  const thead = `<thead><tr>${head.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead>`;
  const tbody = body.length
    ? `<tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`
    : '';
  return `<table>${thead}${tbody}</table>`;
}

export function renderMarkdown(source: string): string {
  const lines = source.split('\n');
  const out: string[] = [];
  const listItems: string[] = [];
  let listOrdered = false;
  let inFence = false;
  let fenceLang = '';
  let fenceLines: string[] = [];
  let tableRows: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const flushTable = () => {
    if (tableRows.length > 0) {
      out.push(renderTable(tableRows));
      tableRows = [];
    }
  };

  for (const line of lines) {
    if (inFence) {
      if (/^\s*```/.test(line)) {
        out.push(
          `<pre class="codeblock"><div class="codeblock-head">${escapeHtml(fenceLang)}</div><code>${escapeHtml(fenceLines.join('\n'))}</code></pre>`,
        );
        inFence = false;
        fenceLines = [];
        fenceLang = '';
      } else {
        fenceLines.push(line);
      }
      continue;
    }

    const fenceMatch = line.match(/^\s*```(\S*)/);
    if (fenceMatch) {
      flushParagraph();
      flushList(listItems, listOrdered, out);
      flushTable();
      inFence = true;
      fenceLang = fenceMatch[1] ?? '';
      continue;
    }

    if (/^\s*\|.*\|/.test(line)) {
      flushParagraph();
      flushList(listItems, listOrdered, out);
      tableRows.push(line);
      continue;
    }
    flushTable();

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList(listItems, listOrdered, out);
      const level = Math.min(heading[1].length + 2, 6);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      flushParagraph();
      flushList(listItems, listOrdered, out);
      out.push('<hr>');
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList(listItems, listOrdered, out);
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (unordered || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (listItems.length > 0 && listOrdered !== isOrdered) {
        flushList(listItems, listOrdered, out);
      }
      listOrdered = isOrdered;
      listItems.push(inline((unordered ?? ordered)![1]));
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushList(listItems, listOrdered, out);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inFence) {
    out.push(`<pre class="codeblock"><code>${escapeHtml(fenceLines.join('\n'))}</code></pre>`);
  }
  flushParagraph();
  flushList(listItems, listOrdered, out);
  flushTable();
  return out.join('\n');
}
