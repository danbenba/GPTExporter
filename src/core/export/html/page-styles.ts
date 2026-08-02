export const pageStyles = `
:root {
  color-scheme: dark;
  --bg: #000;
  --bg-elevated: #1b1b1b;
  --surface: #212121;
  --bubble: #303030;
  --border: #ffffff26;
  --border-light: #ffffff0d;
  --text: #fff;
  --text-secondary: #cdcdcd;
  --text-tertiary: #9b9b9b;
  --accent: #3a83f7;
  --code-bg: #0d0d0d;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}
.page {
  max-width: 48rem;
  margin: 0 auto;
  padding: 48px 24px 96px;
}
header.meta {
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 24px;
  margin-bottom: 40px;
}
header.meta h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px;
}
header.meta .meta-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 16px;
  font-size: 13px;
  color: var(--text-tertiary);
}
header.meta .meta-grid a { color: var(--text-secondary); }
.turn { margin-bottom: 28px; }
.turn-user { display: flex; justify-content: flex-end; }
.turn-user .bubble {
  background: var(--bubble);
  border-radius: 24px;
  padding: 10px 20px;
  max-width: 80%;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
.turn-assistant .content { max-width: 100%; }
.turn-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 6px;
}
.turn-user .turn-label { text-align: right; }
.timestamp { font-weight: 400; text-transform: none; letter-spacing: 0; }
p { margin: 0 0 16px; }
h3, h4, h5, h6 { margin: 24px 0 12px; font-weight: 600; }
ul, ol { margin: 0 0 16px; padding-left: 24px; }
li { margin: 4px 0; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
blockquote {
  border-left: 2px solid var(--border);
  margin: 0 0 16px;
  padding: 0 0 0 16px;
  color: var(--text-secondary);
}
code {
  background: #ffffff0d;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 1px 6px;
  font-family: ui-monospace, "Cascadia Code", "Segoe UI Mono", Consolas, monospace;
  font-size: 13.6px;
}
pre.codeblock {
  background: var(--code-bg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  margin: 0 0 16px;
  overflow: hidden;
}
pre.codeblock .codeblock-head {
  background: #2f2f2f;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  padding: 8px 16px;
}
pre.codeblock code {
  display: block;
  background: transparent;
  border: 0;
  padding: 16px;
  overflow-x: auto;
  white-space: pre;
  font-size: 13.6px;
  line-height: 1.6;
}
table {
  border-collapse: collapse;
  margin: 0 0 16px;
  width: 100%;
  font-size: 14.5px;
}
th, td {
  border: 1px solid var(--border-light);
  padding: 8px 12px;
  text-align: left;
}
th { background: #ffffff0d; }
img.chat-image {
  max-width: 100%;
  border-radius: 16px;
  margin: 0 0 16px;
}
details.thought {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 10px 16px;
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 14.5px;
}
details.thought summary {
  cursor: pointer;
  color: var(--text-tertiary);
  font-weight: 500;
}
.sources {
  border-top: 1px solid var(--border-light);
  margin-top: 12px;
  padding-top: 8px;
  font-size: 13.5px;
  color: var(--text-tertiary);
}
.sources ul { margin: 4px 0 0; }
footer.credits {
  margin-top: 64px;
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
}
@media print {
  :root { --bg: #fff; --text: #0d0d0d; --text-secondary: #424242; --text-tertiary: #676767; --bubble: #f1f1f1; --code-bg: #f9f9f9; --border: #00000026; --border-light: #0000001a; --accent: #2c67c5; }
  body { background: #fff; }
  .page { padding: 0; max-width: 100%; }
  pre.codeblock { break-inside: avoid; }
  .turn { break-inside: avoid-page; }
  pre.codeblock .codeblock-head { background: #ececec; color: #424242; }
  code { background: #00000008; }
  th { background: #00000008; }
}
`;
