# Skills

A personal collection of reusable agent skills.

| Skill | Purpose |
| --- | --- |
| [IBM design](ibm-design/SKILL.md) | IBM Design Language and Carbon styling, with tokens, templates, rendering, and audit helpers. Imported from `ibm-design-v1.0.0.zip` (v1.0.0). |
| [Visual design principles](visual-design-principles/SKILL.md) | Create and critique visual compositions using hierarchy, grouping, spacing, typography, color, and imagery. Imported from `visual-design-principles.zip`. |
| [Grilling](grilling/SKILL.md) | Stress-test a plan or conduct an explicit decision interview, one consequential question at a time. Includes the [grill-me alias](grill-me/SKILL.md). |
| [Tufte data visualization](tufte-data-viz/SKILL.md) | Design truthful, readable charts and tables, with composition guidance, contextual layout defaults, and optional IBM styling. |
| [Clear writing](clear-writing/SKILL.md) | Write, revise, review, and explain while preserving meaning, evidence, and the intended voice. |
| [Wait-what](wait-what/SKILL.md) | Diagnose a reader's stopping point and repair the explanation through clear-writing. |
| [Copilot session](copilot-session/SKILL.md) | Find, inspect, create, and relay to Copilot conversations, with optional persistent Bark monitoring. |

## Install

Clone the repository and copy the skill folders into your agent’s skills directory. For Claude Code, using the path expected by the IBM skill:

```sh
git clone https://github.com/delsonlizelin/skills.git
mkdir -p ~/.claude/skills
cp -R skills/ibm-design skills/visual-design-principles skills/grilling skills/grill-me skills/tufte-data-viz skills/clear-writing skills/wait-what skills/copilot-session ~/.claude/skills/
```

For Codex, copy the same folders into `${CODEX_HOME:-$HOME/.codex}/skills/`. The supplied IBM instructions contain `~/.claude/skills/ibm-design` paths; when using another location, resolve those paths against the actual installed `ibm-design` folder.

Read each `SKILL.md` for usage. IBM design is intended for explicit IBM / Carbon / Plex requests. Its font installer and rendering helpers have additional setup requirements documented in the skill; visual design principles uses only its bundled references.

Keep `wait-what` beside `clear-writing`, and `grill-me` beside `grilling`. The aliases route to the shared workflows rather than introducing separate editing or interview passes. Tufte works without IBM; when both are requested, keep `ibm-design` beside `tufte-data-viz`.

Tufte includes its Matplotlib helper under `scripts/`, so it does not require the author's private machine paths. The static example requires Python with `matplotlib`, `numpy`, and `Pillow`; from the installed `tufte-data-viz` directory, run:

```sh
PYTHONPATH="$PWD/scripts${PYTHONPATH:+:$PYTHONPATH}" python examples/matplotlib-minimal.py
```

The responsive HTML example is self-contained. Matplotlib's helper uses an installed CJK font when available and falls back to DejaVu Serif; provide a suitable font through `tufte_style(extra_font_paths=[...])` when the requested script needs it.

Copilot session requires Python 3.11+ and PyYAML for transcript discovery and reading. Set the examples’ `skill_dir` to its actual installation directory. Live VS Code relay additionally uses `websockets` and depends on the installed agent-host protocol. Phone alerts require a separately installed and configured adjacent `bark-notify` skill and its `requests` dependency; it is not bundled here. The monitoring service example uses Linux user systemd. Read-only snapshots do not require Bark. The watcher detects user questions, tool/path/URL permissions and plan-review prompts immediately; its focused tests run with `python -m unittest discover -s copilot-session/tests -v`. Project-session access and safe CLI relaying are covered in `copilot-session/references/cli-relay.md`.

## Contents and maintenance

Each root-level skill folder includes a `SKILL.md` entry point and its supporting resources. The original design-skill archive contents are preserved; the ZIP files themselves are not duplicated in the repository. The four additional workflows come from the maintained shared skills, with the Matplotlib helper bundled and host-specific references adapted for distribution. Copilot session is also adapted from the maintained shared skill, with portable example paths and private session details removed. Add future skills as separate folders using the same layout.

Third-party assets and sources retain their respective terms and attribution; see the bundled references and file headers.
