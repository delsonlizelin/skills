# Interface design decisions from *Refactoring UI*

This reference distills Adam Wathan and Steve Schoger's *Refactoring UI* for a general visual-design skill, with web interfaces as the first application. PDF locators are provenance, not a dependency: apply the guidance without access to the book. Some image-based examples are not fully represented in extracted prose; do not infer an illustration's exact appearance or labels from text alone. In each item, **Book basis** paraphrases the cited prose; **Application / limit** states a use, exception, or implementation judgment.

## Start with content and hierarchy

**The shell is polished, but the task is unclear.** **Book basis:** Design an actual feature and its required information and actions before settling the application shell. Work in short design/build cycles instead of specifying every feature in the abstract. **Application / limit:** Start with one representative task and its states; revisit navigation once the feature set makes its needs visible. Existing product architecture may already constrain the shell. **PDF pp. 7–9, 13–16.**

**Early exploration is stuck on polish.** **Book basis:** Defer typeface, shadow, and icon decisions while testing layouts; drawing with a broad marker or designing in grayscale can force spacing, size, and contrast to carry hierarchy. **Application / limit:** Try a brief low-detail or grayscale pass to expose structural weakness, then restore the chosen visual system. Grayscale is an exploration method, not a final aesthetic or a reason to ignore semantic color. **PDF pp. 10–11.**

**Everything asks for the same attention.** **Book basis:** Visual hierarchy expresses relative importance. Reduce the emphasis of competing elements before making the focal element larger; a sidebar may recede simply by losing a separate background. Weight and color can establish hierarchy without extreme size differences. **Application / limit:** Rank what should be noticed first, next, and on inspection. Keep secondary information legible and discoverable, especially when it supports a decision. **PDF pp. 30–35, 39–40.**

**A solid icon or border feels too strong or too faint.** **Book basis:** Surface area contributes to perceived weight. A heavy icon can be softened by lower contrast; a pale, thin border can gain presence through width instead of a harsher color. **Application / limit:** Adjust weight and contrast together within the existing token or component system. Check the resulting boundary and icon legibility; the book's visual examples do not establish universal widths or colors. **PDF pp. 48–51.**

**Actions look equally important.** **Book basis:** Most pages have a primary action, less prominent secondary actions, and unobtrusive tertiary actions. Destructive meaning alone does not require a dominant red button on the initial view; the confirmation step can carry stronger emphasis. **Application / limit:** Follow the product's action hierarchy and safety conventions, preserving clear focus and discoverability. Do not import the book's particular button styles as mandatory components. **PDF pp. 52–54.**

**Data cards are buried under labels.** **Book basis:** In display data, format or wording can sometimes convey meaning without a separate label; when a label is needed, it may support the value. Dense specifications are an exception where people scan for labels. **Application / limit:** Combine a value and unit when that remains clear. Retain labels for ambiguity, form inputs, and accessible names. **PDF pp. 41–45.**

## Grouping, space, and size

**The page feels cramped despite many small margins.** **Book basis:** Start with ample whitespace and remove it deliberately. A constrained spacing/size scale avoids slow, inconsistent choices; its steps should be distinct enough to matter. **Application / limit:** Select from an established system's spacing tokens. Change the scale only when the system permits it and the requested scope needs it; dense workflows may require tighter rhythms. **PDF pp. 56–64.**

**Relationships are ambiguous.** **Book basis:** A stacked label and input feel disconnected if the gap between them equals the gap between form groups. Similar ambiguity affects section headings and lists. **Application / limit:** Make proximity reflect belonging: tighter within a group, more space between groups. If a border or background already makes grouping unambiguous, extra spacing may be unnecessary. Check wrapping and long content. **PDF pp. 83–86.**

**Content stretches because the viewport is wide.** **Book basis:** Give each element the width it needs. A grid can help layout without forcing a sidebar or control to grow with the page; large and small elements need not shrink by the same ratio on mobile. **Application / limit:** Let content determine useful widths, then test real responsive breakpoints. A wide table or canvas may legitimately need more room. **PDF pp. 65–75, 79–81.**

**Separation has become a network of boxes.** **Book basis:** Borders are useful but can create clutter; spacing, adjacent surface colors, or sometimes a subtle shadow can distinguish regions. **Application / limit:** Choose the least distracting separation that still clarifies structure. Keep explicit boundaries where the task or chosen system needs them; shadows are optional and may conflict with a flat system. **PDF pp. 206–209.**

## Typography and reading

**Type sizes drift across components.** **Book basis:** A short type scale reduces arbitrary near-duplicate sizes; weight and contrast can communicate rank without making secondary text tiny. **Application / limit:** Select the existing type styles first. Check the actual font's metrics and content before adding a style; localization and dense interfaces can change what fits. **PDF pp. 32–35, 88–93.**

**Paragraphs are tiring to scan.** **Book basis:** Limit body-text lines to a readable measure; the authors give about 45–75 characters as a safe starting range. Longer lines need more line spacing, while large headings usually need less relative line spacing than small text. **Application / limit:** Test the actual script, typeface, viewport, and reading context. Short labels and data cells do not need paragraph measures. **PDF pp. 99–101, 105–108.**

**Mixed-size text feels misaligned, or numbers resist comparison.** **Book basis:** Baseline alignment often makes nearby mixed-size text feel coherent; right-aligned numeric table columns help compare values. Long text generally reads better aligned with its language direction than centered. **Application / limit:** Use these relationships where they improve scanning. Center short ceremonial text or use other alignment when the medium and content call for it. **PDF pp. 102–104, 111–114.**

## Color, contrast, and state

**Secondary text looks washed out on a colored surface.** **Book basis:** Lowering white text's opacity can produce dull text; selecting a color relative to the surface works better. Dark text on a light colored surface can meet contrast needs without making the colored block visually dominant. **Application / limit:** Select a suitable color from the chosen system and measure the rendered pair; do not assume an HSL adjustment or color name guarantees accessibility. **PDF pp. 36–38, 142–145.**

**The palette has near-duplicate shades.** **Book basis:** Interfaces need useful neutral, primary, and semantic shades, but ad hoc lighter/darker variants create inconsistency. The book favors defining shades deliberately and notes that neutral-looking colors can have a warm or cool hue. **Application / limit:** Select from existing tokens. Extend a palette only if the system permits and the requested scope requires it; no particular hue, shade count, or color model is universal. **PDF pp. 123–132, 139–141.**

**A chart or status only makes sense in color.** **Book basis:** Color should reinforce meaning already conveyed another way. The authors use icons for direction and differing lightness to distinguish graph lines for viewers who cannot reliably separate hues. **Application / limit:** Add text, symbols, patterns, or shape as the task permits, then verify contrast and accessibility against current product requirements. That verification is an implementation check, not a claim of book compliance. **PDF pp. 142–148.**

## Depth, imagery, and first use

**Elevation cues are inconsistent.** **Book basis:** A coherent implied light source and shadow scale can communicate depth; larger, softer shadows suggest greater elevation. Flat work can use surface color, solid shadows, or overlap to create layers. **Application / limit:** Use depth only when it clarifies hierarchy or relationships, and preserve the selected system's treatment. Do not add shadows to every card. **PDF pp. 150–171.**

**Text disappears over photography.** **Book basis:** Bright and dark areas in a photo make overlaid text unreliable. The book offers overlays, reduced image contrast, colorizing, and local text shadow as treatments. Detailed screenshots also become unreadable when shrunk too far; a crop or simplified rendering can work better. **Application / limit:** Verify contrast over the actual displayed image and at the intended size. Keep the subject and information needed for the task visible. **PDF pp. 176–185.**

**Uncontrolled uploaded images break the layout.** **Book basis:** User images vary in aspect ratio and background; predictable containers, cropping, or a subtle edge can help keep the layout coherent. **Application / limit:** Decide whether the viewer needs the whole image before choosing a fixed crop. Offer full-image access where cropping could conceal important content. **PDF pp. 187–190.**

**A new user reaches a feature with nothing to show.** **Book basis:** An empty state is often the user's first encounter with a feature. Emphasize the next action; consider hiding tabs and filters that cannot yet do anything. An image or illustration may draw attention. **Application / limit:** Explain the state in concise copy and choose decoration only if it helps the product's tone and task. **PDF pp. 203–205.**

**A functional page still feels plain.** **Book basis:** After hierarchy and typography work, restrained background color, a low-contrast pattern, an accent rule, or a small illustration can add character without covering every surface. **Application / limit:** Treat decoration as optional, subordinate to content and readability, and drawn from the existing visual system. Do not infer exact treatments from image-only examples. **PDF pp. 195–201.**

These are design heuristics, not a house aesthetic. For other media, carry over a principle only when the same reading, grouping, or emphasis problem exists. Preserve the selected visual identity, content, and accessibility needs.
