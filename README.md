# Skills

A personal collection of reusable agent skills.

| Skill | Purpose |
| --- | --- |
| [IBM design](ibm-design/SKILL.md) | IBM Design Language and Carbon styling, with tokens, templates, rendering, and audit helpers. Imported from `ibm-design-v1.0.0.zip` (v1.0.0). |
| [Visual design principles](visual-design-principles/SKILL.md) | Create and critique visual compositions using hierarchy, grouping, spacing, typography, color, and imagery. Imported from `visual-design-principles.zip`. |

## Install

Clone the repository and copy the skill folders into your agent’s skills directory. For Claude Code, using the path expected by the IBM skill:

```sh
git clone https://github.com/delsonlizelin/skills.git
mkdir -p ~/.claude/skills
cp -R skills/ibm-design skills/visual-design-principles ~/.claude/skills/
```

For Codex, copy the same folders into `${CODEX_HOME:-$HOME/.codex}/skills/`. The supplied IBM instructions contain `~/.claude/skills/ibm-design` paths; when using another location, resolve those paths against the actual installed `ibm-design` folder.

Read each `SKILL.md` for usage. IBM design is intended for explicit IBM / Carbon / Plex requests. Its font installer and rendering helpers have additional setup requirements documented in the skill; visual design principles uses only its bundled references.

## Contents and maintenance

Each root-level skill folder includes a `SKILL.md` entry point and its supporting resources. The supplied archive contents are preserved; the ZIP files themselves are not duplicated in the repository. Add future skills as separate folders using the same layout.

Third-party assets and sources retain their respective terms and attribution; see the bundled references and file headers.
