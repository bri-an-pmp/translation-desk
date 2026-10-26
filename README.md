# Translation Desk

A translation assistant for English ⇄ Spanish that runs on your own Mac. Claude drafts each passage and explains its judgment calls; the translator reviews, edits and approves every segment before anything is delivered.

Built by a working translator for the jobs translators actually get: certified translations of official documents, contracts, museum and exhibition text, business and marketing copy, and software strings.

## What it does

- **Any type of text, both directions.** Choose General, Certified translation, Legal, Museums & arts, Business, or Technical & software, and English → Spanish or Spanish → English. Each type brings its own specialist guide: bracketed seals and signatures for certified documents, contract conventions for legal text, tombstone labels for museums, placeholders for software.
- **Reads what clients send:** Word (`.docx`), PDF, a photo of the document (JPEG, PNG, iPhone HEIC), plain text, or a spreadsheet saved as `.csv` with a character limit per line. Claude reads PDFs and photos, scans included. The real file type is detected from the file's contents, and lines broken in the middle of a paragraph are joined back together.
- **Certified translations:** every field, stamp, seal, signature and handwritten note is translated or described in [brackets]. Names, ID numbers and dates are copied exactly and flagged when ambiguous. The delivery file ends with the translator's certificate of accuracy and, optionally, a Texas notary block. The app warns that a notary can't notarize their own signature.
- **Flags what a translator needs to see:** ambiguous phrases, gender, possible errors in the source, names that may be missing an accent, abbreviations, illegible text, and cuts made to fit a character limit.
- **Checks every segment mechanically:** character limits, glossary terms, numbers and dates, italic titles, bracketed seals and signatures, ¿ ¡ (and stray ¿ ¡ in English), capitalized months, and the same sentence translated two ways.
- **Learns from you:** your glossary is binding in both directions, and every segment you approve goes into a translation memory, kept separately for each direction.
- **Delivers:** a bilingual review table (.docx) with all notes, the translation as a clean Word file (with the certificate for certified jobs), or CSV. Next to the translation you can view the original PDF or photo. When a job is done, **Delete project** removes it and its stored original.

## Privacy

- The app only listens on this Mac (`127.0.0.1`) and refuses requests from other websites.
- Projects, originals, your glossary, memory and certificate details are saved in `~/Documents/Translation Desk`, outside this code folder, so client documents can't end up on GitHub.
- The text, PDFs and photos you translate are sent to Anthropic's API to produce the draft. API inputs aren't used to train models by default. Check your client's confidentiality terms, and delete projects with personal documents when the job is done.

## Set up (once)

1. **Install Node 22.** If you use nvm: `nvm install 22`. Then, in this folder: `npm ci`.
2. **Get a Claude API key** at [console.anthropic.com](https://console.anthropic.com): buy a small amount of credit, set a monthly limit under **Settings → Limits**, then **API Keys → Create Key**.
3. **Save the key in your Mac's Keychain** (not in a file). Open Terminal, paste this line, and press return. When it asks, paste the key:
   ```
   read "k?Paste key: " && security add-generic-password -a "$USER" -s anthropic-translation-assistant -w "$k" && unset k && echo saved
   ```
4. **Optional, for certified translations:** open **My details** in the app and enter your name (and, if you like, your address, contact and qualifications) for the certificate.
5. **Optional, for a Desktop shortcut:** copy `tools/Translation Desk.command` to your Desktop. Double-clicking it starts the app and opens it in Chrome.

## Use it

```
npm start
```

Open **http://localhost:4321**. Create a project (name, type of text, direction, file), press **Translate**, then review each segment: edit the translation, read Claude's notes and the checks, and tick **Approved**. Download the result when you're done. Press Control-C in Terminal to stop the app.

To try it without a key (translations show as placeholders): `npm run sample`.

**Typical costs** (shown before anything is sent; the project keeps the real cost):

| Job | Cost |
|---|---|
| One-page birth certificate from a phone photo (read + translate) | about $0.18 |
| 1,500-word press release from Word | about $0.40 |

## Compare with your own past work

Put a past job in a private folder with `original.docx` (what you received) and `translation.pdf` (or `.docx`): your delivered translation. Optionally add a `settings.json` such as `{"domain": "legal", "direction": "es-en"}`. Then run:

```
npm run compare -- "/path/to/that folder"
```

The app translates the original, then a separate Claude review compares both versions against the source. It lists every material difference, which version is better, and a rule the app could learn. The report is saved in that folder, never here.

## First results

- **Museum press release** (a real past job, about 1,500 words), compared with the translator's delivered version for $0.56. The comparison found one real bug (a sponsor line given in both languages was translated twice; it's now left empty and flagged) and four places where the translator's wording was better, which became rules. The translator settled the remaining judgment calls, and those became glossary entries.
- **Certified birth certificate** (a fictional Mexican *acta de nacimiento* photographed like a phone picture, with a seal, two signatures, handwriting and a watermark). Every field and visual element came through in [brackets], names and the CURP were copied exactly, and numeric dates were kept and flagged as day/month/year. The certificate and notary block were added, all for $0.18.

The reviewer in the comparison is also Claude, so its scores lean toward Claude's own style, and it doesn't know what the client asked for. The point is the list of differences, not the score.

## How it works

| Piece | File | What it does |
|---|---|---|
| Reading files | `lib/segment.mjs`, `lib/read-document.mjs` | Detects the real file type from its first bytes. Word → HTML (mammoth) → paragraphs with `*italic*` and `**bold**` markers. PDFs and photos go to Claude (vision) with structured output; certified jobs ask for every field, seal and signature in brackets. HEIC and large photos are converted with macOS `sips`. |
| Prompt | `lib/prompt.mjs`, `prompts/` | Instructions plus the guides for the chosen type of text (certified, legal, museum, arts, business, technical, Spanish style) and the project settings plus glossary as two cached system blocks. The segments, memory matches and earlier term decisions go in the user message. |
| Translation | `lib/translate.mjs` | Claude Opus 5.5 with adaptive thinking, streaming, and **structured output** validated against a Zod schema (id, kind, translation, flags, term decisions). Batches of about 6,000 characters run in order, and each batch receives the decisions made before it so terms stay consistent. Server-side refusal fallback, plain-language error messages, and cost tracked from `usage`, including cache reads. |
| Checks | `lib/checks.mjs` | Deterministic QA, aware of the direction (length, glossary, numbers, italics, brackets, punctuation, capitalization, consistency). |
| Memory | `lib/memory.mjs` | Approved segments matched by trigram similarity, per direction, and passed to Claude as context. |
| Delivery | `lib/export.mjs` | Review table, translation with the certificate of accuracy (in the target language) and optional notary block, CSV with formula protection. |
| Storage | `lib/store.mjs` | JSON files with atomic, serialized writes; everything loaded is validated; originals stored next to the project and deleted with it. |
| Server | `server.mjs` | Node's built-in `http`, bound to 127.0.0.1, with Host and Origin checks, a Content-Security-Policy, and progress streamed to the page. |
| Page | `public/` | Plain HTML, CSS and JavaScript in English and Spanish; text is built with `textContent` only. |

## Tests

```
npm test
```

25 tests cover file-type detection, segmenting, every check in both directions, the glossary flip, translation memory, data validation, batching, the prompt layout, the output schema, cost math, the certificate, and the exports. They don't call Claude. GitHub runs them on every push.

## Limits

- It produces a draft for a professional to review. It doesn't replace the translator's judgment or signature: check every name, number and date against the original before signing a certificate.
- Old Word (`.doc`), Pages and RTF files must be saved as `.docx` first (the app explains how).
- Multi-page originals that come as separate photos need to be combined into one PDF for now.

## License

MIT
