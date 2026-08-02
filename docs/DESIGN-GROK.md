# Grok Design Reference (captured live on grok.com, dark theme, 2026-08)

## Global
- Body: `background #050505`, `color #fcfcfc`.
- Font: `universalSans, Inter, Roboto, "Open Sans", Arial, sans-serif, ui-sans-serif, system-ui`.
- Theme class on `<html>`: `dark`.

## Tokens (dark)
| Token | Raw value | Resolved |
|---|---|---|
| `--background` | `oklch(17.8% .0048 274.69)` | near `#0b0b0e` |
| `--popover` | `oklch(33.11% 0 none)` | mid grey elevated |
| `--surface-l1` | `0 0% 8%` | `#141414` |
| `--surface-l2` | `0 0% 13%` | `#212121` |
| `--surface-l3` / `--surface-l4` | `0 0% 21%` | `#363636` |
| `--primary` | `0 0% 99%` | `#fcfcfc` |
| `--primary-foreground` | `0 0% 9%` | `#171717` |
| `--secondary` / `--fg-secondary` | `0 0% 62%` | `#9e9e9e` |
| `--muted-foreground` | `0 0% 63.9%` | `#a3a3a3` |
| `--accent` | `240 4% 16%` | `#27272a` |
| `--destructive` | `0 62.8% 30.6%` | `#7f1d1d` |
| `--border-l1` | `oklch(99.24% 0 none/.08)` | `rgba(255,255,255,.08)` |
| `--border-l2` | `oklch(99.24% 0 none/.14)` | `rgba(255,255,255,.14)` |
| `--radius` | `.5rem` (8px) | |

## Messages
- User bubble: background `#141414` (surface-l1), radius `24px 24px 8px` (asymmetric bottom-right), padding `8px 16px`, font 15px.
- Assistant: plain text on page background.
- Message action bar: `flex items-center gap-[2px] w-max rounded-lg text-xs px-2`; icon buttons 32×32, pill radius, colour `#9e9e9e`.

## API (verified live)
Three calls, all same-origin `GET`/`POST` with `credentials: 'include'`, no extra headers:

1. `GET /rest/app-chat/conversations/{conversationId}`
   → `{ conversationId, title, starred, createTime, modifyTime, systemPromptName, temporary, mediaTypes, workspaces, taskResult, latestAssetMetadata, viewerIsOwner }`

2. `GET /rest/app-chat/conversations/{conversationId}/responses`
   → `{ responses: [...], inflightResponses: [...] }` — assistant entries come back with an **empty `message`**, so this call alone is not enough.

3. `POST /rest/app-chat/conversations/{conversationId}/load-responses`
   body `{ "responseIds": ["<id>", ...] }`
   → `{ responses: [...] }` with the **full `message` text** and `model`.

`/response-node` returns **501** and `/response-nodes` **404** — neither is usable.

### Response entry fields
`responseId`, `message`, `sender` (`"human"` / `"ASSISTANT"` — note the uppercase), `createTime`, `manual`, `partial`, `shared`, `query`, `queryType`, `webSearchResults`, `citedWebSearchResults`, `xpostIds`, `xposts`, `citedXposts`, `generatedImageUrls`, `imageAttachments`, `fileAttachments`, `fileAttachmentsMetadata`, `fileAttachmentAssetMetadata`, `fileUris`, `cardAttachmentsJson`, `isControl`, `steps`, `imageEditUris`, `mediaTypes`, `webpageUrls`, `metadata`, `toolResponses`, `ragResults`, `citedRagResults`, `searchProductResults`, `connectorSearchResults`, `collectionSearchResults`, `streamErrors`, `inputChunks`, `outputChunks`, `model`.

There is **no `parentResponseId`** on these entries — the list is already a flat, ordered transcript, so no tree walking is required.

## Routing
- Conversation URL: `https://grok.com/c/{uuid}` (a `?rid=` query may follow).
