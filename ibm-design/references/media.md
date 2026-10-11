# Media playbooks

All media share the same tokens, Plex and grid. They differ in **productive vs expressive** balance, canvas, and how you verify them. `$S` below means `~/.claude/skills/ibm-design`.

| Medium | Mode | Theme | Scaffold | Verify |
|---|---|---|---|---|
| Web UI, dashboards, settings, artifacts | productive | White ↔ G100 (follows OS) | `dashboard` | audit light + `--dark` + `--width 390` |
| Editorial page / report | expressive | White, G100 zones | `editorial` | same three runs |
| Long image (phone) | expressive | pinned (`data-theme`) | `editorial` | design + audit at `--width 390`; render `--width 390 --scale 2.77` |
| Slides / deck | expressive | pinned, one G100 break | `slides` | audit `--width 1920` (light only); PDF page count |
| Document / PDF | productive + serif reading | White | `editorial` + print CSS | audit at 1440; render `.pdf` |
| Charts | productive marks, expressive titles | inherits | — | text contrast and legibility via audit |
| Video frames (code-video) | expressive motion | G100 or White | — (Canvas) | `contrast.mjs` on the main pairs; read the PNGs |

Scaffold: `bash $S/scripts/new_page.sh <dashboard|editorial|slides|specimen|blank> <out-dir> [--lite] [--fonts] [--force]` writes `<out-dir>/index.html` plus `ibm/tokens.css`, `type.css` and `base.css` (real copies). `--fonts` also embeds Plex Sans/Serif/Mono WOFF2 (≈1.2 MB) for fully offline or portable delivery. It never overwrites an existing page unless you pass `--force`.

**Fixed canvases never use fluid classes.** `.cds--type-fluid-*`, `.ibm-lede` and `.ibm-quote` size themselves from the viewport width. On slides, frames and fixed-size images use the fixed `.ibm-s-*` slide classes or explicit px from the scale.

## Web UI / artifacts (productive)

**Setup.**
- For a **claude.ai artifact**, publish the scaffolded page with `files` mapping `ibm/tokens.css`, `ibm/type.css` and `ibm/base.css`. If a single file is required, inline `tokens.lite.css` + `base.css` (≈90 KB; lite keeps all four themes' core tokens and all categorical chart groups, and drops ai/chat/syntax/tag tokens) and only the type classes you use.
- Fonts come from the Google Fonts `<link>` (typography.md). In artifacts, no jsDelivr stylesheet: CJK comes from `local()` or the system.
- The theme tokens already handle light/dark. The grid's 16px `padding-inline` gives the phone gutter.

**Shell.**
- `ibm-header` (48px), usually as a G100 zone on a White page: `<header class="ibm-header ibm-header--collapsible" data-carbon-theme="g100">`. On phones its nav folds behind an `ibm-header__menu` button (markup in base.css comments; dashboard.html shows it).
- Settings and docs pages add a left `ibm-sidenav` (it becomes a scrolling tab strip on phones) next to a content column: `lg-3` nav + `lg-12 lg-start-5` content, or a CSS grid of 16rem + 1fr.
- `ibm-page-header`: eyebrow, `__title` (32px), `__desc`, and the actions set on the right.

**Layout.** Dashboards use **condensed** tiles (1px gaps) for KPI rows and **narrow** gutters for panels, with an F-pattern: key status top-left, few metrics, one color per data set. Forms use **wide** gutters and a single column of fields, ≤ 8 columns wide.

**Components** (kit classes in `tokens/base.css`).
- **Buttons**: one primary per view. In a set, primary on the **right**, secondary/ghost to its left. Labels are a verb + noun in sentence case, with an optional 16px icon on the right. Destructive actions: `ibm-btn--danger` (in a dialog), `--danger-tertiary` (standalone), `--danger-ghost` (per-row action in a table).
- **Forms**: `ibm-field` (label above, `label-01`), `ibm-input`, `ibm-select` inside `ibm-select-wrap` (chevron), `textarea.ibm-input`, `ibm-helper` / `--error` (+ `aria-invalid="true"` on the control). Groups use `fieldset.ibm-fieldset` + `legend`, `ibm-checkbox`, `ibm-radio`, `ibm-toggle` (each a `<label>` wrapping a native `<input>`). Validate on blur or submit, and put error text under the field, never only a red border.
- **Modal**: `<dialog class="ibm-modal">` opened with `showModal()`, with `__header` (`__label` + `__title` + `__close`), `__body` and `__footer`. In the footer, buttons fill the width, **Cancel (secondary) left, primary right**. Danger confirmation: the title names the object ("Revoke key 'ci-deploy'?"), the body states the consequence in one sentence, the primary is `ibm-btn--danger` with the same verb as the title, and for irreversible actions the user types the object's name to enable it.
- **Tables**: `ibm-table` (header `layer-accent-01`, 1px row lines, numbers right-aligned, tabular). Add `ibm-table--stack` with `data-label` on each `<td>` to get label/value cards on phones, or wrap in `ibm-table-wrap` to scroll.
- **Notifications**: `ibm-notification[data-kind]`: status color + icon + bold title + text. Only the leading icon takes the status color.
- **Tags**: `ibm-tag[data-color]` for categories, and status meanings only for status. A status word with no status color ("Expired", "Revoked", "Draft") is a **gray tag + icon**.
- **Copyable value**: `ibm-snippet` (`<code>` + 40px copy `ibm-icon-btn`). Show secrets once, masked afterwards.
- **Empty state**: a pictogram (80–120px) or spot illustration, `heading-03` title, one sentence, one action.
- **Loading**: skeleton blocks (`skeleton-background` / `skeleton-element`), not whole-region spinners.

**Checks.** `node $S/scripts/audit.mjs index.html`, then `--dark`, then `--width 390`: zero errors in all three. Also render each state (open dialog, error state) with `render.mjs … --click` / `--eval` and look at it.

**With impeccable.** impeccable runs critique, polish, UX copy and states. Every visual choice it proposes (fonts, colors, radius, shadows) is replaced by this skill's tokens and conventions.

**Real Carbon React code.** `@carbon/react` / `@carbon/web-components` (open source on npm) are compatible: theme them with the same four themes and verify APIs on `react.carbondesignsystem.com` (Storybook) or `npm view`, not memory. This skill doesn't use the IBMid-gated Carbon MCP.

## Editorial page / report (expressive)

Use an AABA rhythm: set a pattern, then break it once.
1. **Hero**: `ibm-eyebrow` (Mono: section · date), a headline in `fluid-display-0x` Light **stacked over 2–3 lines**, flush left on column 1, then `ibm-lede` across about 10 columns. Leave `spacing-13` of air. The accent may color one or two words or a thick rule.
2. **Body**: a text column of 8 of 16 columns, **offset** (`lg-8 lg-start-5`). Body is Plex Serif or Sans 400 at 18–20px / 1.5–1.6. Section heads are `fluid-heading-05`.
3. **Pattern breaks**: a full-bleed **G100 zone** with one big number and one sentence, a pull quote (`ibm-quote`, Serif Light, accent on the key phrase), a condensed-gutter mosaic, or a chart at 12–16 columns titled with its insight.
4. **Close**: notes in `label-01`/`legal-01`, Mono for URLs and IDs.

Moves that read as IBM: exposed keylines on column edges, oversized Light numerals, the → glyph, Mono eyebrows, one accent hit per section, calm negative space, and pictograms as section openers.

## Long image

- **Phone long image (the usual case)**: design the page **at 390px width** (the 4-column `sm` grid, real phone type sizes), then export with `node $S/scripts/render.mjs index.html out.png --width 390 --scale 2.77`. That gives a 1080px-wide PNG that reads at true size on a phone. Don't design at 1080 CSS px: that hits the 16-column `lg` grid, and the text ends up ~2.8× too small on the phone.
- **Desktop long image**: design at 1440, export `--width 1440 --scale 1` (or 2). If it will mostly be seen on phones, audit with `--width 1440 --view-width 390` so "large text" is judged at its viewed size.
- Pin the theme (`<html data-theme="light">`), avoid sticky or fixed elements (render demotes them anyway), and set `lang` on `<html>`.
- Very tall pages are captured in chunks and stitched automatically. Add `--parts 4000` for phone delivery (writes `out.part1.png`… at ≤4000 device px each).
- **Chinese-first long image**: `<html lang="zh-CN">`. base.css then routes Chinese punctuation to Plex Sans SC, trims line-start punctuation and keeps eyebrows in Sans (Mono spacing looks gappy beside Han). Break display headlines by hand (`<br>`) between words, never inside a two-character word. Use Medium or SemiBold for headings below ~40px *as seen*. Sizes follow the 95% rule (typography.md).
- **doc-summary in IBM design**: the summary title becomes the hero, sections become numbered `fluid-heading-05` blocks, key points become a list with → markers, and the one-line takeaway goes in a G100 zone.

## Slides

Start from `new_page.sh slides`: 6 example slides on the slide kit.
- **Canvas**: `<section class="ibm-slide">`, 1920×1080, on IBM's video grid: **8 columns, 90px margins, 30px gutters**, 7.5px mini unit, rows `auto / 1fr / auto`. Place items with `sl-N` (span) and `sl-start-N`, and put `ibm-slide__body` (top) or `ibm-slide__bottom` (bottom) on the main block. Never absolutely position the footer; `ibm-slide__footer` sits in row 3.
- **Type** (fixed px, from the Carbon scale):

  | Class | Size / leading | Use |
  |---|---|---|
  | `ibm-s-display` | 122 / 130 Light | title slide, 2–3 stacked lines |
  | `ibm-s-title` | 76 / 86 Light | slide titles, which state the insight |
  | `ibm-s-statement` | 60 / 70 Light | one-sentence statement slides |
  | `ibm-s-quote` | 60 / 70 Serif Light | quotes |
  | `ibm-s-number` | 156 / 164 Light, tabular | big-number slides (the scale's top step) |
  | `ibm-s-heading` | 42 / 50 | subheads, the line under a big number |
  | `ibm-s-body` | 28 / 40 | body: **28px minimum** |
  | `ibm-s-caption`, footer | 20 / 30 | captions, sources, footer: **20px minimum** |
  | `ibm-s-eyebrow` | Mono 24 / 30 | kicker |
  | `ibm-s-picto` | 240px | a pictogram on a title or section slide |
- **Layouts**: title · big number · statement · chart (insight as title, chart 8 columns) · **two-up**, either text/visual (`sl-4` + `sl-4 sl-start-5`) or text/text (problem | answer, keyline over the right half) · quote (a G100 zone works well as the pattern break) · section divider · closing with next steps. One idea per slide, ~30 words max, flush left.
- Footer: Mono 20px in `text-secondary`, section on the left and page number on the right. No logo (brand boundary).
- The deck file needs `@page { size: 1920px 1080px; margin: 0 }` (in the template).
- **Export**: `node $S/scripts/render.mjs index.html deck.pdf --frame 1920x1080` (prints the PDF page count against the slide count) and `node $S/scripts/render.mjs index.html 'slide-%d.png' --slides` (every slide, one Chrome launch).
- **Checks**: `audit.mjs index.html --width 1920`, light only (the theme is pinned; `--dark` and phone widths don't apply).
- If the host offers a Slides artifact type and the user wants a shareable deck, use that type and apply these tokens, Plex and grid as its design system.

## Documents / PDF

- A4 or Letter, 20mm margins, 8 columns. Body Plex Serif or Sans 10.5pt / 1.5, headings Sans SemiBold, captions 8pt.
- Running header in Mono 8pt (document title · section), page numbers bottom-right.
- `@media print`: White theme, links followed by their URL in Mono, `break-inside: avoid` on figures and tables. Render with `render.mjs page.html out.pdf`.

## Charts

- Method (form choice, labeling, interaction): **dataviz** skill. Colors: `--cds-charts-*` (color.md). Chrome: semantic tokens.
- **Data colors are for marks, not text.** Labels, values and legends use `text-primary` / `text-secondary`. Many chart colors are under 4.5:1 (e.g. teal-50 on white ≈3.3), and the audit flags them.
- Title = the insight; a subtitle carries units and the period. Label directly where possible; add a legend only for 2+ series, at the bottom.
- Bars and areas start at zero. Never interpolate gaps. Keep tick increments constant; "landmark" labels (a new day, month or year) go in SemiBold.
- Tooltips: `background-inverse` / `text-inverse`, showing both axis values. Hovering a legend item dims the others to 30%.
- **Phones and exports**: an SVG drawn in a fixed wide `viewBox` shrinks its text. **Draw the chart at its container's real width** (1 SVG unit = 1 CSS px; redraw on resize; on narrow widths move labels above the bars and thin the ticks). The templates' `drawBars()`/`drawLine()` show how. `.ibm-scroll-x` (scroll instead of shrink) is only for interactive pages; never use it in PNG/PDF exports, where a scroller just clips the chart. The audit flags chart text rendering under 11px.
- Inline SVG with `stroke="var(--cds-charts-3-1-1)"` works in HTML. For interactive charts in local or self-hosted HTML, Carbon Charts (`@carbon/charts`, Apache-2.0) via jsDelivr is an option. In artifacts, prefer hand-built SVG.
- KPI: a big number (Light, tabular) + a 1–2 word label + a delta with an arrow icon; status color only if it *is* a status.

## Video frames

See `references/style-ibm-video.md` (code-video's style-reference format, with a tested Canvas setup). code-video keeps its pipeline; only the visual layer changes.
