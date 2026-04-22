# Progress — append-only log

Newest entries on top. Append one block per meaningful agent turn. `git pull` before appending to avoid merge conflicts on this file. Keep entries tight — if it doesn't fit on one screen, put it in the commit message.

**Entry format:**

```md
## YYYY-MM-DD HH:MM — <agent> — <short title>

- What was done (≤5 bullets)
- Next step
- Blockers (if any)
- Files touched: path1, path2
```

---

## 2026-04-22 — claude-code (opus-4-7) — Phase 3 implementation

- Branched `jorge/ci-image-attachments` from `main` (PR #11 merged as `4767bd5`).
- Three commits on branch: (1) new "Fetch Jira image attachments" step with 5 MB / 20 MB / 5-count guardrails and `continue-on-error`, (2) prompt rewrite to append absolute image paths under an "Attached screenshots" block, ticket fields moved from inline `${{ }}` interpolation into step `env` vars, (3) `.gitignore` entry for `ticket-attachments/` plus dedicated cleanup step with `if: always()`.
- `--allowedTools "Edit,Read,Write"` unchanged. No `--bare`. No new secrets. Jira base URL hardcoded to match existing callsites (migration to Verndale instance remains out of scope).
- Next: Phase 4 — file a JCP ticket with an annotated screenshot against one seeded bug; verify the fetch step downloaded the PNG, the prompt included the absolute path, Claude's log shows a `Read` of the screenshot, and the resulting PR fixes only the one reported bug.
- Blockers: Phase 3 PR must merge before Phase 4 can run end-to-end.
- Files touched: .github/workflows/codex-fix.yml, .gitignore, docs/PLAN.md, docs/PROGRESS.md.

---

## 2026-04-22 — claude-code (opus-4-7) — Phase 1 + Phase 2 + cross-agent docs

- Reviewed [docs/tier-1-instructions.md](tier-1-instructions.md); drafted 4-phase plan (button fixture + image-aware CI).
- Phase 1 `[done]`: Jorge generated the button in Figma Make; design verified via MCP `get_design_context` against the spec.
- Phase 2 `[done]`: scaffolded Next.js 15 + Tailwind 3 at [demo-app/](../demo-app/); seeded 3 bugs in [Button.tsx](../demo-app/components/Button.tsx); rewrote [AGENTS.md](../AGENTS.md) fixture-agnostic; edited CI prompt in [codex-fix.yml](../.github/workflows/codex-fix.yml) to defer to AGENTS.md. Jorge pushed branch `jorge/demo-app-button-fixture` and added `demo-app/package-lock.json` + `docs/tier-1-instructions.md` in a follow-up commit.
- Local verification: `npm run dev` on the branch, HTTP 200, rendered HTML confirms all three bug markers (`<div>`, `bg-slate-500`, `px-2 py-1`).
- Next: Phase 3 — CI fetches Jira image attachments and passes paths into the prompt. New branch `jorge/ci-image-attachments`.
- Files touched: demo-app/** (new), AGENTS.md, .github/workflows/codex-fix.yml, docs/PLAN.md (new), docs/PROGRESS.md (new).
