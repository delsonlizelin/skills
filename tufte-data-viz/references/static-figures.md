# Static figures

For PNG, PDF, print, and report figures.

## Text placement

One title per figure, integrated or in the caption, never both. A finding-led title needs a quantity or comparison emitted by the plotting program; use a neutral title for exploratory or monitoring views. Derive every occurrence of a number from the same computed value.

Apply the decoding rule from SKILL.md to each fragment: keep what is needed to read the marks, once, near the marks; move formulas, selection mechanics, removal counts, and repeated headline values to the adjacent note or report. The footer, when present, usually carries the source and one definition in at most two lines at 9 pt or larger; preserve essential context if more is needed. Write a separate markdown note for the explanatory chain behind an indicator or method; do not load the figure with it.

Panel titles say what differs between panels, in a few words. Axis and legend text are noun phrases with units. Callouts name an event, threshold, or endpoint that changes the reading, nothing the axes or title already say.

## Canvas and layout

Fix the canvas from the destination column or page before layout. Reserve regions for the text the figure actually needs. As a report starting point, plot rows occupy at least 65% of canvas height, gaps excluded and side-by-side panels counted once. If the figure feels text-heavy, remove repeated explanation or revise the grouping; do not sacrifice necessary labels or qualifications to reach a percentage. A justified layout may use a different proportion if the comparison remains readable.

Size panels by the evidence they carry, not by symmetry. Combine panels only when shared alignment creates a comparison; remove a panel that says no more than a sentence. Share axes only for compatible quantities. Carry a shared event band through aligned panels at identical extents and keep it quieter than the paths.

Choose the arrangement by the reader's comparison: an overlay can expose divergence among a few legible peers; aligned small multiples can reveal individual paths hidden by overlap. Neither a series count nor a desire for empty space decides this alone. Keep related panels closer than unrelated sections, and make any shared label's scope visually clear.

Choose type sizes from the final physical size, not the working canvas. If labels only fit after shrinking, change the layout. Wrap or reflow instead of truncating; shorten by removing whole facts, not articles or conjunctions.

A selected visual system supplies title typography, not the finding. Tufte retains title wording and evidence requirements; an IBM headline may wrap across two or three lines while an exploratory chart still uses a neutral title. See [design-system integration](design-systems.md).

## Export

Save without `bbox_inches="tight"` or any automatic cropping; a long text artist must never resize the output. Read back the exported pixel or page dimensions. Export vector when the target supports it, otherwise enough DPI for the physical size.

## Final-size checks

1. Render at the intended output size and view it whole before zooming.
2. Check wrapping, clipping, collisions, glyph coverage, contrast, and every canvas edge. After the first draw, measure crowded labels in display coordinates; data-coordinate offsets do not guarantee separation.
3. Confirm every panel, callout, and text line earns its space.
4. Check grayscale, color-vision deficiency, or print when the destination needs them.
5. Emit headline values and sample counts from the data or program; never transcribe them from the render.
