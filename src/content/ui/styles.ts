export const shadowStyles = `
:host {
  all: initial;
}
* { box-sizing: border-box; margin: 0; padding: 0; }

.gptx-root {
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

.gptx-overlay {
  position: absolute;
  inset: 0;
  background: var(--scrim);
  backdrop-filter: var(--scrim-blur);
  -webkit-backdrop-filter: var(--scrim-blur);
  opacity: 0;
  transition: opacity .2s ease;
}
.gptx-root.open .gptx-overlay { opacity: 1; }

.gptx-modal {
  position: relative;
  width: 520px;
  max-width: calc(100vw - 32px);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--radius-modal);
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
  padding: 8px 24px 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--border-default) transparent;
}
.gptx-body::-webkit-scrollbar { width: 8px; }
.gptx-body::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 9999px;
}
.gptx-body::-webkit-scrollbar-track { background: transparent; }

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
.gptx-select .fmt-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--text-secondary);
}
.gptx-select .fmt-icon svg { display: block; width: 18px; height: 18px; }
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
.gptx-menu-item .fmt-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--text-secondary);
}
.gptx-menu-item .fmt-icon svg { display: block; width: 18px; height: 18px; }
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

.gptx-preview {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-secondary);
  overflow: hidden;
  margin-bottom: 4px;
}
.gptx-preview-thread {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  max-height: 168px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 42px), transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 42px), transparent 100%);
}
.gptx-preview-thread.short {
  mask-image: none;
  -webkit-mask-image: none;
}
.gptx-preview-user { display: flex; justify-content: flex-end; }
.gptx-preview-bubble {
  max-width: 85%;
  padding: 9px 18px;
  border-radius: 22px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.gptx-preview-assistant {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-primary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.gptx-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.gptx-actions .gptx-segment { flex: 1; min-width: 200px; }

.gptx-segment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--border-xlight);
  border-radius: 12px;
}
.gptx-segment-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.gptx-segment-item:hover { background: var(--surface-hover); }
.gptx-segment-item.selected {
  background: var(--btn-primary-bg);
  color: var(--text-inverted);
}
.gptx-segment-item svg { width: 16px; height: 16px; flex: none; }

.gptx-stepper {
  display: none;
  align-items: center;
  height: 32px;
  border: 1px solid var(--border-btn);
  border-radius: 9999px;
  overflow: hidden;
}
.gptx-stepper.visible { display: inline-flex; }
.gptx-step {
  width: 30px;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.gptx-step:hover { background: var(--surface-hover); color: var(--text-primary); }

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
  width: 40px;
  height: 100%;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  outline: none;
  padding: 0;
}

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
  border-radius: var(--radius-pill);
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

.gptx-spinner-svg {
  width: 18px;
  height: 18px;
  flex: none;
  display: block;
  animation: gptx-spin 1s linear infinite;
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
