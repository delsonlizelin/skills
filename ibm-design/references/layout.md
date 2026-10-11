# Layout: 2x Grid, spacing, shape, motion

## The 2x Grid

IBM's layout system is built on **divisions of two**: split the live area (inside the margins) into 2, 4, 8 or 16 equal columns, and keep that choice through the piece. Sizes are multiples of a **mini unit**: **8px** for screens, and for print it grows with viewing distance (2mm handheld, 4mm arm's length, 8mm posters, 16mm human-scale…). Things align to a column edge, a gutter or the **type baseline**, never "about there". Editorial layouts may derive a baseline unit from the body leading, or combine baseline and mini unit.

Layout character (IBM DL): **Essential** (form follows function, ample negative space), **Dynamic** (balanced *asymmetry*, movement, an occasional surprise; make a pattern and break it, e.g. AABA section rhythm), **Engineered** (everything aligned to the grid and to each other, with repeated ratios). The four-column grouping is the backbone of most IBM pages.

| Breakpoint | Min width | Columns | Outer margin | Gutter (wide) |
|---|---|---|---|---|
| `sm` | 320px | 4 | 0 (columns' own 16px padding forms the edge) | 32px |
| `md` | 672px | 8 | 16px | 32px |
| `lg` | 1056px | 16 | 16px | 32px |
| `xlg` | 1312px | 16 | 16px | 32px |
| `max` | 1584px | 16 | 24px | 32px (content stops growing at 1584px) |

**Gutter modes** (mixing them on one page is normal)
- **Wide (32px)**, the default: content sits in the column with 16px padding each side, and type never hangs into the gutter. Labeled form fields always use wide.
- **Narrow (16px)**: a container hangs 16px into the gutter so the text inside it aligns with text outside it. This is the most common mode in product UI.
- **Condensed (1px)**: tiles butt together, separated by 1px `border-subtle` lines, giving the "grid of panels" look for dashboards, overview tiles and image mosaics.

**Page models** (behavior beyond the `max` breakpoint): **Editorial** is centered, max 1584px, for marketing and articles. **Product and docs** has a left nav and a max-width content area. **High-density** runs the full browser width, for dashboards and catalogs.

A minimal CSS grid that follows it:
```css
.grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); column-gap: 2rem;
        max-width: 99rem; margin-inline: auto; padding-inline: 1rem; }
@media (min-width: 42rem) { .grid { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
@media (min-width: 66rem) { .grid { grid-template-columns: repeat(16, minmax(0, 1fr)); } }
@media (min-width: 99rem) { .grid { padding-inline: 1.5rem; } }
.grid--narrow { column-gap: 1rem; }  .grid--condensed { column-gap: 1px; }
```
Typical spans at `lg`: text column 8 of 16 (≈ 60–75 characters), sidebar 4, full-bleed 16, "offset" text starting at column 5 or 9 (the expressive editorial move).

**Aspect ratios** for tiles, images and video: **16:9, 4:3, 3:2, 2:1, 1:1** (and Carbon's 2:3; portrait versions for mobile). **Fixed sizing scale** for boxes: 8 · 16 · 24 · 32 · 48 · 64 · 80px. A box can be fluid (columns), fixed (scale) or hybrid, e.g. a header with fluid width and fixed 48px height.

## Spacing scale

`--cds-spacing-01…13` = **2 · 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 160 px**.
- Inside components: 01–05 (2–16px). Between related elements: 05–07 (16–32px). Between sections: 09–12 (48–96px). Hero air: 13 (160px). More space around something = more importance; use space, not dividers, to group. Sections may be dense, but the page shouldn't be crowded.
- Fluid spacing for expressive pages: `--cds-fluid-spacing-02/03/04` = 2vw / 5vw / 10vw.
- Control heights: `--cds-size-xs…2xl` = 24 · 32 · 40 · 48 · 64 · 80px (buttons and inputs default to 48px `lg`, 40px `md` in dense UI).
- Icons: 16px (`icon-size-01`) and 20px (`icon-size-02`) in UI; 24/32 for larger targets.

## Shape and surface

- **Square corners** are the default. Buttons, inputs, tiles, cards, modals and images have `border-radius: 0`. Exceptions: tags and pills (full radius), avatars (circle), and small 2–4px radii only where a Carbon component itself uses them.
- Depth comes from **layer tokens**, not shadows (see color.md).
- **Rules and keylines**: 1px `border-subtle-*` dividers; a thicker 2–8px rule in the accent or `border-strong` marks sections in editorial work.
- Generous negative space is part of the look. Leave empty columns on purpose rather than filling them.
- Inputs use a **bottom border** (`border-strong-01`) on a `field-0N` fill, not a full box.

## Fixed canvases

| Medium | Canvas | Grid |
|---|---|---|
| Slide / video frame | 1920×1080 (16:9) | IBM's video grid: **7.5px mini unit, snapping in 30px steps**, **8 columns** by default (16 if needed). Use 90px outer margins and 30px gutters (kit: `.ibm-slide`). Title zone: top quarter. Safe area: inner 90% for video. Type inset 15px from keylines |
| Long image (phone) | 1080px PNG, any height | **design at 390 CSS px** (the 4-column `sm` grid, phone type sizes), export `render.mjs --width 390 --scale 2.77`. Tall pages are chunked and stitched; `--parts 4000` for phone delivery |
| Long image (desktop) | 1440 wide | 16 columns, as web `lg` |
| Document page | A4 / Letter | 8 columns, 20mm margins. Body 10–11pt Plex Sans/Serif |
| Square social card | 1080×1080 | 8 columns, 64px margin |

Measure image and tile widths to columns and let the height follow the aspect ratio. Slides use **fixed** px type (`.ibm-s-*`: display 122, title 76, statement 60, body ≥ 28, captions and footers ≥ 20). Never fluid classes on a fixed canvas. One idea per slide, left-aligned to a column edge (IBM layouts are rarely centered), and generous empty columns.

## Motion

Two modes, as with type:
- **Productive**: quick and unobtrusive, for UI feedback, menus and expanding panels. `--cds-easing-standard-productive` with `--cds-duration-fast-01/02` (70/110ms) for micro-interactions and `moderate-01/02` (150/240ms) for panels.
- **Expressive**: noticeable, for page transitions, hero reveals, and moments that signal something important. `--cds-easing-*-expressive` with `moderate-02`, `slow-01/02` (240/400/700ms).
- Use `entrance` curves for things appearing and `exit` for leaving. Exits are a little faster than entrances.
- Expressive is for **rare, important moments**: page open, the primary action, alerts. Larger distance or size → longer duration. Things that leave but stay nearby (side panels) use `standard`, not `exit`.
- Choreography: paths follow the grid (horizontal or vertical, **never diagonal**); stagger items by **~20ms, with the whole sequence ≤500ms**. Load order: static shell → static body → dynamic content → primary action → data viz.
- IBM animation craft: one focal point at a time, controlled single-axis camera moves, and the **inverse complexity rule** (dense design → subtle motion, sparse design → bolder motion). Animate *between palette colors* rather than cross-fading opacity, grow strokes from 0 instead of fading them in, and snap precisely into place.
- Movement is mechanical, precise and linear in path. There's no bounce or elastic overshoot, and nothing loops for decoration.
- Respect `prefers-reduced-motion`: drop to opacity changes or none.
- In video (code-video), the same holds: elements enter on the grid with expressive easing, move along straight paths, and hold.
