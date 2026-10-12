# Combining analytical method with a visual system

Read this when a publication, product system, or explicitly requested style constrains a visualization. Tufte alone needs no external style skill. General composition guidance is already in SKILL.md; do not require a second hierarchy pass or import another palette automatically.

## Ownership and conflicts

Tufte governs the question, encoding, scales, comparison, uncertainty, data context, and evidence behind titles. The selected system governs permitted fonts, colors, spacing, and visual treatments. Apply its treatments to the required perceptual relationships: reading order, grouping, label proximity, and equal treatment of peers. A system's title convention can justify departing from a report layout default after inspection at the actual size.

Neither styling nor a palette limit authorizes changes to categories, filters, aggregation, denominators, or conclusions. Prefer a readable arrangement such as facets over silently grouping data into Other. Keep category identities stable across related views and filters, rather than assigning new colors every time a series count changes. Explain a concrete conflict and seek a compatible treatment. If an unattended task cannot meet a styling convention without losing legibility, make the smallest local styling deviation, label it, and preserve the rest of the system. An explicitly non-negotiable user constraint still requires clarification; do not claim completion while it remains unresolved.

## Tufte plus IBM

Use IBM only when explicitly requested. Read the installed [IBM entry point](../../ibm-design/SKILL.md) and only the relevant [color](../../ibm-design/references/color.md), [typography](../../ibm-design/references/typography.md), or token resources. Resolve them relative to the installed sibling `ibm-design` folder; if the host installs skills elsewhere, use that installation path. Tufte fills the chart-method role that IBM's text calls dataviz; this does not require a separate skill with that name. IBM has its own layout and design principles as well as concrete styling rules.

- Use IBM data tokens for marks, semantic text tokens for labels, and chart-chrome tokens for axes and reference lines. Do not use a mark's color for small label text without checking its contrast. Context marks also need sufficient contrast against their actual background.
- Choose the initial categorical palette for the intended peers in the prescribed order, then preserve that assignment across related views. The UI one-accent rule does not limit data palettes. Do not turn a category hue into an alert or interaction cue.
- A finding-led title still needs computed support; monitoring or exploratory titles may stay neutral. IBM supplies title typography and wrapping, not a stronger claim.
- For static exports, pin a theme. Web pages loading IBM `tokens.css` ship both light and dark unless explicitly pinned with `data-theme`; inspect both when both ship. Check narrow layouts by reflowing, not by scaling an entire SVG until its text is tiny.
- Check local Plex availability with `fc-list : family` or IBM's `scripts/install_fonts.sh --check`; do not trust a previous installation claim. Use the requested Plex families, including a real CJK face where needed. Report missing fonts instead of silently substituting and claiming IBM compliance. Install dependencies when the current task authorizes it.

### Matplotlib and other non-CSS renderers

Read actual values from IBM's `tokens/tokens.json`, not a copied palette. Semantic colors are at `semantic.<name>.values.<theme>.value`, with themes `white`, `g10`, `g90`, or `g100`; chart palettes are arrays at `data.light|dark.<group>`, each entry carrying `value` and `ref`. For example, `data.light["5-1"]` is a five-series palette. Keep palette identity separate from data ordering.

Reuse `tufte_mpl`'s numerical and layout helpers. Its default cream background, serif family, and tick colors are not IBM styling. Apply the selected semantic colors and register the installed Plex font files explicitly if Matplotlib's font cache predates installation; resolve the actual files rather than copying another font-registration subsystem. Apply overrides before creating artists, and check helper-created titles, direct labels, annotation leaders, and sparkline highlights for explicit styling that bypasses rcParams. Use ordinary plotting calls where a helper cannot express the selected system. Do not change the shared helper's global defaults to restyle one chart.

The source tokens use web units for typography and spacing. Adapt them to the final physical output size; copying a CSS pixel number into a point size is not a faithful conversion. Read back export dimensions and inspect glyphs, text contrast, mark contrast, and complete labels at the delivered size.

### HTML and SVG

Use IBM's actual semantic/data CSS variables and font stacks. IBM's `scripts/new_page.sh ... --fonts` bundles Latin Plex fonts for portable offline pages; CJK still needs an installed or explicitly bundled face. Remove remote font dependencies for an offline deliverable and wait for fonts before inspecting it. Use the installed renderer and audit where applicable, then inspect the image: automated palette and contrast checks do not judge whether the composition communicates the comparison.
