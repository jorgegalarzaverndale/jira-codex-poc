# AGENTS.md

## Working on the POC itself

Read before doing anything else when building or extending this POC (not when fixing a Jira ticket — see "How to fix bugs" below for that flow):

- [docs/PLAN.md](docs/PLAN.md) — living plan with phase status markers. Update in place as phases progress.
- [docs/PROGRESS.md](docs/PROGRESS.md) — append-only log. `git pull` before appending. Add one entry before you commit.
- [docs/tier-1-instructions.md](docs/tier-1-instructions.md) — guardrails that shaped phases 1-3. Still load-bearing.

This section applies to any coding agent (Claude Code, Codex, Cursor, Aider, etc.) or human continuing the build-out. If PLAN and PROGRESS disagree with the code, trust the code and fix the docs.

## How to fix bugs

- Read the Jira ticket description to understand the defect. If screenshots are attached, read them with the `Read` tool — treat them as authoritative visual evidence of the bug.
- Locate the relevant file(s) in the repo. Do not assume a single fixture path; the defect could live in any component, page, or markdown document.
- Fix only the specific defect the ticket describes. Do not refactor, rename, or touch unrelated code.
- Preserve surrounding formatting, indentation, and conventions.
- If the ticket links a Figma file or other design source, treat it as the source of truth for visual values (colors, spacing, typography).
