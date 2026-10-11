---
name: ibm-design
description: Visual design in the IBM Design Language and Carbon Design System — IBM Plex type family (Sans, Serif, Mono, Condensed, SC/JP/KR…), the IBM color palette organised as Primitive → Semantic → Component & Data tokens (White ↔ G100 themes), the 2x Grid, Carbon motion, icons and pictograms, plus IBM Enterprise Design Thinking as a light pre-flight. Covers web UI and artifacts, dashboards, editorial pages and long images, slides and documents, charts, and code-video frames. OPT-IN ONLY — use when the user explicitly asks for IBM design / IBM Design Language / Carbon style / IBM Plex / "the IBM look" (IBM 设计 / IBM 风格 / Carbon 风格) for something they're making; do not use for generic design requests. Works as a style layer on top of impeccable, dataviz, artifact-design, code-video and doc-summary.
---

# IBM design

Version 1.0.0 (2026-10-10) · history in `CHANGELOG.md`.

A general visual-design skill. It sets **which fonts, colors, grid and motion to use, and how**, following IBM's public design language. It's built from open-source assets only (Plex is OFL; Carbon tokens, icons and pictograms are Apache-2.0), with no IBM account, no Carbon MCP and no proprietary software.

*Offline*: after one-time setup (`install_fonts.sh`, and the first render installing puppeteer-core and icon lookups filling `~/.cache/ibm-design`), rendering and auditing work offline. Pages you deliver load Plex from Google Fonts by default; scaffold with `--fonts` for a portable folder that embeds Plex (Latin; CJK falls back to local or system fonts).

## Decisions baked in (agreed with the user, 2026-10-10)

| Topic | Decision |
|---|---|
| Trigger | Opt-in, only when the user names IBM design / Carbon / Plex |
| Layering | **Style layer.** impeccable, dataviz and artifact-design keep their method; this skill replaces their visual choices. code-video and doc-summary swap Paper Atlas for this style when asked |
| Brand | **IBM-grounded, unbranded.** Never the IBM logo, 8-bar, Rebus or IBM bylines; Plex, tokens, icons and pictograms used freely |
| Themes | **White ↔ G100**, following `prefers-color-scheme`. G10/G90 for inline-theme zones |
| Color | Blue 60 owns interaction; **one expressive family per piece** (purple, cyan, teal or magenta); status hues reserved; data palettes exempt |
| Type | The whole Plex family is available. Conventions are informed guidance, not bans |
| Method | Light EDT pre-flight: a Hill (Who / What / Wow) before non-trivial work |
| Knowledge | **Built in**: generated tokens + curated rules. **Lookup**: component usage, gallery, case studies (`references/lookup.md`) |

## Workflow

1. **Pre-flight (EDT).** For anything beyond a tweak, write a Hill: *Who* (a specific user and situation), *What* (the outcome), *Wow* (the measurable difference). Let it decide hierarchy: what's first, what's big, what gets the accent. See `references/principles.md`.
2. **Pick the medium and mode** with `references/media.md`. Productive is for UI and tasks; expressive is for editorial moments. Choose the theme, and choose the **one accent family** if the piece is expressive.
3. **Start from tokens, never raw values.** Scripts live in `~/.claude/skills/ibm-design/scripts/` (call them by that full path, written `$S/scripts/…` below).
   - HTML: `bash $S/scripts/new_page.sh <dashboard|editorial|slides|specimen|blank> <out-dir> [--lite] [--fonts] [--force]` gives a self-contained folder with `index.html` and `ibm/tokens.css`, `type.css`, `base.css`. `--fonts` embeds Plex WOFF2; it refuses to overwrite without `--force`.
   - Canvas or other runtimes: read `tokens/tokens.json` (snippet in `references/style-ibm-video.md`).
   - Exact names and values: grep `tokens/TOKENS.md` (each semantic token has a usage description and its primitive per theme).
4. **Compose**: type (`references/typography.md`), color (`references/color.md`), grid, spacing and motion (`references/layout.md`), imagery (`references/imagery.md`). Kit components are `.ibm-*` classes in `tokens/base.css`: grid and span helpers, header (collapsible), side nav, page header, buttons (incl. danger tertiary/ghost), tags, tiles/KPIs, fields/select/checkbox/radio/toggle, notifications, modal, snippet, table (stacking), and the slide kit.
5. **Verify, then look.**
   - `node $S/scripts/audit.mjs <page> [--dark] [--width N] [--view-width N]` checks text contrast (chart text included), legibility of scaled SVG text, Plex-only fonts (incl. a real CJK face for Han), off-palette colors, the accent count, icon contrast, keyboard focus rings and horizontal overflow. **Runs by medium**: web/editorial → light, `--dark`, `--width 390` · phone long image → `--width 390` · slides → `--width 1920` (light; pinned). Target zero errors.
   - `node $S/scripts/render.mjs <page> out.png` (also `--width 390 --scale 2.77` for phone long images, `--frame 1920x1080`, `out.pdf`, `--slides`, `--selector`, `--click`/`--eval` for states, `--parts`). Tall pages are stitched automatically. **Read the PNG** and judge it against the principles; the audit can't see composition.
   - `node $S/scripts/contrast.mjs <fg> <bg> [--theme g100]` or `--accent <family>` for any new pairing (pass the colors as separate, quoted arguments).
6. **Playback.** Present the result as the user's story first (who can now do what), then the design, then specific questions.

## The rules (apply directly; details in references)

**Color**: `references/color.md`
1. UI code uses **semantic tokens** (`var(--cds-text-primary)`, `--cds-layer-01`…) and component tokens. Primitives (`--ibm-purple-60`) appear only in accent variables and illustration. No raw hex.
2. Gray dominates (≈80–90% of a surface), **blue means "you can act here"**, and one accent family adds expression. Red, green, yellow and orange mean status only, always with an icon or words.
3. Depth comes from **layer tokens** (background → layer-01 → 02 → 03), not shadows. Shadows only on floating menus and modals.
4. Accent grades: text **60–70 on White/G10, 30–40 on G90/G100**; tint fields 10–20 (light) or 80–100 (dark). The same grade gives the same contrast in every family.
5. Charts use `--cds-charts-*` **in order**: `<n>-<option>` for 1–5 series, `14-1` beyond, `mono-*` sequential, `diverge-1` (red↔cyan) for temperature-like data, `diverge-2` (purple↔teal) otherwise. Gray for context series. **Data colors are for marks; chart text uses text tokens.**
6. Gradients only in illustration: linear 45°, adjacent hues of one approved family, grades 30–60, never radial.

**Type**: `references/typography.md`
7. Every word is in IBM Plex. Sans is the default voice; **Serif** for editorial reading and quotations; **Mono** for code, values, eyebrows and technical captions; **Condensed** for dense data; **Sans SC/TC/JP/KR** for CJK (95% size, same line height); **Math** with Serif.
8. **Flush left, sentence case**, sizes from the Carbon scale, one emphasis at a time. Big display type in **Light 300**; product weights are Light/Regular/SemiBold, but all eight weights (incl. Text 450, not in Canvas) and italics are available. Fixed canvases (slides, frames) use fixed px (`.ibm-s-*`), never fluid classes.
9. Long headlines are stacked over 2–3 lines. Titles state the insight. The → arrow is a house device.

**Layout and motion**: `references/layout.md`
10. **2x Grid**: 4/8/16 columns at sm/md/lg (320/672/1056px), 32px gutters (wide), 16px (narrow) or 1px (condensed tiles). Max width 1584px. 8px mini unit; spacing from the 2–160px scale.
11. **Square corners** (tags and pills are the exception). Balanced asymmetry with generous negative space, offset text columns, a pattern and one deliberate break.
12. Motion: productive (70–240ms) for UI, expressive (240–700ms) for rare moments. Grid-aligned paths, never diagonal, never bouncing. Honor reduced motion.

**Craft and access**
13. WCAG AA in **both themes** (4.5:1 text, 3:1 large text and graphics). A visible 2px focus ring. Status shown by at least 3 of: color, icon, shape, text.
14. Icons: Carbon icons at 16/20 (UI) or 24/32, single color. Pictograms ≥48px, one color family, as concepts, never as controls or logos. Fetch both with `scripts/icon.mjs`.
15. Brand boundary: no IBM logo, 8-bar, Rebus, IBM byline or imitation IBM product UI.

## Working with the other skills

- **impeccable** (UI critique, polish, UX copy): run its process. Where it suggests fonts, colors, radius, shadows or motion, use this skill's tokens and rules instead.
- **dataviz**: use its chart-form and labeling method, and replace its placeholder palette with `--cds-charts-*` and chart chrome tokens (color.md → Data visualization).
- **artifact-design / Artifact tool**: publish the scaffolded folder (page + `ibm/*.css` via `files`), or inline `tokens.lite.css` + `base.css`. Fonts come from Google Fonts only; Chinese uses the `local()` / system fallback.
- **code-video**: keep its whole pipeline and use `references/style-ibm-video.md` as the style reference in place of `style-paper-atlas.md`.
- **doc-summary** (long image): when IBM design is asked for, lay the summary out with the editorial structure (media.md → Long image) and render with `scripts/render.mjs`.
- Real `@carbon/react` code is fine if the user wants it. Verify APIs on react.carbondesignsystem.com, not from memory. carbon-builder and the Carbon MCP are deliberately not used (they require an IBMid).

## Built in vs. lookup

- **Built in (trust and apply)**: tokens (`tokens/`), the rules above, references/*.md, the templates.
- **Look up when needed** (`references/lookup.md`): a specific Carbon component's usage, a pattern (empty states, forms, dialogs, filtering), gallery examples to borrow technique from, the EDT toolkit activities, deep specs (illustration line weights, infograms). Fetch raw MDX from the public GitHub repos (more complete than rendered pages), paraphrase it, and never sign in.

## Files

| Path | What |
|---|---|
| `tokens/tokens.css` | All four themes + component + data + type/space/motion variables (generated) |
| `tokens/tokens.lite.css` | White ↔ G100 core, for single-file deliverables (generated) |
| `tokens/type.css` | `.cds--type-*` classes: productive, expressive, fluid (generated) |
| `tokens/tokens.json` · `TOKENS.md` | Machine / agent-readable tokens with descriptions and primitive refs (generated) |
| `tokens/base.css` | Hand-written kit: reset, grid, buttons, tags, tiles, fields, notifications, table, header, accent vars |
| `templates/` | `specimen.html` (living reference), `dashboard.html` (productive, phone shell, stacking table), `editorial.html` (expressive, CJK aside), `slides.html` (6-slide deck on the slide kit) |
| `references/` | `color` · `typography` · `layout` · `imagery` · `media` · `principles` · `style-ibm-video` · `lookup` |
| `scripts/build_tokens.mjs` | Regenerates `tokens/` from `@carbon/themes`, `colors`, `type`, `layout`, `motion`, `charts` |
| `scripts/install_fonts.sh` | Installs Plex OTFs for the user (`--all` adds TC/JP/KR; `--check`) |
| `scripts/render.mjs` · `audit.mjs` · `contrast.mjs` · `icon.mjs` · `new_page.sh` | Render (PNG/PDF/slides/stitched long images), verify, check pairs, search and fetch icons/pictograms (aliases, `--px`, `--color`, `--inner`), scaffold |

Maintenance: `node scripts/build_tokens.mjs` refreshes tokens to the latest Carbon (the header of each file records versions). Re-run `scripts/install_fonts.sh` on a new machine. Puppeteer-core is installed on first render into `~/.cache/ibm-design`; it uses the local Chrome.
