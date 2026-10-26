# Translation Desk

A translation assistant for museum and exhibition text, English → Spanish, that runs on your own Mac. Claude drafts each segment and explains its judgment calls; the translator reviews, edits and approves every segment before anything is delivered.

Built by a working translator for the kind of texts museums actually send: wall panels, object labels, press releases, social posts.

## What it does

- **Reads the files museums send:** Word (`.docx`), plain text, or a label sheet (`.csv`) with a character limit per label. Lines that Word broke in the middle of a paragraph are joined back together.
- **Translates with the museum's rules:** Spanish for U.S. visitors (default), all of Latin America, Mexico or Spain; usted, tú or impersonal; and how to handle artwork titles. The default is the original title plus [Spanish in brackets].
- **Flags what a translator needs to see:** ambiguous phrases, artist gender, possible errors in the English, names that may be missing an accent, and cuts made to fit a label.
- **Checks every segment mechanically:** character limits, glossary terms, numbers and dates, italic titles, ¿ ¡, capitalized months, and the same English translated two different ways.
- **Learns from you:** your glossary is binding, and every segment you approve goes into a translation memory used for the next project.
- **Delivers:** a bilingual review table (.docx) with notes, a clean Spanish Word file that keeps the italics, or a CSV.

## Privacy

- The app only listens on this Mac (`127.0.0.1`) and refuses requests from other websites.
- Projects, glossary and memory are saved in `~/Documents/Translation Desk`, outside this code folder, so client text can't end up on GitHub.
- The text you translate is sent to Anthropic's API to produce the draft. API inputs aren't used to train models by default. Check your client's confidentiality terms before uploading their text.

## Set up (once)

1. **Install Node 22.** If you use nvm: `nvm install 22`. Then, in this folder: `npm ci`.
2. **Get a Claude API key** at [console.anthropic.com](https://console.anthropic.com): buy a small amount of credit, set a monthly limit under **Settings → Limits**, then **API Keys → Create Key**.
3. **Save the key in your Mac's Keychain** (not in a file). Open Terminal, paste this line, and press return. When it asks, paste the key:
   ```
   read "k?Paste key: " && security add-generic-password -a "$USER" -s anthropic-translation-assistant -w "$k" && unset k && echo saved
   ```

## Use it

```
npm start
```

Open **http://localhost:4321**. Create a project from a file, press **Translate**, then review each segment: edit the Spanish, read Claude's notes and the checks, and tick **Approved**. Download the result when you're done. Press Control-C in Terminal to stop the app.

To try it without a key (the Spanish shows as placeholders): `npm run sample`.

A typical exhibition press release (about 1,500 words) costs roughly $0.30–$0.60 to draft. The button shows an estimate before you send anything, and the project keeps the real cost.

## Compare with your own past work

Put a past job in a private folder with `original.docx` (the English you received) and `translation.pdf` (or `.docx`): your delivered Spanish. Then run:

```
npm run compare -- "/path/to/that folder"
```

The app translates the original, then a separate Claude review compares both versions against the English. It lists every material difference, which version is better, and a rule the app could learn. The report is saved in that folder, never here.

## How it works

| Piece | File | What it does |
|---|---|---|
| Segmenting | `lib/segment.mjs` | Word → HTML (mammoth) → paragraphs with `*italic*` and `**bold**` markers; rejoins broken lines; CSV label sheets keep per-label limits. |
| Prompt | `lib/prompt.mjs`, `prompts/` | Instructions plus three reference guides (museum conventions, Spanish style, arts terminology), and the project settings plus glossary as two cached system blocks. The segments, memory matches and earlier term decisions go in the user message. |
| Translation | `lib/translate.mjs` | Claude Opus 5.5 with adaptive thinking, streaming, and **structured output** validated against a Zod schema (id, kind, translation, flags, term decisions). Batches of about 6,000 characters run in order, and each batch receives the decisions made before it so terms stay consistent. Server-side refusal fallback, typed error messages in plain language, and cost tracked from `usage`, including cache reads. |
| Checks | `lib/checks.mjs` | Deterministic QA (length, glossary, numbers, italics, punctuation, capitalization, consistency). |
| Memory | `lib/memory.mjs` | Approved segments matched by trigram similarity and passed to Claude as context. |
| Storage | `lib/store.mjs` | JSON files with atomic, serialized writes; everything loaded is validated. |
| Server | `server.mjs` | Node's built-in `http`, bound to 127.0.0.1, with Host and Origin checks, a Content-Security-Policy, and progress streamed to the page. |
| Page | `public/` | Plain HTML, CSS and JavaScript in English and Spanish; text is built with `textContent` only. |

## Tests

```
npm test
```

18 tests cover segmenting, every check, translation memory, data validation, batching, the prompt layout, the output schema, cost math and the exports. They don't call Claude.

## Limits

- It produces a draft for a professional to review. It doesn't replace the translator's judgment or signature.
- Scanned PDFs aren't read yet; use the Word file or paste the text.
- Certified translations (birth certificates, diplomas) are planned as a second mode.

## License

MIT
