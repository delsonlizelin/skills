# Principles, method and voice

This file covers the parts of IBM's design language that apply directly to any piece. Sources are in `lookup.md`; everything is paraphrased.

## The point of view

- IBM frames design as standing between people and technology. Its job is to **guide** someone from *here* to *there*, and every experience should leave them with time saved or time well spent.
- It draws on mid-century IBM *attitudes* (Eliot Noyes' curation, Paul Rand's experimentation, the Eameses' playfulness), not a retro *style*.
- Everything communicates, including what's left out. **Craft signals confidence.**
- Noyes' idea for the whole system is **"unity, not uniformity"**: many pieces read as one painting without being identical. Templates are starting points, not stamps.

## Four principles (self-check before shipping)

| Principle | Ask |
|---|---|
| **Carefully considered** | Is every element essential? Is there a clear opinion? Does it respect the viewer's time? Cut the gratuitous. |
| **Uniquely unified** | Is it recognizable without a logo, through grid, Plex, color restraint and rhythm? Built from repeatable, reusable parts? |
| **Expertly executed** | No overlooked detail: alignment, rags, contrast, states, both themes. Doing more with less? |
| **Positively progressive** | Does it remove friction and give more than it takes? Is it confident and forward, never boastful? |

Carbon's system principles, for product work: **open, inclusive (accessible by default), modular and flexible, user first, consistent.**

Translated into checks this skill enforces:
1. Tokens, not raw values (consistency, themeability).
2. Plex, flush left, sentence case, the type scale (unified voice).
3. Gray-dominant color with blue for action and one accent (restraint).
4. 2x Grid alignment and generous negative space (engineered, essential).
5. WCAG AA contrast in both themes; color never the only signal (inclusive).
6. Balanced asymmetry with a deliberate pattern break (dynamic, not static).

## Enterprise Design Thinking: the pre-flight

IBM's framework is **Principles** (a focus on user outcomes · restless reinvention · diverse empowered teams) + **the Loop** (Observe → Reflect → Make, continuously, all three) + **Keys** (Hills · Playbacks · Sponsor users).

**Before designing anything non-trivial, write a Hill** (3 lines, in your head or at the top of your plan). Show it to the user only when the brief is ambiguous.

```
Who   — a specific user in a specific situation (and who it is NOT for)
What  — the outcome they can achieve (not the feature, not the implementation)
Wow   — the measurable difference that makes it worth it
```
Pattern: *"[user] can [outcome] in/with [measurable bound] without [today's pain]."*
Example: *"A night-shift dispatcher can see which depots will run out of capacity in the next 4 hours at a glance, without opening three reports."* That Hill then decides the layout (one status overview first), the color (status tokens on the at-risk depots only) and the type (big numbers, small labels).

Rules of thumb:
- At most three Hills per piece. More means the piece is several pieces.
- A Hill never names an implementation ("add a dashboard" is not a Hill).
- Skip the Hill for trivial asks (a button restyle, a color question).
- **Loop while making**: *observe* (what does the content or data actually say, and who reads it where?) → *reflect* (one insight: what matters most?) → *make* (low-fi first, render, look) → repeat. Observing and reflecting without making is analysis paralysis; making without observing is blind faith.
- **Playback**: when you present the result, tell it as the user's story first (who, what they can now do), then show the work, then ask for specific feedback.
- If the user wants a workshop or deeper method (empathy maps, as-is/to-be scenarios, prioritization grids, storyboards), the EDT toolkit is in `lookup.md`. Produce those artifacts in this visual style.

## Content and voice (Carbon / IBM style)

- **Voice**: a clear point of view; simple and logical; grounded in data; intellectually ambitious; persuasive rather than poetic; confident, not boastful; figurative language only for emphasis; outcomes and facts first.
- **Tone adapts**: errors are short, direct, fragments are fine ("Connection lost. Retry"); onboarding uses full, friendly sentences.
- **Sentence case for all UI and headings**: titles, tabs, buttons, links, table headers. Capitals only for proper nouns, product names (with their own casing: GitHub, JavaScript), acronyms (PDF, OK) and sentence starts.
- Refer to UI with its exact label ("the **Name** field"). Lead buttons with a verb: Add, Create, Edit, Delete, Save, Cancel, Export.
- Simple words, short sentences, present tense, active voice (passive is fine when the system is the actor), second person "you". No "please" or "thank you" in UI. Contractions are fine. At most one exclamation mark, and only for good news.
- "can" = ability, "may" = permission, "might" = possibility. Inclusive, ungendered language.
- Emphasis: italic **or** bold, never both.
- Titles of charts and sections **state the insight** ("Depot 4 hits capacity by 02:00"), not the topic ("Capacity").
- Numbers: tabular figures in tables, units always shown, a big KPI = number + one or two words.

## Brand boundary (decided for this skill)

Work made with this skill is **in the IBM design language, not by IBM**:
- ✗ Never draw or include the IBM logo, the 8-bar mark, the Rebus, or "IBM" as a brand byline, and don't imitate IBM product names or ibm.com page chrome.
- ✓ Use Plex (OFL), Carbon tokens, components and icons (Apache-2.0), and IBM pictograms (Apache-2.0) freely, as ordinary open assets.
- If the user's own brand has a logo or wordmark, it goes where IBM's would, set in Plex.
