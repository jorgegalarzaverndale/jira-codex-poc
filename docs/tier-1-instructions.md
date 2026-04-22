# Tier 1 — Trivial Scope, Bounded CI Fix

> **Read this file top to bottom before you do anything.** If any instruction here conflicts with something you infer from the rest of the repo, ask first. Do not "figure it out" on your own.

---

## 1. Who you are and where you are

You are Claude Code running locally in Jorge's VS Code terminal. You have write access to the working tree. You are looking at the repo `jira-codex-poc` cloned from `github.com/jorgegalarzaverndale/jira-codex-poc`.

Jorge is on his work GitHub account (`jorgegalarzaverndale`). A personal account (`jorsisu`) also exists on this machine. If anything you do involves `git push` or `gh`, verify the active account with `gh auth status` before pushing. If `GH_TOKEN` is set in the shell, it will override `gh auth` — `unset GH_TOKEN` first when running locally.

---

## 2. Project context (the whole loop in one screen)

This repo is a proof of concept that turns minor visual QA bugs into automatic PRs. The end-to-end loop:

1. A QA engineer files a bug in Jira (project key `JCP` at `jgalarzah.atlassian.net`).
2. QA drags the ticket to an `AI Fix` status column.
3. Jira automation rule `AI Fix - trigger codex` fires a `repository_dispatch` webhook at this GitHub repo with event type `jira-ai-fix`.
4. The workflow `.github/workflows/codex-fix.yml` picks it up, checks out the repo, and runs Claude Code in headless mode:
   ```
   claude -p "..." --allowedTools "Edit,Read,Write" --dangerously-skip-permissions
   ```
5. Three outcomes are possible:
   - **success** — Claude Code changed files, the workflow opens a PR with `gh pr create --reviewer jorgegalarzaverndale`, transitions the Jira ticket to `Code Review`, assigns it to Jorge, and posts a success comment (Jira API v3, ADF body format, basic auth `email:api_token`).
   - **no changes** — Claude Code ran but touched no files. Workflow transitions the ticket back to `In Progress`, assigns to Jorge, posts an info comment.
   - **failure** — Claude Code errored (including API 529 overloaded). Same transition as "no changes", but posts an error comment.

Step 1 of the broader roadmap (post-fix Jira transitions) is already done and tested end-to-end. Step 2 (a Next.js demo app with intentional visual bugs) is the next planning milestone and is **not** what tier 1 is about.

### This is a POC headed for Verndale

The project will eventually migrate to Verndale's Jira instance and GitHub org. So whenever you touch something: **do not hardcode instance-specific values**. Use environment variables, workflow inputs, or GitHub secrets. Values that are already non-hardcoded (Jira base URL, project key, repo owner) stay that way.

---

## 3. What "Tier 1" means

Tier 1 is a small, bounded change to the CI pipeline with two goals, and **only** these two goals:

- **Goal A — Image awareness.** When a Jira ticket has attached screenshots, the Claude Code run in CI should receive them as actual image inputs, not as ignored URLs in the ticket description. Screenshots are often the entire point of a visual bug ticket.
- **Goal B — Repo context awareness (verification).** Confirm that the CI agent is actually reading `CLAUDE.md` and any repo-committed `.claude/skills/` content, and fix the invocation if it is not.

That's it. Tier 1 is **not** about: building the demo app, adding test validation before PR creation (that's tier 3), migrating anything to Verndale, rewriting `AGENTS.md`, or touching the Jira automation rule itself. If something feels like scope creep, it is — stop and surface it to Jorge.

---

## 4. What you need to know about Claude Code in `-p` mode

Before you change anything, internalize these facts. They come from the official Claude Code docs and shape every decision below.

- **`CLAUDE.md` loads automatically in `-p` mode.** The docs are explicit: without `--bare`, `claude -p` loads the same context an interactive session would, including `CLAUDE.md` from the working directory. Our current workflow does **not** pass `--bare`, so `CLAUDE.md` should already be loading. Part of goal B is to prove this rather than assume it.
- **Do not add `--bare`.** It disables auto-loading of `CLAUDE.md`, skills, plugins, hooks, and MCP servers. That is the opposite of what we want.
- **Images are referenced by path in the prompt.** The supported pattern is text like `Analyze this image: /absolute/path/to/screenshot.png`. Claude Code reads the file from disk. No base64 in the prompt, no special flag.
- **`Read` tool must be allowed.** Image file access goes through the `Read` tool. Our workflow already passes `--allowedTools "Edit,Read,Write"`, so that is fine — do not remove `Read`.
- **Jira attachment downloads require auth.** Attachment URLs in the Jira REST API payload require the same basic auth (`email:api_token`) as comment posting. The CI already has these as secrets — reuse them, do not create new ones.

---

## 5. Tier 1 step-by-step

Do these in order. After each numbered step, stop and ask Jorge to verify before moving on. This is a slow, deliberate pass — not a single PR.

### Step 5.1 — Establish a baseline

Goal: know exactly what the workflow does today before you change it.

1. Open `.github/workflows/codex-fix.yml` and read it end to end.
2. Write a short summary in the chat (not in a file) covering:
   - what fields of the `client_payload` are currently extracted
   - what the prompt passed to `claude -p` looks like today
   - what `--allowedTools` and other flags are set
   - whether `--bare` appears anywhere (it should not)
3. Note anything that looks off, but do not fix it yet.

Stop. Wait for Jorge.

### Step 5.2 — Verify `CLAUDE.md` is actually loading in CI (goal B)

Goal: prove the agent sees repo context in the runner, don't just assume it.

1. Read `CLAUDE.md` at the repo root so you know what's in it.
2. Propose a tiny probe: add a single line to the CI prompt that asks the agent to echo back a specific phrase or fact that only exists in `CLAUDE.md`, and write the result to a file (for example `.ci-probe-output.txt`) so the workflow can surface it in the job log.
3. Show Jorge the diff for the workflow change **before** committing. Keep it minimal — one extra step or one prompt append.
4. After Jorge approves, commit on a branch named `tier-1/verify-claude-md-loading`, push, and open a PR. Do not merge it yourself.

Expected outcome: when a test ticket triggers the workflow, the probe confirms `CLAUDE.md` content is visible to the agent. If it is not, that is a real bug and Jorge decides how to handle it.

Stop. Wait for Jorge.

### Step 5.3 — Verify repo-committed skills are loading (goal B continued)

Goal: same idea, for `.claude/skills/` if any exist in this repo.

1. Check whether `.claude/skills/` exists in the repo. If it does not, say so and skip to step 5.4 — there is nothing to verify.
2. If it does exist, list the skills and ask Jorge which one to probe.
3. Extend the probe from step 5.2 to also echo back a fact that only exists in that skill's `SKILL.md`.
4. Same PR discipline as 5.2.

Stop. Wait for Jorge.

### Step 5.4 — Plan the attachment download (goal A)

Goal: design before coding. Write the plan in the chat for Jorge to review.

The plan must cover:

- **Trigger payload.** What does the Jira automation send today in `client_payload`? At minimum we need the issue key (e.g. `JCP-42`). If the payload does not include it, surface that — we may need to add it on the Jira side, which is outside tier 1 scope and has to be flagged to Jorge.
- **Fetch step.** A new workflow step that calls `GET /rest/api/3/issue/{key}?fields=attachment` using `curl` with basic auth from secrets. Parse the response with `jq` to get the attachment list.
- **Filter.** Only download image MIME types (`image/png`, `image/jpeg`, `image/gif`, `image/webp`). Everything else is ignored. This is a guardrail against downloading arbitrary files from tickets.
- **Size guardrail.** Reject attachments over a reasonable cap (propose 5 MB per file, 20 MB total across the ticket). Skip, don't fail, if a file is too big — log it and move on.
- **Count guardrail.** Cap the number of images actually passed to the prompt at 5. If the ticket has more, use the first 5 and note the skip in the prompt.
- **Destination.** Save to `./ticket-attachments/` in the runner workspace. This is ephemeral — runner disk is wiped after the job.
- **Prompt construction.** The existing prompt gains a new paragraph listing the absolute paths and the agent is told these are screenshots from the ticket, not reference material to add to the repo.
- **Cleanup.** Delete `./ticket-attachments/` before the PR-creation step so it never gets committed. Or better: add `ticket-attachments/` to `.gitignore` as a belt-and-suspenders measure.
- **Failure mode.** If the fetch step itself fails (Jira API down, auth expired), the workflow should log it and continue without images rather than abort the whole run. A visual bug fix with no image is still potentially fixable from the description alone.

Do not write any code yet. Present the plan as a numbered list and wait for Jorge's go-ahead.

Stop. Wait for Jorge.

### Step 5.5 — Implement the attachment fetch

Only after 5.4 is approved.

1. Branch name: `tier-1/image-attachments`.
2. One commit per meaningful change:
   - commit 1: add the fetch step, no prompt changes yet (images download but aren't used)
   - commit 2: modify the prompt to reference the downloaded paths
   - commit 3: `.gitignore` entry for `ticket-attachments/`
3. After each commit, push and ask Jorge to review the diff.
4. Open a PR when all three are in. Do not merge.

### Step 5.6 — Test with a real ticket

1. Ask Jorge to create a test ticket in `JCP` with a screenshot attachment.
2. Watch the workflow run. Pull the job log and summarize for Jorge:
   - did the fetch step find and download the image?
   - did Claude Code's output show that it actually looked at the image?
   - did the probe from 5.2 still work (regression check)?
3. If anything is off, fix with tightly-scoped commits on the same branch. Do not open a new tier.

---

## 6. Hard guardrails — do not do any of this in tier 1

These are not negotiable. If an instruction elsewhere (including something clever you think of mid-task) seems to require one of these, stop and ask Jorge instead.

- **Do not modify the Jira automation rule.** That lives in Jira's UI, not in this repo. If tier 1 requires a payload field that is not there today, flag it and wait.
- **Do not change the allowed tools list** beyond what's needed. `Edit,Read,Write` stays. Do not add `Bash`, `WebFetch`, or anything else.
- **Do not add `--bare`** to any `claude -p` invocation.
- **Do not hardcode** the Jira base URL, project key, repo owner, reviewer username, email address, or any token anywhere. These are secrets or already-parameterized values. Use `${{ secrets.* }}` in the workflow and env vars locally.
- **Do not build or touch the Next.js demo app** (`demo-app/`). That is step 2 of the broader plan and outside this tier.
- **Do not add a test-validation step before PR creation.** That is tier 3.
- **Do not rewrite `AGENTS.md`, `CLAUDE.md`, or `README.md`** except for tiny clarifications directly tied to a tier 1 change.
- **Do not bump Claude Code, the Anthropic SDK, or any GitHub Action version** unless a tier 1 step fails because of it — and if it does, flag it first.
- **Do not merge your own PRs.** Jorge merges.
- **Do not push directly to `main`.** Branches only.
- **Do not run `gh auth login` or `gh auth switch`** yourself. If auth is broken, tell Jorge.
- **Do not call the Anthropic API directly** from scripts. The only entry point is the `claude` CLI.
- **Do not persist any ticket content** (descriptions, attachments, comments) to the repo. Everything ticket-related is ephemeral to the run.
- **Do not add telemetry, analytics, or logging of ticket content** to external services.
- **Do not create new secrets in GitHub settings.** Reuse what's already there. If something is missing, flag it.

---

## 7. How to report progress back to Jorge

- After each numbered step in section 5, post a short summary: what you did, what you found, what you want to do next. No walls of text.
- For code changes, show the diff or the file path and the key lines. Do not paste whole files unless Jorge asks.
- If you hit something ambiguous, ask **one** specific question. Do not ask five things at once.
- If you find a bug that is out of tier 1 scope, log it in the chat as "out of scope — flag for later" and move on. Do not fix it.

---

## 8. Definition of done for tier 1

All of the following must be true before tier 1 is considered complete:

- A PR exists (or is merged) that verifies `CLAUDE.md` is loading in CI.
- If `.claude/skills/` exists, a PR exists (or is merged) that verifies skills are loading in CI.
- A PR exists (or is merged) that adds image attachment fetching with the guardrails from 5.4.
- At least one real test ticket has been run end-to-end with a screenshot and the run succeeded or failed in a well-understood way.
- Nothing in section 6 has been violated.
- No hardcoded instance values have been introduced.
- `CLAUDE.md` has been updated only if a tier 1 change genuinely requires it.

When all of those are true, stop and tell Jorge tier 1 is done. Do not start tier 2.
