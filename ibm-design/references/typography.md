# Typography: the whole IBM Plex family

Plex is IBM's open-source corporate typeface (SIL OFL 1.1), free to use, embed and ship. It is a **superfamily**: one design voice drawn as Sans, Sans Condensed, Serif, Mono and many scripts. They share proportions, x-height and rhythm, so **mixing Plex families is idiomatic, not a clash**. This file says what exists and what each part is conventionally for. Treat it as guidance for choosing well, not a list of bans.

## What exists

| Family | CSS family name | Weights (all 100–700) | Italic | Variable | Typical role |
|---|---|---|---|---|---|
| **Plex Sans** | `IBM Plex Sans` | Thin 100 · ExtraLight 200 · Light 300 · Regular 400 · **Text 450** · Medium 500 · SemiBold 600 · Bold 700 | ✓ every weight | ✓ `IBM Plex Sans Var` (wght; Google Fonts also serves a `wdth` 85–100 axis) | The default voice: UI, body, headlines, data labels |
| **Plex Sans Condensed** | `IBM Plex Sans Condensed` | 100–700 + Text | ✓ | via Sans `wdth` | Space-constrained text: dense tables, tight columns, chart labels, narrow mobile headings (IBM publishes no explicit rule; this is the usual practice) |
| **Plex Serif** | `IBM Plex Serif` | 100–700 + Text | ✓ | ✓ `IBM Plex Serif Var` | Editorial: long-form reading, display headlines with gravitas, quotations (Carbon's `quotation` styles are Serif), bylines, research papers |
| **Plex Mono** | `IBM Plex Mono` | 100–700 + Text | ✓ | ✓ `IBM Plex Mono Var` | Code, commands, tokens, IDs, numbers you compare, timestamps, technical eyebrows and captions |
| **Plex Math** | `IBM Plex Math` | Regular | — | — | 5,000+ math glyphs, an alternative to STIX/Cambria Math; **pairs with Serif Regular** for papers and formulas |
| **Plex Sans SC / TC** | `IBM Plex Sans SC`, `… TC` | Thin–Bold + Text (8) | — (CJK has no italic) | — | Simplified / Traditional Chinese; designed to pair with Plex Sans |
| **Plex Sans JP / KR** | `IBM Plex Sans JP`, `… KR` | 7–8 weights | — | — | Japanese, Korean |
| **Plex Sans Arabic · Hebrew · Devanagari · Thai · Thai Looped** | `IBM Plex Sans Arabic` … | 8 each | — | — | Those scripts; Thai Looped is the traditional looped Thai for body text |

Character, useful when choosing: **Sans** is a grotesque, IBM's workhorse and Helvetica Neue replacement (angled terminals, open counters for small sizes, rounded outside with square inside). **Mono** has a fixed 600-unit width, with Selectric-typewriter heritage: "monospace, not monotone". **Serif** is a hybrid of Plex, Bodoni and Janson (ball terminals, rectangular serifs, a steep italic). Cyrillic, Greek and extended Latin (incl. Vietnamese) are in the Latin families.

**Text (450)** sits between Regular and Medium. It's for small sizes, light-on-dark text, and print, where Regular looks thin. **Italics** are drawn italics in every Latin family and weight, not just slanted roman. Use them for emphasis, titles of works, terms being defined, and quotations.

Installed locally on this machine by `scripts/install_fonts.sh` (default set: everything except TC/JP/KR; add them with `--all`). Check with `install_fonts.sh --check`.

## Conventional roles

Carbon's product type uses three weights (**Light 300, Regular 400, SemiBold 600**). That's a good default palette, not a ceiling.

| Want | Usual choice |
|---|---|
| Product UI, dashboards, forms | Sans 400 body, Sans 600 for headings/labels, Mono for values and code, Condensed for dense data |
| Big display headline (expressive) | Sans **Light 300** at large sizes (the signature IBM look), or Serif Light/Regular for editorial gravitas |
| Long-form article | Serif 400 body 18–20px / 1.5–1.6 **or** Sans 400; headings in Sans 600 or Serif. Pull quotes in Serif Light *italic* |
| Eyebrow / kicker / category label | Mono 400 12–14px, letter-spacing 0.32px, or Sans 600 12–14px. Sentence case (no forced uppercase by default) |
| Numbers in tables | Sans with `font-variant-numeric: tabular-nums`, or Mono when values are compared digit by digit |
| Code, CLI, file paths, token names | Mono 400; inline code at 0.875em of the surrounding text |
| Captions, footnotes, legal | Sans 400 12px (`label-01` / `legal-01`), `text-secondary` |
| Emphasis inside body | Italic (same family) or SemiBold, not color |
| Chart text | Sans/Condensed 12–14px, `text-secondary`, tabular numbers |

Combinations that work: **Sans + Mono** (the technical IBM voice), **Serif headings + Sans body** (editorial), **Sans headings + Serif body** (literary report), **Sans Light display + Serif italic deck**. Usually two families carry a piece, and a third (Mono) for data and code.

IBM type basics (from IBM Design Language), which hold in every medium:
- **Flush left, ragged right** everywhere. Don't center, right-align or justify running text. Align copy with other copy and with image edges, including text inside containers.
- **Sentence case.** Title case only for proper titles and product names; avoid all caps.
- **Stack long headlines** over 2–3 lines rather than one long line. Fix widows, orphans and bad rags.
- Don't track Plex tight; it's designed with breathing room. Keep leading neither open nor tight (use the tokens).
- Real typography: curly quotes and apostrophes, primes only for feet/inches/minutes, em dash for strong breaks, en dash for ranges (1945–1975), hyphen for compounds.
- **One emphasis at a time** ("no belt and suspenders"): italic *or* bold, not both, and not also colored.
- Title vs subtitle: SemiBold + Light, Bold + Regular, or one weight separated by scale or by `text-primary` vs `text-secondary`.
- The **arrow →** is a recurring IBM typographic device: in links ("Read the report →"), as list markers, and inline in big editorial headlines.
- Running text stays neutral (`text-primary`/`-secondary`). Blue in text means "you can click this".

Things that read as off-convention, to avoid unless there's a reason: Thin/ExtraLight below ~32px; Bold for whole paragraphs; more than ~3 weights in one view; Condensed for long body text; Mono for paragraphs of prose; all-caps body or headings; faux bold or italic (always load the real style); letter-spacing on Serif body.

## Type sets (from `@carbon/type`, classes in `tokens/type.css`)

Carbon names its styles by job. Use the classes `.cds--type-<style>` or copy the values from `tokens/TOKENS.md`.

**Productive** (task-focused UI; fixed sizes, tight):
- `label-01` 12/16 · `label-02` 14/18 · `helper-text-01/02` · `legal-01/02` · `code-01` 12/16 Mono · `code-02` 14/20 Mono
- `body-compact-01` 14/18 · `body-compact-02` 16/22 · `body-01` 14/20 · `body-02` 16/24
- `heading-compact-01` 14/18 600 · `heading-compact-02` 16/22 600 · `heading-01` 14/20 600 · `heading-02` 16/24 600
- `heading-03` 20/28 · `heading-04` 28/36 · `heading-05` 32/40 · `heading-06` 42/50 300 · `heading-07` 54/64 300

**Expressive** (editorial and marketing moments; **fluid**, growing at breakpoints sm/md/lg/xlg/max):
- `fluid-heading-03` 20 → 24px · `-04` 28 → 32px · `-05` 32 → 60px · `-06` 32 → 60px SemiBold
- `fluid-paragraph-01` 24 → 32px Light (the "lede")
- `fluid-quotation-01` **Serif** 20 → 32px · `fluid-quotation-02` **Serif Light** 32 → 60px
- `fluid-display-01` 42 → 76px Light · `-02` same in SemiBold · `-03` 42 → 84px · `-04` 42 → **156px** Light, with negative tracking at large sizes

**Fluid styles read the viewport.** `fluid-*` (and the kit's `.ibm-lede`/`.ibm-quote`) resize with the browser width, so they're right for web pages and wrong for fixed canvases (slides, frames, fixed-width images). There, use the fixed `.ibm-s-*` slide classes (media.md) or explicit px from the scale.

Older v10 names (`productive-heading-0x`, `expressive-heading-0x`, `body-long-0x`, `body-short-0x`, `display-0x`) are kept for compatibility. Prefer the v11 names above.

Rhythm: sizes come from Carbon's scale (one formula, starting at 12px: each step adds 2px more every four steps) `12 14 16 18 20 24 28 32 36 42 48 54 60 68 76 84 92 102 112 122 132 144 156` (px). Pick sizes from the scale instead of inventing 22px or 37px. Line-heights in the tokens snap to 4/8px. **Large formats** multiply size and leading: ×4 for posters and easel signs (or 8K screens), ×8 for human-scale banners, ×32 for across-the-street. **Productive vs expressive moments:** keep one set per region. Use expressive in product only where content isn't in containers (home pages, banners), and productive on editorial sites for focused tasks (forms, filters, search).

## Loading

**HTML / artifacts.** Google Fonts serves Sans (variable wght + wdth + ital), Serif, Mono, Sans Condensed, JP and KR, plus Arabic, Hebrew, Devanagari and Thai:
```html
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,600;1,300;1,400&family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Sans+Condensed:wght@400;600&display=swap" rel="stylesheet">
```
Request only the weights and styles you use. Serif, Mono and Condensed are static on Google Fonts, so list weights explicitly (`0,300;0,400`); ranges like `100..700` return HTTP 400 for them.

**Chinese (SC/TC) isn't on Google Fonts.** For local or self-hosted HTML, load the unicode-range split CSS from jsDelivr, one link per weight:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ibm/plex-sans-sc@1.1.0/fonts/split/woff2/hinted/IBMPlexSansSC-Regular.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ibm/plex-sans-sc@1.1.0/fonts/split/woff2/hinted/IBMPlexSansSC-SemiBold.css">
```
(also `-Light`, `-Medium`, `-Bold`…; TC: `@ibm/plex-sans-tc@1.1.1/…/IBMPlexSansTC-Regular.css`). **In claude.ai artifacts** only Google Fonts stylesheets are allowed. There, rely on the font stack in `tokens.css`: `'IBM Plex Sans SC'` resolves through `local()` for viewers who have it installed (this machine does) and falls back to PingFang SC / Noto Sans CJK otherwise.

**PNG / PDF / video.** Rendering with `scripts/render.mjs` uses the locally installed fonts, so it works offline. For FFmpeg/libass subtitles, the installed OTFs are found by family name (`Fontname=IBM Plex Sans SC`), or point `fontsdir` at `~/Library/Fonts`.

**Canvas (`@napi-rs/canvas`)**: weights only in steps of 100 (`"450 60px …"` is misparsed as a 450px size, so Text 450 isn't reachable), and no automatic CJK fallback: always write `"IBM Plex Sans", "IBM Plex Sans SC"`. See style-ibm-video.md for a tested setup.

**`local()` names.** Match local fonts by *family* (`font-family: "IBM Plex Sans SC"` + `font-weight`), which always works. If you write `@font-face { src: local(…) }`, the SC files register unusual full names: "IBM Plex Sans SC" (Regular), "IBM Plex Sans SC Light", "… Medm", "… SmBld", "… Bold", "… ExtLt", "… Thin", "… Text". `local("IBM Plex Sans SC Medium")` silently fails.

## CJK and mixed-script conventions

- The stacks in `tokens.css` already put `IBM Plex Sans SC` right after `IBM Plex Sans`. Latin and digits render in Plex Sans and Han characters in Plex Sans SC, and the two are designed to match.
- **IBM's rule for CJK, Thai, Devanagari and Arabic: set them at 95% of the Latin size and keep the default line height.**
  - *Mixed pages* (a Chinese block in a Latin page): add `.ibm-cjk` (font-size .95em). If a more specific rule sets the size, multiply there instead: `font-size: calc(36px * .95)`.
  - *All-Chinese pieces*: apply the factor to the sizes you set (headline, body), keep token line-heights, and don't fight the token classes. Consistent sizes matter more than the exact factor.
  - For long-form Chinese *reading* (articles, subtitles), many teams loosen leading to 1.6–1.75. That's a reading-comfort choice beyond IBM's rule, so make it deliberately.
- **Punctuation**: “ ” ‘ ’ — … · exist in Plex Sans too, so inside Chinese they'd render Latin-narrow. base.css defines `"IBM Plex Sans SC Punct"` (a `unicode-range` face over the local SC install) and puts it first for `:lang(zh)`. It also sets `text-spacing-trim: trim-start`, so a line-initial “ doesn't leave a half-width hole and break flush-left, and `line-break: strict`.
- **Eyebrows**: inside `:lang(zh)`, `.ibm-eyebrow` switches to Sans, because Mono's 0.6em spaces and `·` look gappy beside Han. Keep Mono for numerals or codes via `<code>`.
- **Line breaks**: break display headlines by hand (`<br>`) between words, never inside a two-character word. `text-wrap: pretty` is on `p, li` and `balance` on headings.
- Plex has **no CJK Serif or Mono**. In Chinese text, Serif and Mono roles fall back to Sans SC (the stacks handle this), so editorial Chinese is set in Sans, with Serif kept for Latin quotes and numerals if wanted.
- Chinese body: no letter-spacing, no italic (base.css turns `em`/`i` into SemiBold under `:lang(zh)`), full-width punctuation, flush left like Latin.
- "Light thins out below ~40px" means 40px **as seen**: in a 1080px image viewed on a 390px phone, that's ~110 CSS px. Headlines: SemiBold 600 or Medium 500 read better than Light below ~40px, because Light Han strokes get thin.
- Subtitles (video): Plex Sans SC **Medium/SemiBold**, white `text-on-color` on a `rgba(22,22,22,.72)` box or with a 2px gray-100 outline, at 4.5–5% of frame height.
- Set `lang="zh-CN"` (or `zh-TW`/`ja`/`ko`) on the element so the browser picks the right glyph variants.

## Do / don't

- ✓ `font-family: var(--cds-font-sans)` (or serif/mono/sans-condensed) · ✗ hard-coding `Helvetica`, `Inter`, `system-ui` as the primary face
- ✓ Light 300 for big display type · ✗ Light for 14px body
- ✓ Sizes from the type scale; styles from `type.css` · ✗ arbitrary sizes
- ✓ Sentence case for headings, buttons and labels (Carbon content convention) · ✗ Title Case Everywhere, ALL CAPS BUTTONS
- ✓ `tabular-nums` in tables · ✗ proportional digits in columns that should line up
