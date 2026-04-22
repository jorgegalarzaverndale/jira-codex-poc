# Plan — Button fixture + image-aware CI

Living plan for this POC. Edit in place. Commit the update alongside the work it describes.

## Goal

Turn minor visual QA bugs into automatic PRs. A Jira ticket with a screenshot triggers `claude -p` in CI, which edits the relevant file and opens a PR. This plan builds the first real visual fixture (a button) and wires CI to pass ticket screenshots in as image inputs.

## Constraints

- No hardcoded instance values (Jira base URL, project key, repo owner, account IDs, email, tokens). Use secrets or workflow inputs. Applies everywhere including prompts and docs.
- CI's `claude -p` runs with `--allowedTools "Edit,Read,Write"` and **no** `--bare`. Do not expand the tools list. Do not add `--bare`.
- Do not rewrite `AGENTS.md`, `CLAUDE.md`, or `README.md` except for tightly-scoped changes that the current phase directly requires.
- Never commit `.env` files or any content from Jira tickets. Ticket attachments are ephemeral to the workflow run.
- Never merge a PR from inside a phase — leave it for Jorge.
- See [docs/tier-1-instructions.md](tier-1-instructions.md) for the full guardrail list that shaped phases 1-3.

## Phases

### Phase 1 — Figma button (source of truth) — `[done]`

Button component designed via Figma Make, four variants (`default`, `hover`, `focused`, `disabled`), spec annotations in-frame.

- File: https://www.figma.com/design/01vkPZFlVDN6VVi5Y34AyK/Buton-AI-Fix-POC?node-id=1-3
- Published preview: https://zaffre-panic-32176170.figma.site/
- Tokens: `#2563eb` (default) / `#1d4ed8` (hover) / `#93c5fd` (focus outline), 12×24 padding, 6px radius, 14px/600, system-ui.

**Exit criteria met:** URL linked from [demo-app/README.md](../demo-app/README.md).

### Phase 2 — Implementation (with errors) — `[done]`

Minimal Next.js 15 + Tailwind 3 app at [demo-app/](../demo-app/). Renders one `<Button />` with three seeded bugs.

Key files:
- [demo-app/components/Button.tsx](../demo-app/components/Button.tsx) — the buggy component.
- [demo-app/tailwind.config.ts](../demo-app/tailwind.config.ts) — design tokens (`brand` / `brand.hover` / `brand.focus`).
- [demo-app/README.md](../demo-app/README.md) — Figma URL + bug table.
- [AGENTS.md](../AGENTS.md) — fixture-agnostic fix instructions (no longer references `operations.md`).
- [.github/workflows/codex-fix.yml](../.github/workflows/codex-fix.yml) — CI prompt now defers to `AGENTS.md`.

Seeded bugs (each ticket targets one):
| # | Figma spec                   | Shipped            |
|---|------------------------------|--------------------|
| 1 | `bg-brand` (`#2563eb`)       | `bg-slate-500`     |
| 2 | `px-6 py-3`                  | `px-2 py-1`        |
| 3 | `<button type="button">`     | `<div onClick={…}>` |

**Exit criteria met:** branch `jorge/demo-app-button-fixture` pushed, dev server verified rendering all three bugs, rendered HTML confirms bug markers.

### Phase 3 — CI optimizations to support images — `[in review]`

Wire CI to fetch Jira ticket attachments, filter to images, and pass paths into the prompt. Maps to tier-1 instructions §5.4 → §5.5.

Scope in [.github/workflows/codex-fix.yml](../.github/workflows/codex-fix.yml):

1. New step after "Extract Jira ticket info" — `GET /rest/api/3/issue/{KEY}?fields=attachment` with basic auth (reuse `JIRA_USER_EMAIL` / `JIRA_API_TOKEN`). Parse with `jq`.
2. Filter: only `image/png|jpeg|gif|webp`. Download to `./ticket-attachments/`.
3. Guardrails: 5 MB per file, 20 MB total, max 5 images in prompt. Skip (not fail) on over-limit. Fetch failure → log + continue with empty attachment list.
4. Prompt rewrite: append absolute paths under a "Attached screenshots" section. Keep the "Follow AGENTS.md" line.
5. Cleanup: `rm -rf ticket-attachments/` before `git add`. Add `ticket-attachments/` to repo `.gitignore`.

Commit shape on branch `jorge/ci-image-attachments`:
- Fetch + download, no prompt change yet.
- Prompt rewrite referencing downloaded paths.
- `.gitignore` + cleanup.

PR, do not merge.

### Phase 4 — End-to-end test — `[pending]`

- File a `JCP` ticket for one seeded bug, attach annotated screenshot, link the Figma file.
- Drag to `AI Fix`.
- Verify: attachment fetched, prompt included the path, Claude's tool-use log shows a `Read` of the screenshot, PR touches only [demo-app/components/Button.tsx](../demo-app/components/Button.tsx), fixes only the one reported bug, Jira transitions to Code Review.
- Repeat with the other two bugs, one ticket at a time.

Fix regressions on `jorge/ci-image-attachments`, not a new branch.

## Out of scope for this plan

- Figma Code Connect mappings.
- Visual regression testing / Playwright.
- A second component beyond the button.
- Migrating to Verndale's Jira/GitHub org.
- Shell-quoting hardening of the ticket title/description interpolation in the workflow prompt (real concern, separate work).

## Open questions

- Keep `operations.md` as a parallel fixture forever, or retire once the button loop is proven?
- Phase 3 PR shape — three commits on one branch (current default), or one squashed commit for reviewability?
- Screenshot production for test tickets — manual capture each time, or a small Playwright script committed under `demo-app/`?
