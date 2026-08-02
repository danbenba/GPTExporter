# Privacy Policy — GPT Exporter

**Last updated: 2 August 2026**

GPT Exporter is a Chrome extension that exports your own ChatGPT conversations to a file on your computer.

## Summary

**GPT Exporter does not collect, transmit, sell, or share any user data.** Everything happens locally in your browser. There is no developer server, no analytics, no tracking, and no third-party service involved.

## What the extension accesses

To build an export, the extension reads the conversation you are currently viewing on `chatgpt.com`. It does this by calling ChatGPT's own API from the page itself, using the session you are already signed in to:

- `GET https://chatgpt.com/api/auth/session` — to obtain the short-lived access token the ChatGPT web app itself uses.
- `GET https://chatgpt.com/backend-api/conversation/{id}` — to read the conversation you asked to export.
- `GET https://chatgpt.com/backend-api/files/{id}/download` — only when an export includes images, to resolve them.

These requests go to OpenAI's servers only, from your own browser, under your own session. They are the same requests the ChatGPT website already makes. No data is ever sent to the developer or to any third party.

The resulting file (Markdown, HTML, JSON, TXT, or PDF) is written directly to your device through the browser's normal download or print flow.

## What is stored

The extension stores a single object in `chrome.storage.local`: your export preferences (chosen format, which toggles are enabled, and the message-count setting). This contains no conversation content and no personal information. It stays on your device and is removed when you uninstall the extension.

## Access tokens

The ChatGPT access token is held in memory only, for the duration of an export, and is used solely to authenticate the read requests listed above against OpenAI's servers. It is never stored, logged, or transmitted anywhere else.

## Permissions

- `storage` — to remember your export preferences between sessions.
- Host access to `https://chatgpt.com/*` and `https://chat.openai.com/*` — required to display the export buttons on the ChatGPT interface and to read the conversation you choose to export. The extension is inactive on every other website.

## Remote code

The extension executes no remote code. All JavaScript and CSS ships inside the extension package.

## Changes

Any change to this policy will be published in this file in the public repository:
https://github.com/danbenba/GPTExporter

## Contact

Questions or concerns: https://github.com/danbenba/GPTExporter/issues
