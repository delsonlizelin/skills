---
name: wait-what
description: Diagnose and repair reader comprehension when the user says "wait-what," asks for a plain or simple explanation, says an answer was confusing or did not land, or when an explanation is becoming too abstract to follow. Identify the missing concept, premise, connection, or terminology, then route one rewrite through `clear-writing` explain mode. Do not act as a separate general editor or run a second polish pass.
---

# Wait-what comprehension repair

Read `../clear-writing/SKILL.md` and the reference for the requested output language. Select `explain` mode and perform one final rewrite through that workflow.

Before rewriting, locate the reader's actual stopping point:

- An unexplained concept or abbreviation.
- A premise needed for the next claim.
- A jump from an early step to a later conclusion.
- Invented, translated, or project-inconsistent terminology.
- A grammatically valid sentence whose purpose is unclear.
- Dense phrasing that hides the relationship between ideas.

Restore the minimum context needed to cross that point. Do not merely shorten the text, remove qualifications, or turn the response into fragments. Preserve accuracy, constraints, warnings, and decisions.

Return the repaired explanation without a separate diagnostic report unless the user asks for one. If `clear-writing` already performed the same explain pass this turn, do nothing further.
