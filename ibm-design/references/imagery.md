# Icons, pictograms, illustration, photography, diagrams

## UI icons (Carbon icons, Apache-2.0)

- Fetch and inline them with `node scripts/icon.mjs <name> [--size 16|20|24|32]`, search with `--search <concept>` (it searches names, friendly names, **aliases** and categories, so "key" finds `api--key` and "plus" finds `add`), or build a sprite with `--sprite`. Names use Carbon's double-dash convention: `arrow--right`, `checkmark--filled`, `warning--alt`, `chart--line`.
- Options: `--px N` (output size), `--color C` (fill, for PNG and canvas use), `--inner C` (fill the inner glyph of filled status icons; otherwise it's dropped and shows as a hole).
- Drawn on a **32px master grid**: 2px stroke, 2px padding, 2px corner radius, square caps, rounded outsides with square insides, 45° angles (otherwise 15° steps), no perspective. The smaller artboards are scaled versions: 24 (1.5px), 20 (1.25px), 16 (1px).
- **Sizes**: 16px with 14px text, 20px with 16px text, 24/32 for larger targets. Search shows each icon's drawn artboards `[16/20/24/32]`. Most icons are drawn once, on 32, and Carbon itself serves that drawing at every size; `icon.mjs` picks the native artboard when one exists and otherwise scales the 32 drawing, silently and correctly.
- **One solid color** (`fill: currentColor`), matching the adjacent text, with ≥4.5:1 contrast (`icon-primary`, `icon-secondary`, `icon-on-color`, `icon-interactive`). Center-align with text, not on the baseline. Touch targets ≥44px (a 48px `ibm-icon-btn`).
- Status icons carry status color **plus** shape: `checkmark--filled` success, `warning--filled` / `warning--alt--filled` warning, `error--filled` error, `information--filled` info.

## Pictograms (IBM pictograms, Apache-2.0, used freely in this skill)

- `node scripts/icon.mjs --search <term> --pictogram`, then `node scripts/icon.mjs <name> --pictogram`. 1,500+ concepts (cloud, security, data, industries, people, places).
- Drawn on a 32 grid with a fine **0.72px line** (expressive pictograms add 1.44px gradient strokes). They read as concepts, never as UI controls, and never as a logo or lockup.
- **Minimum 48px**: typically 64–128px on web pages, **240px** (`.ibm-s-picto`) on slides and **≥144px** in 1080p video frames. Clearance on every side of at least ¼ of the displayed size. Optically centered. Containers only a square or circle.
- Color: single color by default (`text-primary`, or the piece's accent at a text-safe grade). Tints must be 1–2 grades darker than a light ground or lighter than a dark ground. Use at most one color family; never alert colors; never on a gradient background.
- Grounds: light grounds (white, grade 10–20) take dark/accent pictograms; dark grounds (grade 70–100, black) take light ones.
- Expressive pictograms are used sparingly, as big bold moments: a hero, a section opener, an empty state.

## Illustration styles (when a piece needs drawn imagery)

All of them snap to a grid, use angles 15/30/45/60/75/90°, and use regular circular curves (quarter and half circles).
- **Line**: pictogram logic extended. 4px grid, at most 4 clearly distinct line weights, spacing ≥ line weight. Best for technical subjects.
- **Flat**: bold geometric color shapes on an 8px grid; minimum shape size and spacing 8px. A gradient bar between two adjacent family hues is allowed (see color.md).
- **Isometric**: an equal-angle projection grid, light and airy, for systems, architecture and "how it works".
- **Hybrid UI**: fragments of Carbon UI with line illustration on an 8px grid. Greek the small text: gray-40 regular, gray-60 bold, blue-40 for "interactive" bits; real text in gray-80.
- Color schemes: monochromatic (default), analogous (2–3 neighbors in one approved family), complementary only as small accents. Orange and yellow are reserved for alerts. Informational illustration needs 3:1.
- Canvases 16:9, 4:3, 3:2, 2:1, 1:1. Compose on 2x Grid divisions with a grid-based focal point. **Hero** illustrations can be complex and metaphorical; **spot** illustrations (empty states, small asides) stay simple.

In code-built work, draw illustration as inline SVG on a `viewBox` that's a multiple of 8 (or 32 for pictogram-like work). Use `--ibm-*` primitives through the piece's `--accent*` variables, with `shape-rendering="geometricPrecision"`.

## Photography (if the piece uses photos)

- **Reportage** (real work, documentary, natural color), **portraiture** (dignified, democratic treatment of people), **still life** (hardware, details, how things work).
- Eye level or aerial, nothing contorted. Natural light. Everything in focus (no shallow depth of field), no color washes, filters, glows or heavy retouching, and no abstract "see-say" stock clichés.
- Crop to 16:9, 4:3, 3:2, 2:1 or 1:1, composed on 2x Grid divisions with a clear focal point.

## Technical diagrams and infograms

- **Diagrams**: nodes and connectors on an 8px grid. Nodes default to 48px tall, with a 1px outline, a 24px icon (16px badges), 8px corner radius, and 8px (small) or 16px (large) text margins. Labels: Plex Sans 14/18 SemiBold, secondary 14/18 Regular, connector labels 12/16. Use **orthogonal routing** (square or rounded elbows), never diagonal spaghetti. Multiples of a node are shown as two offset outlines plus "(n)".
- Diagram color, light: White canvas, primary strokes and connectors at grade 50–80 (or black), fills white or grade 10, black text. Dark: gray-100 canvas, primary grade 30–50 (or white), fills gray-100 or grade 90, white text. Keep nodes monochromatic per category and always include a legend.
- **Infograms**: pictogram-style data minis on the 32 grid, with 0.72px data lines (dotted with a 2px gap for projections), a 1.08px highlighted point with a color fill, and data inside a 28px height. They work well as KPI decorations in editorial pieces.
- Artboard widths 1584 / 1312 / 1080px. Ratios 16:9, 4:3, 2:1, 1:1.

For chart method, see the dataviz skill. For chart colors, see color.md → Data visualization colors.
