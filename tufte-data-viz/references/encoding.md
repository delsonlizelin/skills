# Encoding and scales

Choose the form from the reader's task, before color or annotation.

| Task | Form |
|---|---|
| One or two values | prose, or a KPI with its comparison |
| Exact lookup across a small set | table |
| Change over ordered time | line; event markers only when they answer the question |
| Ranking or category comparison | sorted horizontal bars |
| Departure from a benchmark | the difference itself against zero, when the analysis supplies it |
| Distribution | histogram, density, box, violin, or ECDF by audience and sample size |
| Relationship | scatter; fit or uncertainty only when supported |
| Composition | stacked bars only when composition is the question and categories stay legible |
| One series is the point, the rest are context | emphasis: one accent, gray context |
| Many series or incompatible units | small multiples on comparable scales |

Prefer an encoding that makes the intended comparison direct. If a mark needs a footnote to be read correctly, try a simpler mark first, but preserve qualifications and uncertainty that belong to the evidence. Pie and donut charts are rarely best for comparison; use sorted bars unless part-to-whole with few categories is the task.

## Scales

Bars and filled areas that encode magnitude from a baseline start at zero. Range bars and uncertainty bands encode interval endpoints, and fills between series encode differences: retain those actual bounds instead of extending them to zero. Lines and points encode position and may use a focused domain; show clear ticks and enough context that a small move does not read as absolute. A Tufte range-frame shortens the visible spine; it is not permission to truncate the scale.

Use log scales only for multiplicative relationships or wide positive ranges, label them plainly, and never place zero or negative values on them.

Use a common scale across panels when magnitude comparison matters. Independent scales are valid for shape comparison; label that choice. Never show two independent measures on one pair of axes. An exact deterministic secondary scale, such as a unit conversion or basis points of a stated denominator, is valid when the transform is stated and verified; do not tune ranges to manufacture correlation.

Disclose aggregation, normalization, smoothing, missing-data treatment, and omitted categories when they change the reading. Show uncertainty in the form the claim supports: intervals, bands, distributions, sensitivity ranges, or sample sizes. Do not fit a line or annotate causation when the evidence shows association only.

## Time axes

Distinguish scheduled closures from missing expected observations. A labeled trading-session or business-day axis may connect consecutive observations across closures; disclose the compressed spacing. Break lines across missing expected observations or deliberately excluded intervals unless an interpolation is justified and labeled. On an elapsed-time axis preserve true spacing and disclose any axis break.

## Special forms

Small multiples: keep panel structure identical, share scales when magnitude matters, put common axis titles at the figure level, and remove repeated chrome.

Sparklines: no axes or grid; give the current value and comparison in adjacent text; mark endpoints or extrema only when they matter.

Slopegraphs: two states with both endpoints labeled; reduce categories when labels collide; highlight only decision-relevant movement.

Heatmaps: a sequential palette for magnitude, diverging only around a meaningful midpoint with a neutral center; include a scale and a text alternative; cell labels help small matrices and clutter dense ones.

Dense series: do not direct-label everything. Highlight a subset, use a compact legend, offer interaction, or facet. Keep a way to identify the rest.
