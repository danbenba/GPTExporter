# Gemini Design Reference (captured live on gemini.google.com, dark theme, 2026-08)

## Global
- Page background `#0f0f0f`, text `#e3e3e3`.
- Font: `"Google Sans Flex", "Google Sans", Helvetica, Arial, sans-serif` (measured on `.query-text`; the `<body>` itself inherits a serif default that components override).
- Angular application; Material 3 (`gm3-*` / `mat-*` component classes).

## Messages
- User turn: `<user-query>` → inner `.query-text.gds-body-l`, font-size 17px.
  - Bubble wrapper `.user-query-bubble-with-background`: background `#171717`, `border-radius 40px`, padding `20px 28px`.
- Model turn: `<model-response>` → `message-content` / `.markdown`, font-size 16px, width ~708px.
- Conversation column width ≈ 724px.

## Header
- Conversation actions live in `.gem-conversation-actions-menu-button.gem-button` (a `mat-mdc-menu-trigger`), top-right.
- Adobe Acrobat injects `Convertir le chat en PDF` to the left of it — the same anchoring pattern as ChatGPT.

## Routing
- Conversation URL: `https://gemini.google.com/app/{id}` where the id is a 16-character hex string (e.g. `06ab2cc531614fd7`) — **not** a UUID.

## Selectors worth relying on
| Purpose | Selector |
|---|---|
| User turn | `user-query` |
| User text | `.query-text` |
| Model turn | `model-response` |
| Model markdown | `message-content`, `.markdown` |
| Copy prompt button | `button[aria-label="Copier le prompt"]` |
| Conversation menu | `.gem-conversation-actions-menu-button` |
