export const shadowStyles = `
:host {
  all: initial;
}
* { box-sizing: border-box; margin: 0; padding: 0; }

.gptx-root {
  --font: ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
  --spring: linear(0, .00506 1.18%, .02044 2.46%, .08322 5.391%, .46561 17.652%, .63901 24.342%, .76663 31.093%, .85981 38.454%, .89862 42.934%, .92965 47.845%, .95366 53.305%, .97154 59.516%, .99189 74.867%, .9991);
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}
.gptx-root[data-theme="dark"] {
  --bg-primary: #212121;
  --bg-secondary: #303030;
  --bg-tertiary: #414141;
  --bg-elevated: #1b1b1b;
  --scrim: #00000080;
  --border-default: #ffffff26;
  --border-light: #ffffff0d;
  --border-xlight: #ffffff1a;
  --border-btn: rgba(255,255,255,.15);
  --text-primary: #fff;
  --text-secondary: #cdcdcd;
  --text-tertiary: #9b9b9b;
  --text-inverted: #0d0d0d;
  --surface-hover: rgba(255,255,255,.1);
  --accent: #3a83f7;
  --btn-primary-bg: #f9f9f9;
  --btn-primary-bg-hover: #ececec;
  --danger: #ff8583;
  --success: #53b559;
  --shadow-long: 0 8px 16px rgba(0,0,0,.32), inset 0 0 1px rgba(255,255,255,.2), 0 0 1px rgba(0,0,0,.62);
  color-scheme: dark;
}
.gptx-root[data-theme="light"] {
  --bg-primary: #fff;
  --bg-secondary: #f1f1f1;
  --bg-tertiary: #ececec;
  --bg-elevated: #f9f9f9;
  --scrim: rgba(0,0,0,.5);
  --border-default: #00000026;
  --border-light: #0000000d;
  --border-xlight: #0000001a;
  --border-btn: rgba(0,0,0,.15);
  --text-primary: #0d0d0d;
  --text-secondary: #5d5d5d;
  --text-tertiary: #8f8f8f;
  --text-inverted: #fff;
  --surface-hover: rgba(0,0,0,.07);
  --accent: #3a83f7;
  --btn-primary-bg: #0d0d0d;
  --btn-primary-bg-hover: #2f2f2f;
  --danger: #ba2623;
  --success: #3a843f;
  --shadow-long: 0 8px 16px rgba(0,0,0,.16), 0 0 1px rgba(0,0,0,.4);
  color-scheme: light;
}

.gptx-overlay {
  position: absolute;
  inset: 0;
  background: var(--scrim);
  opacity: 0;
  transition: opacity .2s ease;
}
.gptx-root.open .gptx-overlay { opacity: 1; }

.gptx-modal {
  position: relative;
  width: 460px;
  max-width: calc(100vw - 32px);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-long);
  opacity: 0;
  transform: scale(.96) translateY(8px);
  transition: opacity .22s ease, transform .5s var(--spring);
}
.gptx-root.open .gptx-modal { opacity: 1; transform: scale(1) translateY(0); }
.gptx-root.closing .gptx-overlay { opacity: 0; }
.gptx-root.closing .gptx-modal { opacity: 0; transform: scale(.97) translateY(6px); transition: opacity .15s ease, transform .15s ease; }

.gptx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 8px 24px;
}
.gptx-title { font-size: 18px; font-weight: 400; }
.gptx-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
}
.gptx-close:hover { background: var(--surface-hover); }
.gptx-close svg { width: 20px; height: 20px; }

.gptx-body {
  padding: 8px 24px 16px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-default) transparent;
}

.gptx-section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  letter-spacing: .02em;
  margin: 16px 0 8px;
}
.gptx-section-label:first-child { margin-top: 4px; }

.gptx-select-wrap { position: relative; }
.gptx-select {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--border-btn);
  border-radius: 10px;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease;
}
.gptx-select:hover { background: var(--surface-hover); }
.gptx-select svg.fmt { width: 18px; height: 18px; color: var(--text-secondary); }
.gptx-select .chev {
  margin-left: auto;
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  transition: transform .18s ease;
  display: flex;
}
.gptx-select[aria-expanded="true"] .chev { transform: rotate(180deg); }
.gptx-select .chev svg { width: 16px; height: 16px; }
.gptx-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 16px rgba(0,0,0,.32), 0 0 1px rgba(0,0,0,.62);
  opacity: 0;
  transform: scale(.98) translateY(-4px);
  pointer-events: none;
  transition: opacity .14s ease, transform .18s ease;
}
.gptx-menu.open {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}
.gptx-menu-item {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 14px;
  cursor: pointer;
}
.gptx-menu-item:hover { background: var(--surface-hover); }
.gptx-menu-item svg.fmt { width: 18px; height: 18px; color: var(--text-secondary); }
.gptx-menu-item .tick {
  margin-left: auto;
  width: 16px;
  height: 16px;
  color: var(--text-primary);
  visibility: hidden;
  display: flex;
}
.gptx-menu-item .tick svg { width: 16px; height: 16px; }
.gptx-menu-item.selected .tick { visibility: visible; }

.gptx-disclosure {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0 10px;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.gptx-disclosure:hover { color: var(--text-primary); }
.gptx-disclosure .chev {
  width: 15px;
  height: 15px;
  display: flex;
  transition: transform .18s ease;
}
.gptx-disclosure .chev svg { width: 15px; height: 15px; }
.gptx-disclosure[aria-expanded="true"] .chev { transform: rotate(180deg); }
.gptx-adv {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height .28s ease, opacity .2s ease;
}
.gptx-adv.open { max-height: 480px; opacity: 1; }

.gptx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light);
}
.gptx-row:last-child { border-bottom: 0; }
.gptx-row-text { min-width: 0; }
.gptx-row-label { font-size: 14px; color: var(--text-primary); }
.gptx-row-hint { font-size: 12px; color: var(--text-tertiary); margin-top: 1px; }

.gptx-switch {
  flex: none;
  width: 28px;
  height: 16px;
  border-radius: 9999px;
  border: 0;
  background: var(--bg-tertiary);
  position: relative;
  cursor: pointer;
  transition: background .15s ease;
}
.gptx-switch[aria-checked="true"] { background: var(--accent); }
.gptx-switch .knob {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.3);
  transform: scale(.85);
  transition: transform .1s ease, left .1s ease;
}
.gptx-switch[aria-checked="true"] .knob { left: 12px; }

.gptx-scope { display: flex; gap: 8px; align-items: center; }
.gptx-chip {
  height: 32px;
  padding: 0 14px;
  border-radius: 9999px;
  border: 1px solid var(--border-btn);
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease;
}
.gptx-chip:hover { background: var(--surface-hover); }
.gptx-chip.selected {
  background: var(--btn-primary-bg);
  color: var(--text-inverted);
  border-color: transparent;
}
.gptx-count {
  width: 72px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 13px;
  text-align: center;
  outline: none;
  display: none;
}
.gptx-count.visible { display: block; }
.gptx-count:focus { border-color: var(--accent); }

.gptx-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 24px 20px;
}
.gptx-status {
  display: none;
  align-items: center;
  gap: 10px;
  margin-right: auto;
  font-size: 13px;
  color: var(--text-tertiary);
}
.gptx-status.visible { display: flex; }
.gptx-status.error { color: var(--danger); }
.gptx-status.success { color: var(--success); }
.gptx-status svg { width: 16px; height: 16px; }

.gptx-btn {
  height: 36px;
  min-height: 36px;
  padding: 0 16px;
  white-space: nowrap;
  flex: none;
  border-radius: 9999px;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease, opacity .15s ease;
}
.gptx-btn:disabled { opacity: .55; cursor: default; }
.gptx-btn-secondary {
  background: var(--bg-primary);
  border-color: var(--border-btn);
  color: var(--text-primary);
}
.gptx-btn-secondary:hover:not(:disabled) { background: var(--surface-hover); }
.gptx-btn-primary {
  background: var(--btn-primary-bg);
  color: var(--text-inverted);
}
.gptx-btn-primary:hover:not(:disabled) { background: var(--btn-primary-bg-hover); }

.gptx-spinner {
  width: 16px;
  height: 16px;
  flex: none;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-right-color: currentColor;
  animation: gptx-spin .7s linear infinite;
}
@keyframes gptx-spin { to { transform: rotate(360deg); } }

.gptx-check {
  animation: gptx-pop .35s var(--spring);
}
@keyframes gptx-pop {
  0% { transform: scale(.4); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
`;
