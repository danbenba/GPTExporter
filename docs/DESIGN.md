# ChatGPT Design Reference (captured live on chatgpt.com, dark/OLED theme, 2026-08)

## Global
- Body: `background #000` (OLED), `color #fff`, font `-apple-system-body, ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif`, 16px base.
- Theme class on `<html>`: `dark`.

## Core CSS variables (dark)
| Token | Value |
|---|---|
| `--bg-primary` | `#212121` |
| `--bg-secondary` | `#303030` |
| `--bg-tertiary` | `#414141` |
| `--bg-elevated-primary` | `#1b1b1b` |
| `--bg-elevated-secondary` | `#000` |
| `--bg-scrim` | `#00000080` |
| `--bg-tooltip` | `#1b1b1b` |
| `--border-default` | `#ffffff26` |
| `--border-heavy` | `#fff3` |
| `--border-light` | `#ffffff0d` |
| `--border-extra-light` | `#ffffff1a` |
| `--text-primary` | `#fff` |
| `--text-secondary` | `#cdcdcd` (gray-300) |
| `--text-tertiary` | `#9b9b9b` (gray-500) |
| `--text-inverted` | `#0d0d0d` |
| `--icon-secondary` | `#cdcdcd` |
| `--icon-tertiary` | `#afafaf` |

## Palette
gray: 25 `#fcfcfc` · 50 `#f9f9f9` · 100 `#ececec` · 200 `#e3e3e3` · 300 `#cdcdcd` · 400 `#b4b4b4` · 500 `#9b9b9b` · 600 `#676767` · 700 `#424242` · 750 `#2f2f2f` · 800 `#212121` · 900 `#171717` · 950 `#0d0d0d`

blue: 200 `#63a8f8` · 300 `#539af8` · 400 `#3a83f7` (accent) · 500 `#2c67c5`
red: 400 `#fa423e` · 500 `#ff002a` (danger)
green: 400 `#53b559` · 500 `#48a04c`

## Motion
- `--spring-fast`: `.667s linear(0, .01942 1.83%, …, .99988)`
- `--spring-common`: `.667s linear(0, .00506 1.18%, …, .9991)`
- Toggle knob transition: `.1s`.

## Modal (Settings dialog, `role="dialog"`)
- Classes: `popover bg-token-bg-primary rounded-2xl shadow-long`
- `background #212121`, `border-radius 16px`, `max-width 680px`, `height 600px`, `max-height 85vh`
- `shadow-long`: `0 8px 16px rgba(0,0,0,.32), inset 0 0 1px rgba(255,255,255,.2), 0 0 1px rgba(0,0,0,.62)`
- Title: 18px, weight 400. Close button 36×36, radius 8px.
- Overlay: `--bg-scrim #00000080`.

## Buttons (`.btn`)
- Pill radius (9999px), height/min-height 36px, padding `0 12px`, 14px, weight 500, inline-flex centered.
- `.btn-primary`: bg `#f9f9f9` (gray-50), text `#0d0d0d`.
- `.btn-secondary`: bg `#212121`, border `1px rgba(255,255,255,.15)`, text `#fff`.
- `.btn-danger`: bg `#ff002a`, text `#fff`.

## Toggle (`role="switch"`)
- Track 28×16 pill, on = `#3a83f7` (blue-400), knob 16×16 white circle, transition .1s.

## Header (conversation top bar)
- Container: `#conversation-header-actions` — `flex items-center justify-center gap-2 rounded-lg translucent-surface`.
- Icon buttons (share `[data-testid="share-chat-button"]`): 36×36, radius 8px, transparent bg, `hover:bg-token-surface-hover`.
- Adobe Acrobat injected button (reference for placement): `<button id="acrobat-chatgpt-convert-to-pdf">` inside a sibling `div.flex.items-center.justify-end` BEFORE `#conversation-header-actions`; 36px tall, radius 8px, bg `#000`, 14px/500, padding `8px 14px`, icon + label.

## Message action bar (assistant turns)
- Bar = parent of `[data-testid="copy-turn-action-button"]`, classes include `-ms-2.5 -me-1 flex flex-wrap items-center p-1 select-none` + hover mask reveal (`[mask-image:linear-gradient(...)]`, revealed via `group-hover/turn-messages`).
- Buttons 32×32, radius 8px (`rounded-lg`), color `#cdcdcd` (`text-token-text-secondary`), `hover:bg-token-surface-hover`.
- Known testids: `copy-turn-action-button`, plus share/retry/more.
- Adobe per-message button: 28px tall, 13px/500, padding `4px 8px`, radius 8px, transparent bg, icon + « Convertir en PDF ».

## Select-ish dropdown trigger (settings)
- Height 36, radius 8px, padding `0 12px`, 14px, transparent bg.

## Light theme (standard ChatGPT values)
- bg-primary `#fff`, elevated `#f9f9f9`, scrim `rgba(0,0,0,.5)`, text primary `#0d0d0d`, secondary `#5d5d5d`, borders `rgba(0,0,0,.1)/.15`, surface-hover `rgba(0,0,0,.05)`.
- Dark surface-hover: `rgba(255,255,255,.1)`.
