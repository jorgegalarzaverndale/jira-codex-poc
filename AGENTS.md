# AGENTS.md

## How to fix bugs

- Read the Jira ticket description to understand the defect. If screenshots are attached, read them with the `Read` tool — treat them as authoritative visual evidence of the bug.
- Locate the relevant file(s) in the repo. Do not assume a single fixture path; the defect could live in any component, page, or markdown document.
- Fix only the specific defect the ticket describes. Do not refactor, rename, or touch unrelated code.
- Preserve surrounding formatting, indentation, and conventions.
- If the ticket links a Figma file or other design source, treat it as the source of truth for visual values (colors, spacing, typography).
