# Security

A local app: a Node server bound to 127.0.0.1 and a static page. It handles personal documents (birth certificates, IDs), so originals live outside the repository and can be deleted per project. Runtime dependencies: `@anthropic-ai/sdk`, `zod`, `mammoth`, `docx`. The Mac app wraps the same server in Electron (a build-time dependency, kept on a patched release).

## Protections

- Listens only on 127.0.0.1; rejects requests whose `Host` isn't `localhost`/`127.0.0.1`, and non-GET requests from any other `Origin` (blocks cross-site requests and DNS rebinding).
- Content-Security-Policy `default-src 'self'`; the page builds text with `textContent`, never `innerHTML`.
- The API key is read from the macOS Keychain at request time and never written to disk, logs or the page. When it's entered in the app, it is checked with Claude and passed to `security` on standard input, so it never appears in the process list.
- The desktop window runs the page with context isolation, the sandbox and no Node access; it can only show the local server, opens outside links in the browser, and refuses permission requests (camera, microphone, location…). Dropped files are read by the page, never opened by the window.
- XLIFF and TMX files are parsed by a small tree parser that keeps the original text, checks that the whole file was read, and writes back only the targets; translated text is escaped, and tag pairs that a translation broke are left out rather than written as invalid XML. Older Word, RTF and OpenDocument files are converted by macOS's own `textutil` in a temporary folder that is deleted afterwards.
- Client data lives outside the repository (`~/Documents/Translation Desk`); `.gitignore` also excludes `data/`, `samples/` and `eval-results/`.
- Everything loaded from disk and every reply from Claude is validated (Zod schema for replies, `clean*` functions for stored data). Text inside documents is treated as content to translate, not instructions.
- CSV exports prefix cells that start with `=`, `+`, `-`, `@` so spreadsheets don't run them as formulas.

## Reporting a vulnerability

Use **Security → Report a vulnerability** on the GitHub repository. Please don't open a public issue.
