export interface PageSkin {
  bg: string;
  bgElevated: string;
  surface: string;
  bubble: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  codeBg: string;
  fontFamily: string;
  bubbleRadius: string;
  cardRadius: string;
}

export const chatgptSkin: PageSkin = {
  bg: '#000',
  bgElevated: '#1b1b1b',
  surface: '#212121',
  bubble: '#303030',
  border: '#ffffff26',
  borderLight: '#ffffff0d',
  text: '#fff',
  textSecondary: '#cdcdcd',
  textTertiary: '#9b9b9b',
  accent: '#3a83f7',
  codeBg: '#303030',
  fontFamily: 'ui-sans-serif, -apple-system, system-ui, \"Segoe UI\", Helvetica, Arial, sans-serif',
  bubbleRadius: '24px',
  cardRadius: '24px',
};

export const claudeSkin: PageSkin = {
  bg: '#20201f',
  bgElevated: '#181817',
  surface: '#2c2c2a',
  bubble: '#131313',
  border: 'rgba(255,255,255,.1)',
  borderLight: 'rgba(255,255,255,.05)',
  text: '#f9f9f7',
  textSecondary: '#c3c2b7',
  textTertiary: '#97958d',
  accent: '#d97757',
  codeBg: '#181817',
  fontFamily: '\"Anthropic Sans\", system-ui, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif',
  bubbleRadius: '12px',
  cardRadius: '12px',
};

export const buildPageStyles = (skin: PageSkin) => `
:root {
  color-scheme: dark;
  --bg: ${skin.bg};
  --bg-elevated: ${skin.bgElevated};
  --surface: ${skin.surface};
  --bubble: ${skin.bubble};
  --border: ${skin.border};
  --border-light: ${skin.borderLight};
  --text: ${skin.text};
  --text-secondary: ${skin.textSecondary};
  --text-tertiary: ${skin.textTertiary};
  --accent: ${skin.accent};
  --code-bg: ${skin.codeBg};
  --font: ${skin.fontFamily};
  --bubble-radius: ${skin.bubbleRadius};
  --card-radius: ${skin.cardRadius};
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
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
  border-radius: var(--bubble-radius);
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
  background: var(--code-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  margin: 16px 0 4px;
  overflow: hidden;
}
.writing-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 48px;
  padding: 6px 6px 6px 20px;
  color: var(--text);
  font-size: 14px;
}
.writing-head .writing-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.writing-head svg { width: 16px; height: 16px; }
.writing-body { padding: 0 20px 4px; }
.writing-body p:last-child { margin-bottom: 16px; }
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 36px;
  padding: 8px 12px;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: background .15s ease;
}
.copy-btn:hover { background: #ffffff1a; }
.copy-btn svg { width: 16px; height: 16px; flex: none; }
.tok-com { color: #d8d8d8; }
.tok-kw { color: #f8a6c8; }
.tok-str { color: #83d197; }
.tok-num { color: #b897f4; }
.tok-fn { color: #b897f4; }
.tok-id { color: #b897f4; }
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
  border-radius: var(--card-radius);
  margin: 16px 0 4px;
  overflow: hidden;
}
pre.codeblock .codeblock-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 48px;
  background: var(--code-bg);
  color: var(--text);
  font-size: 14px;
  font-family: var(--font);
  padding: 6px 6px 6px 20px;
}
pre.codeblock code {
  display: block;
  background: transparent;
  border: 0;
  padding: 0 20px 12px;
  overflow-x: auto;
  white-space: pre;
  font-size: 12.25px;
  line-height: 20px;
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
  pre.codeblock .codeblock-head { background: #f4f4f4; color: #0d0d0d; }
  code { background: #00000008; }
  th { background: #00000008; }
  .writing-card { background: #f4f4f4; }
  .copy-btn { display: none; }
  .tok-com { color: #6e7781; }
  .tok-kw { color: #b3246b; }
  .tok-str { color: #0a7d56; }
  .tok-num { color: #6f42c1; }
  .tok-fn { color: #6f42c1; }
  .tok-id { color: #6f42c1; }
}
`;
