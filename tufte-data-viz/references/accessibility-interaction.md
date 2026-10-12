# Accessibility and interaction

For dashboards and other screen-based or interactive output.

Give every chart a concise accessible name that states the subject and the takeaway. Add an adjacent table or structured text when readers must recover exact values or the relationship cannot be conveyed briefly. Canvas-based libraries expose nothing to assistive technology; the table or summary outside the canvas is mandatory there.

Never encode category or status by color alone. Add labels, shapes, line styles, patterns, or position. Check text and mark contrast against the actual background, including focused and disabled states, using the product's accessibility standard rather than assuming a palette passes.

Make every interactive mark and control reachable by keyboard, with visible focus and a logical order. Give touch targets enough size. Anything shown on hover must also be available through focus, tap, or persistent text. Tooltips carry the label, value, unit, and decision-relevant context only; a restrained background or border is fine when contrast needs it.

Choose a responsive strategy instead of shrinking. At narrow widths reduce tick density, switch direct labels to a legend, change orientation, simplify callouts, or move to a table or small multiples. Test the breakpoints that will ship.

Animate only to explain a state change, sort, filter, or time transition. Keep motion brief, preserve object constancy, and honor `prefers-reduced-motion`. Build dark mode from semantic tokens; do not invert a light palette mechanically.
