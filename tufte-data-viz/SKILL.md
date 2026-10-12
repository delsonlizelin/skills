---
name: tufte-data-viz
description: Create, review, or revise charts, tables, and data visualizations for web, notebooks, reports, and static export. Use for truthful encoding, comparison and panel structure, visual hierarchy, labels, accessible interaction, and rendered-output checks. Preserve selected design systems; combine with explicitly requested IBM design for styling without changing analytical meaning.
---

# Tufte data visualization

Make the reader's comparison visible; keep methods in accompanying prose. Composition serves the question, not a fixed chart aesthetic.

Respect explicit user direction, maintained preferences, and the publication or product system before this skill's visual defaults. A system supplies visual treatments, not permission to distort data or lose legibility. Do not change metrics, filters, samples, aggregation, or conclusions to fit a design.

Respect the host's maintained font and output conventions when available. For Matplotlib, reuse the bundled [plotting helper](scripts/tufte_mpl.py), or the host's maintained equivalent; its default appearance is not mandatory when a different system is selected. See [library notes](references/libraries.md).

## Procedure

1. Establish the reader's question, the comparison, the destination, and the actual viewing size. Decide what should be noticed first, understood next, and available for closer inspection.
2. Choose prose, table, or chart and the panel structure that exposes that comparison. Set scales before styling; preserve necessary uncertainty and context even when they complicate the picture.
3. Compose using the relationships below and the selected visual system. Use the report defaults as starting points; render static output at fixed dimensions.
4. Inspect the delivered artifact against the question and the delivery checks. For a review, describe observed symptom → perceptual relationship → proposed change → check; preserve what already works.

## Compose the comparison

- Put quantities on a shared alignment when readers must compare them. Use small multiples when overlap hides individual patterns; do not split a legible comparison solely because it exceeds a series-count default. Keep scales comparable when magnitude is the question.
- Make grouping agree with meaning. Keep a label closer to its marks than to competing marks, group related panels, and place shared context once where its scope is clear. Check these relationships again after wrapping or reflow.
- Establish emphasis through position, scale, weight, and space before adding color. Reduce competing titles or callouts. Equal peers need equal visual standing; a focal-series treatment needs an analytical reason.
- Use whitespace and alignment to separate and connect. Size panels for the evidence and reading order, not equal-sized boxes or a required percentage of ink. A grid supports the comparison; it does not determine it.
- Judge type, line spacing, label density, and mark weight together at the final size. Reflow, change orientation, or facet instead of shrinking or truncating essential content. Keep enough axes, reference lines, and identification to recover the comparison.

These principles are self-contained; they do not require another design skill. If a system is explicitly selected, use its permitted fonts, colors, spacing, and treatments to achieve these relationships. For Tufte plus IBM, read [design-system integration](references/design-systems.md); IBM remains opt-in.

## Report-chart defaults

Starting points for a report chart, not universal limits or slots to fill. Depart when the task, medium, or selected system warrants it and inspection at the actual size confirms a readable comparison. A two-line title or five distinguishable series can be appropriate. Preserve concise annotation, full names, and essential decoding context; flexibility is not permission to crowd the figure.

| Element | Default |
|---|---|
| Title | Prefer 1 line, <= 12 words; omit when a caption supplies it |
| Subtitle, footer | none; each <= 2 lines, <= 24 words when needed |
| Narrative total | <= 45 words across title, subtitle, footer, callouts |
| Callouts | <= 2 per figure, <= 8 words each |
| Plot region | plot rows >= 65% of canvas height, gaps excluded |
| Text at final size | labels >= 10 pt; notes >= 9 pt; title 14-16 pt |
| Lines, points | primary 1.5-2 pt; context >= 1 pt; points 3-5 pt |
| Series | Usually <= 4 tracked per panel; consider small multiples when identification or comparison becomes difficult |
| Color | 1 accent for a focal series against gray context; equal peers stay distinct |
| Identification | direct labels when they fit at final size, else a compact legend; avoid redundant identification |

Text budgets exclude axis, tick, and series identifiers; for Chinese use line length and wrapping rather than English word counts. No exception paperwork is needed; explain a departure only when its trade-off matters to the reader.

Keep on the figure what decodes the marks (units, period, population, sign, denominator, interval meaning, unequal scales, compressed time), once, near the marks. Formulas, mechanics, and audit counts go to the adjacent note. If essential context exceeds the starting budgets, revise the layout, split the figure, or ship figure plus caption as one unit; never remove a qualification needed to interpret the evidence.

## Honesty

- Bars and filled areas that encode magnitude from a baseline start at zero. Range bars, uncertainty bands, and fills between series show positions or differences; their bounds retain their actual meaning. Lines and points may use a labeled focused range.
- No independent dual axes; an exact secondary scale needs its transform and denominator stated and verified.
- Log scales: positive values, a multiplicative or wide-range rationale, plain labels.
- Break lines at missing expected observations unless interpolation is justified and labeled.
- Session or business-day axes may connect across scheduled closures; disclose compressed time. Elapsed-time axes keep true spacing.
- Preserve material uncertainty and outliers. No silent clipping, smoothing, or aggregation change.
- Never rely on color alone.

## Bad / Good

- Paragraph footer / one decoding cue on the figure, methods in prose.
- Size-encoded markers with a floor and a footnote / constant-size markers, or a calibrated size key.
- Duplicate labels and legend / one clear identification method for the same marks.
- Every peer grayed out / gray only when the peers are context.
- Shrunk labels or tight crop / a revised layout inside a fixed canvas.

## Delivery checks

At delivery size check the intended reading order and comparison, then scales, labels, contrast, glyphs, collisions, clipping, and canvas edges. No `bbox_inches="tight"`; read back export dimensions. Generate marks, labels, and text alternatives from the same data. Read values from data or stdout, never from figure text; print headline numbers. Supply a text alternative; for interaction check keyboard, focus, and reduced motion. Check the themes and viewing sizes that will ship. State what was not tested; visual inspection is not evidence of faster comprehension by users.

## References

Read only what the task needs: [encoding](references/encoding.md), [static figures](references/static-figures.md), [accessibility and interaction](references/accessibility-interaction.md), [libraries](references/libraries.md), or [selected design systems](references/design-systems.md). `examples/` holds one Matplotlib and one responsive web pattern.
