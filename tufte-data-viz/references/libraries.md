# Library notes

Follow the host's typography rule when available; otherwise use the bundled helper's defaults for Matplotlib and an available readable font stack for web output. For web export, the fonts must exist in the browser or Kaleido environment that renders; a CSS fallback does not make a server render deterministic. Inspect the exported image, not only the live view.

## Matplotlib and seaborn

- Make this skill's `scripts/` directory (or a host-maintained equivalent) available on the module path and import the needed helpers from `tufte_mpl`. For scripts, use `PYTHONPATH="$PWD/scripts${PYTHONPATH:+:$PYTHONPATH}" python examples/matplotlib-minimal.py` from this skill's directory so imports remain at the top; interactive sessions may add the directory to `sys.path`. The module registers a CJK-safe font by file path and supplies range-aware tick formatting. Do not copy its setup or font code.
- `tufte_style()` turns on constrained layout and leaves `savefig.bbox` unset. Keep it that way: pass a fixed `figsize`, save with the default bbox, and read back the saved size.
- `add_titles(fig, title)` alone is the default; pass a subtitle only when it carries decoding context.
- Endpoint labels usually suit up to four series; more are fine when the final-size check confirms clear identification. Use `adjustText` for crowded point labels or a compact legend when needed.
- Format ticks with units through `HumanFormatter` or an explicit formatter, never offset or scientific notation.
- See `examples/matplotlib-minimal.py`.
- `assets/fonts/` remains only because existing project scripts register those files by path; new code takes fonts from `tufte_mpl`.

`tufte_style()` supplies a default appearance as well as useful setup. A selected system may override its fonts, facecolors, tick colors, and other appearance settings after that call and before creating artists. Some helpers also pass explicit styling at creation time: `add_titles` fixes text colors and sizes, `direct_label` fixes defaults for its label, `annotate_point` adds an italic annotation and gray leader, and `sparkline` supplies colored extrema. Pass supported overrides, adjust the returned artists, or use the plotting API for those artists; setting rcParams alone does not override explicit arguments. Keep the shared helper unchanged. For IBM token and font handling, read [design-system integration](design-systems.md).

## Plotly

- Set axes, grid, legend, margins, hover, and mode bar explicitly. Use explicit width, height, and scale for static export and responsive config for screen.
- Check that autorange does not truncate bars. Keep hover content available in surrounding text or a table.

## Chart.js

- Configure scales, grid, legend, tooltip, and animation explicitly. Use `chartjs-plugin-datalabels` only when labels stay readable.
- Provide an accessible summary or table outside the canvas. Check device-pixel scaling and reduced motion.

## ECharts

- Set `grid`, axes, `splitLine`, legend, tooltip, and animation explicitly. Use `endLabel` for a few series and a legend for dense views.
- Use `media` queries for narrow layouts and semantic theme tokens for dark mode. Verify label overlap and the final canvas or SVG.

## Recharts

- Use `ResponsiveContainer` or a measured parent. Configure axes and grid deliberately. Remove `<Legend>` only when another identification remains legible.
- Keep data transforms outside render components. Test narrow and wide containers and empty data.

## D3, SVG, and HTML

- Give the SVG an accessible name and a `viewBox` with a responsive strategy. Draw only the domains, ticks, and reference lines needed for reading.
- Make interactive marks focusable and expose hover content on focus or tap.
- Tables: semantic HTML, right-aligned numbers, restrained rules, no zebra striping.
- Do not strip `<rect>` elements mechanically; bars and deliberate backgrounds are rectangles.
- See `examples/web-minimal.html`.
