# Style: "IBM Design" (alternative visual style for code-video)

A precise, editorial explainer in the IBM design language: Plex on calm gray grounds, an exposed grid, one accent hue, pictograms and line illustration, and data drawn as clean marks. Everything is **engineered and placed on the grid**; ideas arrive by alignment, scale and color change, not by decoration. Use it when the user asks for a code-video "in IBM design / Carbon style". It replaces `style-paper-atlas.md`; the pipeline (narration, timing, score, mix, subtitles, delivery) is unchanged.

## Setup for Canvas (`@napi-rs/canvas`): tested snippet

```js
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { GlobalFonts, loadImage } from '@napi-rs/canvas';

const SKILL = path.join(os.homedir(), '.claude/skills/ibm-design');
GlobalFonts.loadFontsFromDir(path.join(os.homedir(), 'Library/Fonts'));   // fonts from scripts/install_fonts.sh
// Use the static families ("IBM Plex Sans"…). The "IBM Plex Sans Var"/"Mono Var" families it also registers expose only 400.

const T = JSON.parse(fs.readFileSync(path.join(SKILL, 'tokens/tokens.json'), 'utf8'));
const THEME = 'g100';                                              // or 'white' — one per film
const DARK = THEME === 'g90' || THEME === 'g100';
export const tok = (n) => { const e = T.semantic[n] ?? T.component[n]; if (!e) throw new Error(`unknown token "${n}" — grep tokens/TOKENS.md`); return e.values[THEME].value; };
export const ibm = (fam, g) => T.primitive[fam][g];               // ibm('teal', 40)
export const data = (g) => T.data[DARK ? 'dark' : 'light'][g].map((c) => c.value);   // data('1-4'), data('mono-4')

// Fonts: weights in steps of 100 only (a "450 60px" string is misparsed as a 450px size) — so no Text 450 in canvas.
// Always list the CJK face explicitly; canvas does not fall back to it on its own.
export const font = (px, w = 400, fam = 'Sans') => `${w} ${px}px "IBM Plex ${fam}", "IBM Plex Sans SC"`;   // fam: Sans | Serif | Mono | Sans Condensed

// Motion tokens are CSS strings — convert for canvas
export const ms = (k) => parseFloat(T.motion.durations[`duration-${k}`]);           // ms('slow-01') → 400
export function easing(name) {                                                       // easing('standard-expressive') → t ↦ eased t
  const [x1, y1, x2, y2] = T.motion.easings[`easing-${name}`].match(/[\d.]+/g).map(Number);
  const bez = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x) => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; bez(x1, x2, m) < x ? (lo = m) : (hi = m); } return bez(y1, y2, (lo + hi) / 2); };
}

// Pictograms: rasterize at the target size (not 64px), recoloured
export const picto = async (name, px, color) => loadImage(Buffer.from(
  execFileSync('node', [path.join(SKILL, 'scripts/icon.mjs'), name, '--pictogram', '--px', String(px), '--color', color], { encoding: 'utf8' })));
// UI icons the same way: [icon.mjs, name, '--size', '32', '--px', '48', '--color', c]
```

## Materials

| Material | How | Use |
|---|---|---|
| Ground | flat fill `tok('background')` | every frame; no textures, paper or grain |
| Layers | rects in `tok('layer-01')`, `layer-02` (one grade step each) | panels, cards, data tiles |
| Grid keylines | 1px `tok('border-subtle-01')` on column edges, shown on purpose (decorative, so 2.3:1 is fine) | the "engineered" signature; reveal by growing from 0 |
| Informative lines | 2px `tok('border-strong-01')` (≥3:1) | chart axes, connectors that carry meaning |
| Pictograms | `await picto(name, 144–240, color)`; find names with `icon.mjs --search <concept> --pictogram` (searches aliases too). For abstract subjects use stand-ins: networking → `laptop`, `servers`, `globe`, `tree--diagram`, `database` | concepts; **≥ 144px** on a 1080p frame |
| UI icons | `icon.mjs <name> --size 32 --px 48 --color …` | small functional marks next to labels |
| Line illustration | `ctx.stroke` paths on a 30px sub-grid, 2–6px weights, `lineCap='square'`, 45°/90° angles, quarter-circle elbows | mechanisms, systems, "how it works" |
| Arrowheads | an open 45° chevron, same stroke as the line, arms = 3× stroke width, square caps (Carbon's `arrow--right` geometry) | direction on connectors |
| Data marks | bars, lines, dots from `data(...)` | numbers; the title states the insight |
| Big numerals | Plex Sans Light 240–400px, tabular | the rare big moment |

## Palette

- Ground and text from the theme: `background`, `layer-01/02`, `text-primary`, `text-secondary`, `border-subtle-01`, `border-strong-01`.
- **Blue** means "the thing in focus / the active step". On G100 use `interactive` (blue-50) for lines and blue-40 for text.
- **One accent family per film** (purple, cyan, teal or magenta), at text-safe grades: 30–40 on G100, 60–70 on White. It carries the subject (for example, teal = the answer, purple = the model). Write the role in the project's STYLE notes.
- **Data in a film** (data colors are exempt from the one-accent rule, but restraint reads better on screen):
  - *Highlight vs context* (the common case): the accent family's single color (`1-x` group or a 40/50 grade) for the series that matters, `border-strong-01` gray for the rest.
  - *Magnitude*: the `mono-*` ramp of the accent family.
  - *Several equal categories*: the `<n>-<option>` group in order. Pick an option that contains the accent family.
  - Marks need ≥3:1 against the ground (on G100, grades 40–60). Check with `contrast.mjs`. Text labels stay `text-primary/secondary`, never data colors.
- Status colors only where the narration is about risk or outcome, always with an icon or word.

## Typography

- `font(px, weight, fam)` from the setup. Weights: Light 300 for display, Regular 400, SemiBold 600 (all of 100–700 in steps of 100 work; 450 doesn't).
- Sizes by frame type (the usable height is y = 0–860; subtitles live below):

  | Frame | Headline | Body / labels | Eyebrow |
  |---|---|---|---|
  | Title / chapter | 120–156px Light, 2–3 stacked lines | 36px | Mono 24–30px |
  | Mechanism / diagram | 60–76px Light, **one line** (≤ 15% of height) | 30–36px | Mono 24px |
  | Data | 60–76px, the insight as a sentence | 28–30px axis labels | Mono 24px |
  | Big number | numeral 240–400px Light + 36–42px label | — | Mono 24px |
- Type is flush left, **inset 15px (half a gutter) from its column keyline**, so the line never runs through the first letter. Sentence case. All caps only for Mono codes.
- Words are selective: label what the picture can't say, never print the narration. Nothing below 24px.
- **No text below y = 860.**
- Subtitles: Plex Sans SC / Plex Sans **SemiBold** 46–52px, `#ffffff` with a 2px gray-100 outline or a `rgba(22,22,22,.72)` box, centered at the bottom (the one centered element).

## Layout

- Video grid: 8 columns, **90px outer margins, 30px gutters, 7.5px mini unit** (sizes in multiples of 30 snap cleanly). Column width at 1920 is (1920 − 180 − 210) / 8 = 191.25px.
- Vertical budget above the subtitle zone (0–860): eyebrow plus headline in the top ~25%, the main visual in the middle ~60%, and a caption or source line at ≤ y 850.

## Motion

- Easing: `easing('standard-expressive')` and `easing('entrance-expressive')` for reveals, `easing('standard-productive')` for small label changes. Durations `ms('moderate-02')` to `ms('slow-02')` (240–700ms), longer for larger moves.
- Paths follow the grid, horizontal or vertical, **never diagonal**. Stagger related items by ~2–4 frames, with the whole group ≤ 0.5s.
- Prefer: lines and keylines **growing from 0**, panels **wiping** along a column, color **transitioning between palette values** (gray → accent) rather than opacity fades, numbers counting up in tabular figures, the camera making controlled single-axis moves (push into a tile, pan along a row).
- **Inverse complexity**: a dense frame gets subtle motion, a sparse frame gets one bold move.
- Hold ≥ 1.5s after things settle. Motion is smooth throughout (no held-frame stop-motion; that's Paper Atlas).

## Tone

Clear, confident, curious. Restraint signals seriousness: fewer elements, more space. Risk chapters narrow to grays, one status color and text. No mascots, faces, emoji or jokes.

## Accuracy

Same as Paper Atlas: a `SOURCES.md` claim table, every on-screen number checked, and illustrative values marked "≈" or "illustration" on the frame. Charts must be honest: bars start at zero, no implied precision.

## Engineering rules

Identical to code-video's (scene modules, narration-driven timing, cache keys, no per-frame asset builds, apply `ctx.globalAlpha`). Load pictograms once per film (cache the `Image`). Swap the shared torn-sheet wipe for a **column wipe**: a `layer-01` panel sweeping across one column at a time with expressive easing.

## Banned

Paper, grain, halftone, tape, torn edges, drop shadows, glows, lens flares, gradients on UI-like panels, rounded "bubbly" cards, bounce, elastic or pulsing motion, centered body text, title case, more than one accent family outside data, the IBM logo, 8-bar or Rebus, and any fake IBM product UI.

## Is it an IBM-design film or a slide deck? (ask of every shot)

1. Does the idea happen through a change on the grid (something grows, aligns, recolors, scales or reveals), not text appearing on a static layout?
2. Is there one clear focal point, with everything else gray?
3. Is the type flush left on a column edge, at most one headline, and labels only where needed?
4. Is color doing a job (focus = blue, subject = accent, status = status), with nothing decorative?
5. Does the camera or layout move with intent, and does density vary between shots?
If two or more answers are "no", redesign the shot.
