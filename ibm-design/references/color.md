# Color: four tiers, four themes, one accent

The exact values are in `tokens/TOKENS.md` (with each token's usage description and the primitive it maps to per theme), `tokens/tokens.css` and `tokens/tokens.json`. This file covers how to *use* them.

## The four tiers

| Tier | What it is | Name in CSS | Source | Who may reference it |
|---|---|---|---|---|
| **1 · Primitive** | The IBM palette: 12 families × grades 10–100, plus black & white. No meaning attached. | `--ibm-blue-60` | `@carbon/colors` | Only tier-2/3 definitions, **expressive accents**, and illustration. Never a button, text or surface directly. |
| **2 · Semantic** | Roles: `background`, `layer-01`, `text-primary`, `interactive`, `support-error`, `focus`… Each theme maps every role to a primitive. | `--cds-text-primary` | `@carbon/themes` (DTCG `themes.json`) | All UI and page code. **This is the default tier to reach for.** |
| **3 · Component** | Role-per-component: `button-primary`, `button-danger-hover`, `tag-background-purple`, `notification-background-error`… | `--cds-button-primary` | DTCG `components/*.json` | That component only. |
| **4 · Data** | Chart palettes: categorical, sequential, diverging. Order matters. | `--cds-charts-14-1-3` | `@carbon/charts` | Marks in charts, maps and legends only. |

The primitive grade is a **lightness step that holds across hues**: `purple-60`, `teal-60`, `cyan-60`, `magenta-60` and `blue-60` all have ≈5.0:1 on white. Swapping a family keeps the contrast; swapping a grade changes it.

```
primitive  blue-60 ──┐
                     ├─► semantic  interactive (white, g10) ──► component  button-primary
primitive  blue-50 ──┘              interactive (g90, g100)
```

## Themes

| Theme | Page `background` | Use |
|---|---|---|
| **White** | `#ffffff` | **Default light.** |
| G10 | `#f4f4f4` (gray-10) | Light contrast zone; a softer page for long reading when asked. |
| G90 | `#262626` (gray-90) | Dark contrast zone (e.g. a band inside a White page). |
| **G100** | `#161616` (gray-100) | **Default dark.** |

- `tokens.css` defaults to **White, and switches to G100 under `prefers-color-scheme: dark`**. Force it with `<html data-theme="light">` / `"dark"`.
- **Inline theming** (Carbon's "high-contrast moment"; this skill calls it a *zone*): put `data-carbon-theme="g100"` (or white/g10/g90) on any section. All roles inside it are re-mapped, so components still work. Carbon's own example is a G100 UI-shell header or side panel on a White page. Editorially, use zones for a hero band, a dark data or code panel, a footer, or a spotlight. Use them only for **major** shifts (subtle grouping is layering's job), one to three per page, never in a checkerboard.
- Fixed media without a viewer preference (PNG, PDF, slides, video): pick one theme deliberately and set `data-theme`. Default to White for documents and long images; G100 is fine for video frames and stage slides.

## Layering: depth without shadows

Surfaces stack one step at a time: `background` → `layer-01` → `layer-02` → `layer-03`. On **White** the steps alternate (white → gray-10 → white → gray-10). On **G10** they start white. On dark themes each step gets lighter.

- Match tokens to nesting depth: a card on the page is `layer-01`; a field inside it is `field-02`, its divider `border-subtle-02`. `layer-accent-0N` is the slightly stronger version for selected rows or headers.
- Interaction states have their own tokens: `layer-hover-01`, `layer-active-01`, `layer-selected-01`, `background-hover`… Don't make up `opacity: .8` hovers. The logic behind them: **hover = half a grade** (its own off-palette "hover" value), **active = two grades** (blue-60 → blue-80), **selected = one grade** (gray-10 → gray-20), **disabled = gray family** (exempt from contrast, no hover or focus). Secondary text or icons switch to primary on hover and selection.
- Shadows are only for floating things (menus, popovers, modals): `box-shadow: 0 2px 6px var(--cds-shadow)`. Cards and tiles stay flat.

## Text, links, focus

- `text-primary` for body and headings, `text-secondary` for supporting copy, `text-helper` and `text-placeholder` for form help, `text-on-color` on any saturated fill (buttons, tags, notification bars), `text-disabled` only for disabled.
- Links: `link-primary` (→ `link-primary-hover`), `link-visited`, and `link-inverse` inside an inverse surface.
- Focus: a 2px `focus` outline (plus a 1px `focus-inset` inside it on filled controls). This is always blue on light themes and white on dark ones, and is never removed.

## Status colors are reserved

`support-error` (red), `support-success` (green), `support-warning` (yellow), `support-info` (blue), and `support-caution-major/minor`. The `status-*` component tokens add the full set used in status indicators: **red** danger/error · **orange** serious warning · **yellow** warning · **green** success/normal · **blue** info/in progress · **gray** draft/not started · **purple** outlier/undefined.
- Use them only for state: validation, notifications, health, alerts. A status indicator combines **at least three of: symbol, shape, color, text**. Never rely on color alone.
- A status word with no status color ("Expired", "Revoked", "Archived", "Draft") is **gray + icon** (Carbon: gray = not started / inactive).
- Filled status icons (`warning--filled`, `checkmark--filled`…) have a separate inner glyph (the "!", the "✓"). Render them with `icon.mjs … --inner <color>`: on yellow warning the inner glyph is **dark in every theme**, `var(--ibm-glyph-on-warning)` (black, as Carbon does). On red, green and blue use `var(--cds-text-on-color)`.
- Red, green, yellow and orange **are never decorative accents**, so they keep their meaning. IBM reserves orange and yellow for alerts even in illustration.

## Accent policy (decided for this skill)

1. **Blue owns interaction.** Buttons, links, focus, selection and checked checkboxes/radios use the interactive/blue tokens on every piece, in every mode. (One Carbon exception: a toggle that is *on* shows `support-success` green, its "on/healthy" state.)
2. **One expressive family per piece.** A page, deck or video may add exactly **one** family, chosen from **purple, cyan, teal, magenta** (or stay all-blue). Use it for headline emphasis words, rules and keylines, section markers, pull quotes, illustration and pictogram fills, and large background fields. **Never** use it on buttons, links or anything clickable.
   - This is a strict subset of IBM's **approved color families**: four 4-hue sets, each anchored on blue — *red · magenta · purple · blue*, *magenta · purple · blue · cyan*, *purple · blue · cyan · teal*, *blue · cyan · teal · green*. Any 1–3-hue subset of one set is approved.
   - When an **illustration** (not UI) needs more than the accent, add hues only from one approved set that contains the accent, e.g. a purple piece may draw on magenta and cyan, never teal-with-magenta or green-with-purple. IBM avoids greens with reds/magentas/purples and teals with reds/magentas, except where data viz requires it.
   - IBM warns that large amounts of blue in illustration compete with blue interactive elements. If the accent is "blue only", keep big blue fields away from the buttons.
3. **Grades by job** (same numbers for every family):

   | Job | On White / G10 | On G90 / G100 |
   |---|---|---|
   | Accent text (any size) | **60–70** (60 = 5.0:1, 70 = 7.7:1) | **30–40** (40 = 6.4–7.7:1) |
   | Large text ≥24px, rules, icons, graphics (3:1) | 50–70 | 40–60 |
   | Tinted field behind `text-primary` | 10–20 | 80–100 |
   | Solid field behind `text-on-color` (white) | 60–80 | 60–80 |

4. **Proportion.** Gray structure dominates, roughly 80–90% of a surface. Blue appears where action is, and the accent is a few percent. A large accent field can be one band or a hero, not every section. Use expressive pages (editorial, covers) toward the high end and product UI toward zero.
5. Check any new pairing with `node scripts/contrast.mjs <fg> <bg> [--theme g100]` or `--accent <family>`.

How to declare the accent so it flips with the theme:
```css
:root, [data-carbon-theme="white"], [data-carbon-theme="g10"] {
  --accent: var(--ibm-purple-60);  --accent-strong: var(--ibm-purple-70);
  --accent-field: var(--ibm-purple-10);  --accent-graphic: var(--ibm-purple-50);
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --accent: var(--ibm-purple-40);  --accent-strong: var(--ibm-purple-30);
  --accent-field: var(--ibm-purple-90);  --accent-graphic: var(--ibm-purple-50); } }
:root[data-theme="dark"], [data-carbon-theme="g90"], [data-carbon-theme="g100"] {
  --accent: var(--ibm-purple-40);  --accent-strong: var(--ibm-purple-30);
  --accent-field: var(--ibm-purple-90);  --accent-graphic: var(--ibm-purple-50);
}
```

## Data visualization colors

Use the `--cds-charts-*` tokens. They switch light/dark with the theme, like everything else.

| Need | Group | Light → | Rule |
|---|---|---|---|
| 1 series | `1-1` … `1-4` | purple-70 / blue-80 / cyan-50 / teal-60 | one option per chart |
| 2–5 series | `<n>-<option>` (e.g. `3-1`) | see TOKENS.md | pick the group for **n**, use its colors **in order** |
| 6–14 series | `14-1` | purple-70, cyan-50, teal-70, magenta-70, red-50, red-90, green-60, blue-80, magenta-50, yellow-50, teal-50, cyan-90, orange-70, purple-50 | in order; never reorder or skip. More than 14 → group into "Other" |
| Ordered magnitude | `mono-1` purple · `mono-2` blue · `mono-3` cyan · `mono-4` teal | 11 steps, white → 100 | heatmaps, choropleths |
| Above/below a midpoint | `diverge-1` red↔cyan · `diverge-2` purple↔teal | 17 steps, white mid | correlation, deltas |
| Alerts in charts | alert palette: red-60 · orange-40 · yellow-30 · green-60 (dark: red-50 · orange-40 · yellow-30 · green-50) | — | thresholds and danger zones only |

- Sequential: in light themes the **darkest step = largest value**; in dark themes the **lightest = largest** (the tokens already flip). Diverging: **red↔cyan for temperature-like data** (hot/cold), **purple↔teal for everything else** (performance, change).
- **Data colors are for marks, not text.** Many are under 4.5:1 for text (teal-50 on white ≈3.3). Label values and series in `text-primary`/`-secondary` and tie them to marks with a swatch or position.
- Every color needs a reason. Use **gray for context data** so the highlighted series carries the color; keep one color per data set across a whole dashboard; reinforce with shape, line style or texture.
- Values come from **Carbon Charts** (`@carbon/charts`, matching current `@carbon/colors`). Carbon's docs page shows three slightly different hexes (red-90, magenta-50/60) and swaps a few option groups. Trust the tokens here.
- Data colors are **exempt from the one-accent rule**. On an expressive page, prefer the data group or `mono-*` that contains the page's accent family, so charts and layout feel like one piece (e.g. a purple accent → `1-1`, `2-1`, `mono-1`).
- The method (chart choice, labeling, legends, interaction) comes from the **dataviz** skill. Only its palette is replaced by these tokens.
- Chart chrome uses the semantic tokens: gridlines `border-subtle-01`, axis labels `text-secondary`, titles `text-primary`, tooltip `background-inverse` / `text-inverse`.

## Do / don't

- ✓ `background: var(--cds-layer-01)` · ✗ `background: #f4f4f4`
- ✓ Accent through `--accent*` vars built from primitives · ✗ a primitive used directly in a component rule
- ✓ One accent family + blue · ✗ purple headlines, teal icons and magenta tags on one page
- ✓ Depth through layer tokens · ✗ drop shadows on cards
- ✓ Status color + icon + text · ✗ a red border alone to mean error
- Gradients: ✓ in illustration, pictograms and expressive hero art, **linear at 45°**, between **two hues adjacent in an approved family** (e.g. purple → magenta), grades **30–60**, **at most two steps apart**, never more than two colors, **never radial**. Check text against the gradient's worst stop. ✗ gradients on UI surfaces, cards or buttons, and ✗ gradients that encode data. The `ai-aura-*` tokens are Carbon's only UI gradients, reserved for marking AI-generated content.
- ✗ Off-palette colors: anything not in tokens.json. `scripts/audit.mjs` flags them.
