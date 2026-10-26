# Security

A local app: a Node server bound to 127.0.0.1 and a static page. It handles personal documents (birth certificates, IDs), so originals live outside the repository and can be deleted per project. Runtime dependencies: `@anthropic-ai/sdk`, `zod`, `mammoth`, `docx`.

## Protections

- Listens only on 127.0.0.1; rejects requests whose `Host` isn't `localhost`/`127.0.0.1`, and non-GET requests from any other `Origin` (blocks cross-site requests and DNS rebinding).
- Content-Security-Policy `default-src 'self'`; the page builds text with `textContent`, never `innerHTML`.
- The API key is read from the macOS Keychain at request time and never written to disk, logs or the page.
- Client data lives outside the repository (`~/Documents/Translation Desk`); `.gitignore` also excludes `data/`, `samples/` and `eval-results/`.
- Everything loaded from disk and every reply from Claude is validated (Zod schema for replies, `clean*` functions for stored data). Text inside documents is treated as content to translate, not instructions.
- CSV exports prefix cells that start with `=`, `+`, `-`, `@` so spreadsheets don't run them as formulas.

## Reporting a vulnerability

Use **Security → Report a vulnerability** on the GitHub repository. Please don't open a public issue.
