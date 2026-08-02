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
.turn-user {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 12px;
}
.turn-user .bubble {
  background: var(--bubble);
  border-radius: 24px;
  padding: 10px 20px;
  max-width: 75%;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
.turn-assistant .content { min-width: 0; }
.turn-time {
  font-size: 11.5px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}
.turn-user .turn-time { text-align: right; }
.writing-card {
  background: var(--bubble);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  margin: 0 0 16px;
  overflow: hidden;
}
.writing-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px 8px 16px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid var(--border-light);
}
.writing-head .writing-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.writing-head svg { width: 14px; height: 14px; }
.writing-body { padding: 14px 16px 2px; }
.writing-body p:last-child { margin-bottom: 14px; }
.copy-btn {
  border: 0;
  background: transparent;
  color: var(--text-tertiary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
}
.copy-btn:hover { background: #ffffff14; color: var(--text); }
.tok-com { color: #999; }
.tok-kw { color: #2e95d3; }
.tok-str { color: #00a67d; }
.tok-num { color: #df3079; }
.tok-fn { color: #f22c3d; }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #2f2f2f;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: ui-sans-serif, system-ui, sans-serif;
  padding: 5px 8px 5px 16px;
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
  line-height: 1.7;
  color: var(--text-tertiary);
}
footer.credits a {
  display: block;
  color: var(--text-secondary);
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
  .writing-card { background: #f7f7f8; }
  .copy-btn { display: none; }
  .tok-com { color: #6e7781; }
  .tok-kw { color: #0550ae; }
  .tok-str { color: #0a7d56; }
  .tok-num { color: #b31d70; }
  .tok-fn { color: #b02a34; }
}
`;
