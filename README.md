# Translation Desk

A translation assistant for English ⇄ Spanish that runs on your own Mac, as a regular Mac app. Claude drafts each passage and explains its judgment calls; the translator reviews, edits and approves every segment before anything is delivered.

Built by a working translator for the jobs translators actually get: certified translations of official documents, contracts, museum and exhibition text, business and marketing copy, and software strings.

## What it does

- **Any type of text, both directions.** Choose General, Certified translation, Legal, Museums & arts, Business, or Technical & software, and English → Spanish or Spanish → English. Each type brings its own specialist guide: bracketed seals and signatures for certified documents, contract conventions for legal text, tombstone labels for museums, placeholders for software.
- **Reads what clients send:** Word (`.docx` and older `.doc`), RTF, OpenDocument, PDF, a photo of the document (JPEG, PNG, iPhone HEIC), plain text, a spreadsheet saved as `.csv` with a character limit per line, or an XLIFF file from a CAT tool. Claude reads PDFs and photos, scans included; a document photographed page by page can be uploaded as several photos at once (up to 20) and is read as one document. The real file type is detected from the file's contents, and lines broken in the middle of a paragraph are joined back together. Files can be dragged onto the window.
- **Works with CAT tools:** XLIFF 1.2 and 2.0, Trados `.sdlxliff` and memoQ `.mqxliff` come in as segments (bold, links and placeholders become numbered markers like ⟨1⟩…⟨/1⟩ that are checked) and go back out as the same file with the translations filled in. Translation memories import and export as TMX.
- **Half price when it can wait:** "Translate later" sends the job through Anthropic's Message Batches API at half the cost; it's usually done within an hour (at most 24), and the app can be closed meanwhile.
- **Clients:** each project can name a client. The Clients tab adds up words, Claude cost and the minutes you actively worked, and downloads a report for quotes and invoices.
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
2. **Install the Mac app:** `npm run install-app`. This builds **Translation Desk** and puts it in Applications (open it from Launchpad, Spotlight or the Dock). Run the same command again after updating the code. The first time it opens, macOS asks whether it may use your Documents folder: say OK, that's where your projects are kept.
3. **Get a Claude API key** at [console.anthropic.com](https://console.anthropic.com): buy a small amount of credit, set a monthly limit under **Settings → Limits**, then **API Keys → Create Key**.
4. **Paste the key in the app**, under **My details → Claude API key**. The app checks it with Claude and saves it in your Mac's Keychain (never in a file).
5. **Optional, for certified translations:** in **My details**, enter your name (and, if you like, your address, contact and qualifications) for the certificate.

## Use it

Open **Translation Desk**. Create a project (name, client, type of text, direction, file), press **Translate** (or **Translate later at half price**), then review each segment: edit the translation, read Claude's notes and the checks, and tick **Approved**. Download the result when you're done. Closing the window keeps the app running (a translation in progress continues); quit with ⌘Q.

Other ways to run it:

- `npm run app` opens the desktop app from this folder without installing it; `npm run app:sample` does the same without a key (translations show as placeholders).
- `npm start` runs it in the browser at **http://localhost:4321** (Control-C stops it), and `tools/Translation Desk.command` does the same with a double-click.

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

40 tests cover file-type detection, segmenting, .doc/RTF/OpenDocument conversion, XLIFF and TMX in and out, several-page uploads, half-price jobs, the client report, every check in both directions, the glossary flip, translation memory, data validation, batching, the prompt layout, the output schema, cost math, the certificate, and the exports. They don't call Claude. GitHub runs them on every push.

## Limits

- It produces a draft for a professional to review. It doesn't replace the translator's judgment or signature: check every name, number and date against the original before signing a certificate.
- Pages files must be exported to Word first (the app explains how).
- Half-price jobs send all parts at once, so terms decided in one part aren't passed to the others (the glossary and memory still apply). For long documents where consistency matters most, use **Translate**.
- The Mac app is signed only for this Mac. To give it to other translators it needs a Developer ID certificate and Apple notarization.

## License

MIT
