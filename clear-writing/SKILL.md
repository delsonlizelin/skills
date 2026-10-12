---
name: clear-writing
description: Write, revise, review, explain, and finalize human-facing prose while preserving meaning and evidence. Use when the user explicitly requests an explanation, report, writing improvement, or human-facing written deliverable; for a multi-paragraph final summary of a non-trivial task; or when explicitly invoked. Do not use for routine chat, terse factual answers, code, comments, tool output, intermediate updates, commit messages, or continuity artifacts. This is the sole substantive writing-enhancement owner; compatibility aliases and report workflows delegate prose quality here.
---

# Clear writing

Make the reader understand the intended meaning smoothly and accurately. Apply this priority order:

1. Correctness.
2. Clarity.
3. Context fit.
4. Naturalness.
5. Concision.
6. Style polish.

Treat removal of AI-like patterns as final quality control, never as the main objective.

## Route the task once

Select one primary mode for the current request. Avoid automatic chains of unrestricted rewrites. A new user revision request or a discovered factual or comprehension defect warrants another targeted pass; this rule must not prevent correction or iteration.

| Mode | Use |
|---|---|
| `write` | Create new human-facing prose from requirements or source material. |
| `revise` | Improve supplied prose while preserving its meaning. Use when an enhancement request does not name a mode. |
| `review` | Diagnose fidelity, logic, ambiguity, and reader-friction problems without rewriting unless requested. |
| `explain` | Answer or re-explain so the reader can follow the reasoning and necessary premises. |
| `report` | Turn an evidence structure into audience-ready prose. Use `report-synthesis` first when completed research evidence must be selected or organized. |
| `final-cleanup` | Remove genuine machine-like patterns after content and structure are already sound. |

Apply these routing rules:

- When `wait-what` also matches, let it select `explain` mode and identify the comprehension failure. Perform only one final rewrite here.
- When `report-synthesis` also matches, let it own evidence selection, claim boundaries, and report structure. Own only the audience-facing prose and readability pass here.
- When `humanizer` or `humanizer-zh` is invoked, treat it as an alias for `final-cleanup` mode.
- If this skill has already processed the output in the selected mode, do not process it again through an alias.
- Never activate more than one substantive writing-enhancement skill for one output.

## Establish the writing contract

Infer the contract from the request and available material. Ask only when an unresolved choice would materially change the result.

Identify:

- The reader and what they need to understand or decide.
- The main answer, claim, or communicative purpose.
- The minimum premises needed to follow it.
- The requested language, locale, register, format, and length.
- Facts, terminology, structure, quotations, citations, and voice that must be preserved.

Follow an explicit output-language request. Otherwise, follow the active conversation or deliverable context. For Chinese output, read `references/chinese-output.md`. For English output, read `references/english-output.md`. Keep skill instructions, prompts, memory, code, and comments in English.

## Protect meaning and evidence

Before revising supplied material, identify what must survive the edit. For a short, low-stakes edit, compare directly with the source; do not create a separate ledger. Use a private preservation ledger for dense, high-stakes, or multi-source material when it reduces the risk of losing:

- Facts, numbers, dates, names, quotations, citations, and units.
- Scope, conditions, exceptions, comparisons, and causal direction.
- Confidence, uncertainty, evidence strength, and negative or null findings.
- Decisions, recommendations, responsibilities, and requested actions.
- Established user or project terminology and the author's actual stance.

Do not invent support, strengthen a claim, remove a material limitation, or replace a precise term merely for smoother prose. Distinguish observation, interpretation, and recommendation. Return to the source when a value or claim cannot be verified.

In `review` mode, report the material problems and why they matter. Do not silently turn the review into a rewrite.

## Compose or revise

1. State the answer or central claim as soon as it can be stated responsibly.
2. Add only the premises the reader needs for the next sentence to make sense.
3. Give each paragraph one main information task, such as what happened, why, supporting evidence, implication, or uncertainty.
4. Organize by the reader's reasoning path, not by a generic article template or the chronology of the work.
5. Prefer concrete subjects, strong verbs, ordinary precise words, and explicit relationships.
6. Use headings, lists, and tables only when the content has real parallel structure or lookup value.
7. Match the register to the task. Natural writing may be formal, technical, conversational, or restrained.

Do not add background, significance, dimensions, transitions, summaries, examples, or rhetorical framing merely to make the output feel complete.

## Run the reader check

Simulate a reasonable reader asking, "What does this mean, and why does the next sentence follow?"

Repair only actual friction:

- Define a concept that appears before the reader can understand it.
- Restore the minimum premise when the text jumps from one step to a later conclusion.
- Replace invented or unnatural terminology with established user, project, or domain language.
- Unpack a grammatically correct sentence whose communicative purpose is unclear.
- Break up dense terminology or abbreviations when they obstruct understanding.

Do not respond to confusion by merely shortening the text. Step back far enough to supply the missing context, then explain again.

## Clean the surface last

Remove patterns only when they are genuinely present as a cluster or materially harm the prose:

- Empty openings, generic framing, canned transitions, and formal conclusions that add no information.
- Repeated conclusions, synonym cycling, forced contrasts, mechanical parallelism, and habitual groups of three.
- Inflated significance, vague authority, promotional language, fake profundity, and unsupported confidence.
- Excessive headings, bold labels, sentence fragments, uniform cadence, and diff-anchored narration.
- Translation-shaped phrasing that does not fit the output language.

Do not enforce mechanical bans on punctuation, sentence length, passive voice, first person, or technical vocabulary. Do not manufacture personality, messiness, opinions, slang, or emotion. Preserve already-good prose.

## Mode-specific requirements

### Explain

Answer first. Define unavoidable terms on first use. Show the missing link in the reasoning. Use an example only when it materially improves understanding. Stop when the reader can restate the answer and its reason.

### Report

Treat the evidence map and claim boundaries from `report-synthesis` as fixed inputs. Lead with the supported conclusion, then arrange evidence by decision relevance. Keep limitations beside the claims they constrain. Do not create sections simply because reports often contain them.

### Final cleanup

Assume the substance is already correct. Make the smallest changes that remove real machine-like patterns. Recheck protected meaning against the source or existing preservation ledger afterward. Return essentially unchanged prose when no material problem exists.

## Verify before delivery

Make one proportionate final check; for a short edit, a direct source comparison is enough. For longer work, read the text as a whole and confirm:

- The answer is apparent without a ceremonial opening.
- Every sentence has a reason to follow the previous one.
- Facts and protected meaning still match the source.
- The amount of context fits the reader.
- The structure comes from the content rather than a template.
- The requested language and register are natural.
- No cleanup rule has become more important than accuracy or clarity.
- Already-good passages were left alone.

Return only the requested deliverable unless the user asks for an editorial diagnosis or change log.

Consult `references/provenance.md` only when maintaining or auditing this skill.
