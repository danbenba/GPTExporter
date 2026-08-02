# Chrome Web Store — Privacy tab answers

Ready-to-paste answers for the Chrome Web Store developer dashboard. Every statement below matches the shipped code.

---

## Single purpose description

```
GPT Exporter has one purpose: to let a user save their own ChatGPT conversation as a file. On chatgpt.com the extension adds an "Export chat" button to the conversation header and an "Export message" button under each reply. Clicking either opens a dialog where the user picks a format (Markdown, HTML, JSON, TXT or PDF) and content options, and the extension then writes that conversation to a file on the user's computer. The extension does nothing else and is inactive on every other website.
```

---

## Justification — `storage` permission

```
The storage permission is used only to remember the user's export preferences between sessions, so they do not have to reconfigure the export dialog every time. A single object is written to chrome.storage.local containing the selected output format, the state of the content toggles (include sources, timestamps, reasoning, tool output, metadata header, embedded images) and the message-count setting. No conversation content, no personal data and no identifiers are stored. Nothing is synced or transmitted; the data stays on the user's device and is removed when the extension is uninstalled.
```

---

## Justification — host permission (`https://chatgpt.com/*`, `https://chat.openai.com/*`)

```
Host access to ChatGPT is required because the extension's only function is to export ChatGPT conversations, which means it must run on the ChatGPT page itself. It is needed for two things. First, to inject the user interface: the "Export chat" button in the conversation header and the "Export message" button in each message's action bar, plus the export dialog. Second, to read the conversation the user asked to export: the content script performs same-origin requests to ChatGPT's own endpoints (/api/auth/session, /backend-api/conversation/{id}, and /backend-api/files/{id}/download when images are included) using the session the user is already signed in to. These are the same requests the ChatGPT web app itself makes, they go only to OpenAI's servers, and the response is used solely to build the export file that is saved to the user's device. Reading the conversation through this API rather than scraping the page is what makes the export complete and accurate, since the page only renders the messages currently scrolled into view. No other host is requested and the extension is inactive on all other websites.
```

---

## Remote code

Select: **No, I am not using remote code.**

All JavaScript and CSS is bundled inside the extension package. There are no external `<script>` tags, no remotely hosted modules, no `eval()` and no `new Function()`.

---

## Data usage — what the extension collects

Leave **all checkboxes unchecked**.

Chrome Web Store defines collection as transmitting data off the user's device to a server the developer or a third party controls. GPT Exporter transmits nothing: it reads the conversation from ChatGPT inside the user's own browser session and writes the result straight to the user's disk. There is no developer backend, no analytics and no third-party service.

Then tick the three required certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

---

## Privacy policy URL

Publish `PRIVACY.md` and use its public URL, for example:

```
https://github.com/danbenba/GPTExporter/blob/main/PRIVACY.md
```

A page on `danbenba.dev` serving the same text works equally well.

---

## Note on `chat.openai.com`

`chat.openai.com` now permanently redirects to `chatgpt.com`, so this host pattern is most likely redundant. Reviewers reject submissions that request permissions which are not necessary. Dropping it from `host_permissions` and from the content-script matches in `src/manifest.config.ts` narrows the review surface; keep it only if support for the legacy domain is genuinely wanted.
