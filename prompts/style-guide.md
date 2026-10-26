# Cross-cutting style guide: Neutral Latin American Spanish

Conventions that apply across all domains when Spanish is the target. Read once; apply silently. Surface deviations only when the user's context requires them.

## Punctuation

- **Opening question and exclamation marks are mandatory**: `¿Qué hora es?` `¡Excelente!` — never omit them, even in informal text, even in headlines or UI strings. Omitting `¿` and `¡` is the single most common machine-translation tell.
- **Comma before "y" / "o"**: generally avoid the Oxford comma. `Inglés, español y portugués` — not `Inglés, español, y portugués`.
- **Quotation marks**: in Latin American Spanish, double quotes (`"..."`) are widely accepted and standard in business and tech writing. The angular guillemets (`«...»`) are more common in Spain and in formal literary contexts. **Default: double quotes** unless the source uses guillemets or the target is Castilian.
- **Colon after salutation**: `Estimado Juan:` not `Estimado Juan,`. This is a hard rule in formal Spanish correspondence.
- **Em dash and en dash**: Spanish uses em dashes for parenthetical asides — like this — same as English. For dialogue, Spanish uses em dashes at the start of a speaker's line, not quotation marks.
- **Ellipsis**: `...` — same as English. No space before, one space after.

## Capitalization

Spanish uses less title-case than English. Defaults:

- **Document titles, headings, book titles, article titles**: only the **first word** (and proper nouns) are capitalized. `Manual de usuario`, not `Manual De Usuario`. `Términos y condiciones`, not `Términos Y Condiciones`.
- **Months and days of the week**: lowercase. `lunes`, `enero`, `12 de marzo`.
- **Languages and nationalities (adjective)**: lowercase. `Hablo español`, `un cliente mexicano`. (Nationality as noun referring to the country: `México` capitalized.)
- **Job titles**: lowercase in running text. `el director general anunció...` Capitalized only when used as a formal title before a name in formal/official documents: `Director General Juan Pérez`.
- **Centuries, eras, historical periods**: lowercase. `el siglo XXI`, `la edad media`.
- **Brand and product names**: keep the brand's own capitalization. `iPhone`, `GitHub`, `MercadoLibre`.

## Dates

- **Long form**: `12 de marzo de 2024` (no comma between month and year; `de` between day-month and month-year).
- **Numeric form**: `12/03/2024` (DD/MM/YYYY) — the LatAm default. Note this is **the opposite of US convention**. Always flag if there's any chance of date ambiguity (a date like `02/03/2024` could be Feb 3 or Mar 2 depending on convention).
- **Formal/notarial long form**: `el doce de marzo de dos mil veinticuatro`. Use only when the source uses this convention (legal/notarial).

## Numbers

Neutral LatAm convention (most countries):

- **Decimal separator**: comma. `1,5 metros`, `3,14`.
- **Thousands separator**: period (or thin space in some technical contexts). `1.234.567`.
- **Exception — Mexico**: often follows US convention (period decimal, comma thousands). If the audience is Mexico-specific or US-Mexico business, mirror US convention and flag.
- **Currency**: keep the symbol and amount format from the source. Don't convert currencies. Don't reformat unless the user asks.
- **Percentages**: `25 %` with a space before the `%` is the RAE-correct form; `25%` without space is widely used and accepted in business. Default to **no space** for modern business/tech, **with space** for formal legal documents.

## Common phrasing preferences (neutral LatAm)

- `computadora` over `ordenador` (Spain).
- `celular` over `móvil` (Spain) — though `móvil` is understood everywhere.
- `auto` or `carro` over `coche` (Spain). `Carro` is more common in Mexico/Colombia/Venezuela; `auto` in the Southern Cone. **Use `auto`** as the most neutral.
- `manejar` (LatAm) over `conducir` (Spain) for driving — though `conducir` is universal.
- `correo electrónico` (formal) or `correo` (neutral) over `email` in formal text; `email` is fine in tech/casual.
- `boletos` (LatAm) over `entradas` (more universal but slightly Spain-leaning) for tickets — though `entradas` works everywhere; use `boletos` for transport, `entradas` for events.
- `ordenar` (to order food/products) — both `ordenar` (LatAm) and `pedir` (universal) work; `pedir` is safer.

## Gendered language and inclusive forms

Default practice in professional LatAm Spanish:

- Use the **traditional masculine generic** when referring to mixed or unknown groups (`los usuarios`, `los clientes`) unless the source explicitly uses inclusive forms or the user requests them.
- When the user explicitly asks for inclusive language, options are:
  - Split forms: `los usuarios y las usuarias` / `los/las usuarios/as` (most formally accepted).
  - Collective nouns: `el personal`, `la clientela`, `la comunidad` (best — no gender markers needed).
  - `@` or `e` forms (`usuari@s`, `usuaries`): not yet accepted in formal/professional contexts; use only if the user explicitly requests, and flag in notes.
- For products and services aimed at women specifically, gender language accordingly.

Don't impose inclusive forms when the source doesn't. Don't strip inclusive forms when the source uses them.

## Common machine-translation tells to avoid

These are the patterns that scream "this was translated by a machine, then lightly edited":

1. **Missing `¿` and `¡`**.
2. **Calques of English phrasal verbs**: `tomar ventaja` (take advantage), `hacer seguro` (make sure), `correr fuera de` (run out of). Use native Spanish constructions.
3. **Over-literal "to be" choices**: confusing `ser` vs `estar`. `El reporte es listo` ❌ (should be `El reporte está listo`).
4. **Por/para errors**: `Gracias para tu ayuda` ❌ (should be `Gracias por tu ayuda`).
5. **Direct translation of English gerunds**: `Estoy escribiendo para informarte...` is fine, but `Esperando tu respuesta` as a closer is a calque — better: `Quedo a la espera de tu respuesta`.
6. **Anglicized possessives**: `Tu cuenta` is fine, but `Tu opinión es importante a nosotros` ❌ → `Tu opinión nos importa` or `Tu opinión es importante para nosotros`.
7. **Doubling articles**: `Mi mi cuenta` (from sloppy template translation). Watch placeholders that already include possessives.
8. **Untranslated weekdays/months capitalized**: `Lunes 12 de Marzo` ❌ → `lunes 12 de marzo` ✓.
9. **Over-formal closings on casual messages**: `Atentamente` after `Hola` is jarring. Match register top-to-bottom.
10. **Verbatim English idioms**: `mover montañas`, `pensar fuera de la caja`. These exist as calques but read as translation. Use native equivalents or rephrase.

## Final pass before delivering

Before sending the translation, re-read it as if you were the target-language reader who has never seen the source:

- Does any sentence make you pause or re-read? Fix it.
- Does any phrasing feel imported? Fix it.
- Are all `¿` and `¡` present? Are all proper nouns capitalized correctly? Are all placeholders intact?
- If you removed an English idiom, is the replacement actually how a native speaker would say it?
- Is the register the same in the last paragraph as the first?

This last pass is what separates competent translations from masterful ones.
