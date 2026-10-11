---
name: visual-design-principles
description: Create, review, or critique visual compositions across media, especially web frontends, using book-grounded hierarchy, grouping, spacing, typography, color, and imagery. Use for visual design, layout, styling, and redesign requests; not routine frontend logic, backend work, or accessibility certification.
---

# Visual design principles

Improve how a viewer understands and uses a composition. Treat the principles as diagnostic tools, not a house aesthetic. This skill is self-contained: no other skill, brand system, font family, token library, or source PDF is required to apply it.

## Establish the problem

Infer the audience, medium, main message or task, and existing constraints from the brief and artifact. Ask only about missing decisions that would change the result. Preserve a chosen visual identity and factual content. When a requested treatment undermines the task, explain the concrete tradeoff and offer an alternative rather than silently replacing the direction.

Identify what should be noticed first, understood next, and available on closer inspection. For a frontend, begin with a real feature and its content/states; for a reading surface, begin with its argument and reading order; for an expressive piece, identify the intended perceptual effect. Do not force task-oriented UI restraint onto every medium.

For new work, state the intended reading order, choose a small coherent visual vocabulary from the brief or an existing system, build the composition, then inspect it at the intended viewing sizes. Without a supplied system, choose appropriate type, color, and spacing relationships for the task; do not assume a preset style is needed. Report observed relationships and tradeoffs, not a checklist of principles supposedly applied.

## Diagnose before decorating

Inspect the actual artifact, preferably at its intended viewing size. Choose the few principles that explain its most consequential problems. Describe each as: observed symptom → perceptual reason → proposed change → check. Use concrete relationships, such as the distance between a label and its field, rather than vague instructions to make a page cleaner. Preserve relationships that already work; a critique need not produce a redesign.

- Establish hierarchy through relative scale, weight, contrast, position, and space. Reduce competing emphasis before adding more emphasis to the focal element.
- Make perceived groups agree with meaning. Related elements should have stronger proximity or similarity than unrelated elements; check what happens when content wraps or grows.
- Use repeated alignments and rhythms to create coherence. Let content determine useful widths and exceptions; a grid is a support for composition rather than a demand to stretch everything equally.
- Evaluate figure and ground together. Negative space participates in grouping, balance, and attention; empty area is not automatically wasted area.
- Make typography fit the reading situation. Inspect measure, line spacing, hierarchy, and alignment together rather than applying one universal type scale or line-length target across languages and media.
- Assign color a purpose. Test the hierarchy without depending on hue alone, and preserve readable contrast and redundant cues for meaningful states.
- Use depth, crop, texture, and overlap when they clarify relationships or support the intended expression. They are available techniques, not mandatory styling.

For source-grounded decisions and exceptions, load only the relevant reference:

- [Interface design](references/interface-design.md): frontend tasks, hierarchy, spacing, typography, color, depth, imagery, and states.
- [Composition](references/composition.md): general graphic composition, visual balance, scale, Gestalt grouping, grids, framing, and expressive exploration.
- [Sources and scope](references/sources.md): source editions, PDF page conventions, extraction limits, and the distinction between book principles and implementation checks.

## Work within a visual system

When a separate design system or style skill is selected, respect its fixed typography, tokens, grid, component, corner, and elevation constraints. This skill diagnoses the needed relationship (order, grouping, emphasis); the selected system supplies permitted treatments. Use its hierarchy guidance once rather than mechanically stacking another scale or spacing pass on top. Select existing tokens; extend the system only when its rules permit and the requested scope calls for it.

This skill does not install, edit, activate, or require any other skill. Do not import a competing palette or component kit. If no permitted treatment meets a necessary communication or legibility requirement, name the specific gap. When the user can respond, ask before departing from the system. Otherwise make the smallest local deviation that resolves the gap, label it as a deviation from the system, and leave the rest of the system intact. An explicitly non-negotiable user constraint still requires clarification; report the unresolved gap rather than claiming completion. Do not invent a broader style or accept unreadable output. A system's constraints do not erase the user's task or factual content.

## Validate the result

Compare the result against the original task and the observed problems. For a frontend, inspect desktop and narrow layouts plus relevant long-content, empty, selected, and error states. Preserve semantic structure, keyboard usability, and working behavior when changing visual hierarchy. These are implementation checks, not claims that the books specify modern accessibility standards.

When reporting an improvement, identify the change and visible evidence. Do not equate aesthetic preference with usability, or claim faster comprehension or higher conversion without user evidence. An annotated comparison can show which relationships improved and what tradeoffs remain.
