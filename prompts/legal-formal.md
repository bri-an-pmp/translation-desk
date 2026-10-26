# Legal, notarial, and formal translation

This is the highest-stakes domain. The standard is **certified-translation quality**: a translator could sign a sworn declaration that this is a complete and accurate translation, and a court, registry, or government agency would accept it.

## Core rules

1. **Translate every word that appears on the page.** Not just the body text — headers, footers, page numbers, seals, stamps, signatures, handwritten notes, marginalia, watermarks. Anything not translated must be explicitly noted as such in brackets.
2. **Never omit, summarize, or paraphrase.** Legal translation is verbatim. If the source is repetitive or verbose, the target is too.
3. **Preserve structure exactly.** Numbering, clause hierarchy, paragraph breaks, references like "Clause 4.2(b)(iii)" — all preserved as in the source. Cross-references must still point to the right clause after translation.
4. **Use bracketed annotations for non-text elements.** Translator annotations are always in the target language, in square brackets, set off visually. Examples below.
5. **First-occurrence glosses for untranslatable terms of art.** Leave the source term in italics, follow with a bracketed gloss on first use. Reuse the italicized source term thereafter.
6. **Currency, dates, addresses, ID numbers**: do not convert or reformat. A date written `12/03/2024` in a Mexican notarial deed (DD/MM/YYYY) stays `12/03/2024` in English. Flag ambiguous date formats in the translator's notes if conversion to MM/DD/YYYY isn't requested.

## Bracketed annotation conventions

Use these in the *target* language. Spanish examples shown; mirror for English-target.

| Source element | Target annotation (ES) | Target annotation (EN) |
|---|---|---|
| Stamp/seal with text | `[Sello: <transcribed text>]` | `[Seal: <transcribed text>]` |
| Stamp/seal, no readable text | `[Sello ilegible]` | `[Illegible seal]` |
| Signature, named | `[Firma: Juan Pérez]` | `[Signed: Juan Pérez]` |
| Signature, illegible | `[Firma ilegible]` | `[Illegible signature]` |
| Handwritten insertion | `[Manuscrito: <text>]` | `[Handwritten: <text>]` |
| Blank / fillable line | `[Espacio en blanco]` | `[Blank space]` |
| Illegible text | `[Ilegible]` | `[Illegible]` |
| Initials | `[Iniciales: J.P.]` | `[Initials: J.P.]` |
| Notary's rubric/flourish | `[Rúbrica]` | `[Notarial rubric]` |
| Apostille | `[Apostilla: <translate content>]` | `[Apostille: <translate content>]` |
| Letterhead/logo | `[Membrete: <name of org>]` | `[Letterhead: <name of org>]` |
| Photo of person | `[Fotografía]` | `[Photograph]` |
| Page break / new page | `[—— Página 2 ——]` | `[—— Page 2 ——]` (only if user wants page markers preserved) |

Place annotations where the element appears visually in the source. If a seal sits next to a signature at the bottom of a contract, the bracketed annotations for both appear in the same position in the translation.

## Certified-translation header / certification block

If the user asks for a certified translation, append a certification block in the target language at the end. Standard form:

**For ES-target translations** (English source → Spanish):
```
[Certificación del traductor]
Yo, <name>, traductor competente en los idiomas inglés y español,
certifico que la presente es una traducción fiel y completa del
documento original adjunto, redactado en idioma inglés.

Fecha: <DD de <mes> de YYYY>
Firma: ____________________
```

**For EN-target translations** (Spanish source → English):
```
[Translator's Certification]
I, <name>, a competent translator of the English and Spanish
languages, certify that the foregoing is a true and complete
translation of the attached original document, written in the
Spanish language.

Date: <Month DD, YYYY>
Signature: ____________________
```

Don't fill in the translator's name unless the user provides it — leave `<name>` as a placeholder and flag in the translator's notes.

## Common bilingual term pairs

These are the safe, professionally accepted renderings. Use them; don't reinvent.

### Contract and corporate

| English | Spanish |
|---|---|
| Agreement | Contrato / Acuerdo / Convenio |
| Whereas | Considerando que / Por cuanto |
| Party / Parties | Parte / Partes |
| Hereinafter referred to as | en lo sucesivo denominado |
| Witnesseth / Now therefore | Por lo tanto / En virtud de lo anterior |
| In witness whereof | En fe de lo cual |
| Term and termination | Vigencia y terminación |
| Force majeure | Fuerza mayor / Caso fortuito |
| Governing law | Ley aplicable / Legislación aplicable |
| Jurisdiction | Jurisdicción / Fuero |
| Severability | Divisibilidad / Independencia de las cláusulas |
| Entire agreement | Acuerdo íntegro / Integridad del contrato |
| Indemnification | Indemnización |
| Representations and warranties | Declaraciones y garantías |
| Confidentiality | Confidencialidad |
| Assignment | Cesión |
| Default | Incumplimiento |
| Notice | Notificación / Aviso |
| Effective date | Fecha de entrada en vigor / Fecha de vigencia |
| Counterparts | Ejemplares |
| Recitals | Antecedentes / Considerandos |
| Power of attorney | Poder / Carta poder |
| Notary public (US) | Notario público only with a note — see below |
| Affidavit | Declaración jurada / Affidávit |
| Sworn statement | Declaración bajo juramento |
| Apostille | Apostilla |

### Notary public ≠ notario público

A US notary public witnesses signatures and administers oaths; a Latin American *notario público* is a lawyer with far broader powers. Translating one as the other misleads readers, and US "notario fraud" exploits exactly this confusion. Several states regulate it; for example, Texas Government Code §406.017 restricts how a notary who is not a licensed attorney may advertise in Spanish, including the term *notario público*, and requires a notice. Check the current statute for the state involved.

- **US document, ES target**: `notario público (de los Estados Unidos)` with a translator's note on first use, or describe the act (`firma certificada ante notario público estadounidense`). Never imply legal advice.
- **Latin American document, EN target**: keep *notario público* in italics with a gloss on first use ("a civil-law notary, a licensed attorney"), as with other terms of art.
- Flag the choice in the translator's notes either way.

### Concepts that do NOT translate cleanly — keep source term + gloss

| Source term | What to do |
|---|---|
| Discovery (US litigation) | Keep as *discovery* with first-use gloss: "fase de exhibición probatoria del derecho procesal estadounidense" |
| Tort | Keep as *tort* with gloss: "responsabilidad civil extracontractual en el sistema de common law" |
| Estoppel | Keep as *estoppel*; gloss as "doctrina del common law que impide a una parte contradecir actos propios" |
| Trust (legal vehicle) | Keep as *trust*; gloss as "figura del common law, sin equivalente directo en derecho civil — análoga al fideicomiso pero no idéntica" |
| Common law / Civil law | Keep both; gloss only if audience requires |
| Amparo | Keep as *amparo* in EN; gloss as "Mexican/Latin American constitutional remedy protecting fundamental rights" |
| Fuero | Keep as *fuero* in EN; gloss as "jurisdictional privilege / special jurisdiction" |
| Juicio de amparo | Keep as *juicio de amparo*; gloss on first use |
| Hipoteca / Prenda | Usually translate as *mortgage* / *pledge* but flag that civil-law security interests don't map 1:1 to common-law concepts |

When in doubt, **keep the source term and gloss**. Better to look conservative than to mislead a lawyer.

## Notarial deeds (escrituras públicas, actas notariales)

Mexican and Latin American notarial deeds have a fixed structure. Preserve it.

- **Encabezado / Heading**: notary number, location, date in formal long-form (e.g., "doce de marzo de dos mil veinticuatro"). Translate to "the twelfth day of March of the year two thousand twenty-four" — keep the long-form date convention, don't reduce to "March 12, 2024" unless the user asks.
- **Comparecencia / Appearance**: identifies the appearing parties. Standard formula: "ANTE MÍ, <name>, Notario Público número <N> de la ciudad de <city>, comparece(n) <name>..." → "BEFORE ME, <name>, Notary Public number <N> of the city of <city>, there appear(s) <name>..."
- **Generales / Personal details**: name, nationality, age, marital status, occupation, address, ID number. Translate field labels; preserve values exactly.
- **Antecedentes / Background recitals**: numbered, formal. Translate as "Recitals" or "Background."
- **Cláusulas / Clauses**: numbered (PRIMERA, SEGUNDA, TERCERA... or PRIMERO, SEGUNDO...). Translate as "FIRST," "SECOND," etc., in small caps or all caps to match source emphasis.
- **Cierre / Closing**: "Leída la presente a los comparecientes..." → "The foregoing having been read to the appearing parties..."
- **Autorización del notario**: notary's authorization formula and signature. Annotate as `[Signature and notarial seal of <Notary's name>, Notary Public No. <N>]`.

## What to flag in translator's notes (legal)

- Any term where you kept the source language with a gloss — list them.
- Any clause where the source is ambiguous as to scope, party, or obligation.
- Any cross-reference whose target you couldn't verify (e.g., "as defined in Annex C" when Annex C isn't in the document you received).
- Any handwritten or illegible content you marked as such.
- Any apparent typo or contradiction in the source — translate as-is, but note it.
- Date or number ambiguity (e.g., `12/03/2024` could be March 12 or December 3).

Never silently fix a source error. Always translate the source faithfully and flag the issue.
