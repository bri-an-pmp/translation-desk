# Technical and SaaS translation

This domain rewards a translator who has actually shipped software. The job is to make the product feel native in the target language — same clarity, same brevity, same brand voice — without breaking anything that the engineering team relies on.

## Inviolable rules

1. **Never translate code, identifiers, or tokens.** Variable names, function names, class names, API parameter names, HTTP methods, status codes, file paths, URLs, environment variables, CSS classes, command-line flags, and code keywords all stay in English (or whatever the source code language uses). Translate only the *prose around* code, not the code itself.
2. **Preserve placeholders byte-for-byte.** `{{name}}`, `{user}`, `%s`, `%1$s`, `${count}`, `<var>...</var>`, `[BRAND]`, ICU `{count, plural, ...}` syntax — these must appear in the target string exactly as in the source. The token can move within the sentence to suit target grammar, but it cannot be altered, translated, or duplicated.
3. **Preserve HTML, markdown, and rich-text markup.** `<b>`, `<a href="...">`, `**bold**`, backticks for code, etc. Translate the content between tags; never the tag names or attributes (except user-visible attribute *values* like `title="..."` or `alt="..."`).
4. **Respect character limits when given.** UI strings often have hard limits (button labels at ~20 chars, push notification titles at ~40, etc.). Spanish averages ~20–25% longer than English. If the user provides a limit, hit it. If they don't but the source is clearly a UI string, hit a conservative target (Spanish ≤ 1.25× English length) and flag if you can't.
5. **Stay consistent across the whole string set.** If the product calls something a "workspace" in three strings, every Spanish translation uses the same term (e.g., `espacio de trabajo` everywhere — not `espacio` here and `área de trabajo` there).

## UI string conventions (ES target)

- **Button labels and CTAs**: imperative, second person. Default to formal *usted* for B2B products, *tú* only for consumer/casual products. "Save" → `Guardar`. "Continue" → `Continuar`. "Sign up" → `Registrarse` (formal) or `Regístrate` (informal). Stay consistent across the whole UI.
- **Errors and warnings**: clear, blameless, action-oriented. "Something went wrong" → `Ocurrió un error` (not `Algo salió mal`, which reads as a calque). "Please try again" → `Vuelve a intentarlo` (tú) / `Vuelva a intentarlo` (usted) / `Inténtelo nuevamente` (usted, more formal).
- **Empty states and onboarding**: warm but concise. Avoid over-flowery Spanish that pads length.
- **Tooltips and helper text**: declarative, no period at the end if the source has no period; period if the source does. Match the source's punctuation discipline.
- **Confirmations**: "Are you sure you want to delete this?" → `¿Seguro que deseas eliminar esto?` (tú) or `¿Está seguro de que desea eliminar esto?` (usted). The opening `¿` is mandatory in Spanish.

## Brand-voice and tone decisions

If the source has a recognizable brand voice (clipped and direct like Linear; warm and friendly like Mailchimp; clinical like Stripe docs), match it in Spanish:

- **Clipped/direct**: short sentences, no filler, no `Por favor`. Lean on imperatives.
- **Warm/friendly**: contractions are not a thing in Spanish the way they are in English, so warmth comes from phrasing choice and the second-person form. Use `tú`, exclamation marks sparingly, avoid corporate formulas.
- **Clinical/formal**: third-person passive, nominalizations, no second person. "We've sent you an email" → `Se le ha enviado un correo electrónico` (clinical) vs `Te enviamos un correo` (warm).

Surface the brand-voice decision in the register & audience analysis.

## API and developer documentation

- Translate prose explanations, parameter descriptions, error message descriptions.
- Do **not** translate: code examples, JSON keys, parameter names, endpoint paths, response field names, HTTP headers, status code names.
- Do translate: code *comments* if they're explanatory prose, **but only if the user asks** — many teams want comments left in English so the codebase stays mono-lingual.
- For terms like *endpoint*, *request*, *response*, *header*, *payload*, *callback*, *webhook*: standard practice in Spanish developer docs is to keep them in English. `endpoint`, `request`, `response`, `header`, `payload`, `callback`, `webhook` — all stay. Don't translate `endpoint` as `punto de conexión`. Tech-Spanish has settled on the English terms.
- Translate `query` as `consulta`, `query parameter` as `parámetro de consulta`. Translate `rate limit` as `límite de uso` or keep as `rate limit` — flag the choice.

## Common tech false friends and calques to avoid

| Don't write | Write instead | Why |
|---|---|---|
| Aplicar (a un trabajo, a una promoción) | Postularse a / Solicitar | "Aplicar" in Spanish means to apply a substance, not to apply for something |
| Soportar (un cliente, una solicitud) | Atender, dar soporte a, admitir | "Soportar" means to physically bear or to tolerate |
| Asumir (que algo es cierto) | Suponer | "Asumir" means to take on (a responsibility) |
| Eventualmente | Con el tiempo / Finalmente | "Eventualmente" in Spanish means "occasionally," not "eventually" |
| Actualmente | En este momento / En la actualidad (OK) | "Actualmente" does mean "currently" — but watch the false friend "actual" which means "current," not "actual" |
| Realizar (everything) | Vary: hacer, efectuar, llevar a cabo, ejecutar | "Realizar" is overused in translations; mix it up |
| Remover | Eliminar / Quitar / Retirar | "Remover" in Spanish means to stir |
| Editar | Modificar / Editar (OK for "to edit a document") | OK for editing files; not OK for "edit a person's profile" → use `modificar` |
| Library (software) → Librería | Biblioteca | A `librería` is a bookstore. A software library is `biblioteca` |
| Save → Salvar | Guardar | `Salvar` means to rescue. To save a file is `guardar` |

## Spreadsheet/JSON string files

When the user hands over a structured file of strings (`strings.json`, `locales.csv`, etc.):

1. Identify the source-language column or key naming convention.
2. Translate **values only**. Keys, IDs, contexts, and metadata columns stay untouched.
3. Preserve placeholders, HTML, and pluralization syntax exactly.
4. If the file includes a `context` or `description` column, **read it** — it tells you whether a string is a button, a heading, an error, a tooltip. That changes the translation.
5. Output the same file structure with translated values. Don't reorder rows.

## What to flag in translator's notes (technical)

- Strings where you couldn't tell if it's a button, heading, or sentence (no context) — note the assumption you made.
- Strings where the English source is itself ambiguous or grammatically broken.
- Strings that overflow common UI character limits in Spanish.
- Plural forms — Spanish has two plural categories (one, other), but some source strings have more (zero, one, two, few, many, other) and the mapping isn't always clean.
- Brand or product names — confirm they stay untranslated (almost always yes, but ask if the brand has a localized name).
- Any term where you departed from a glossary the user provided — never silent.
