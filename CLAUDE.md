# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
POC: automated Jira bug-ticket fixing via Claude Code CLI + GitHub Actions.
Jira tickets trigger `repository_dispatch` → Claude fixes code → PR created → Jira updated.

## Jira API
- Instance: `jgalarzah.atlassian.net`, project key `JCP`, API v3, basic auth
- Transition IDs: Code Review = `3`, In Progress = `21` (instance-specific)
- Comment bodies must use **ADF format**, not plain text
- Run `source .env` before local Jira API calls
- Will migrate to Verndale's Jira/GitHub org — avoid hardcoding instance URLs and IDs

## Environment
- `.env` has `JIRA_USER_EMAIL` and `JIRA_API_TOKEN` — never commit
- GitHub secrets: `JIRA_USER_EMAIL`, `JIRA_API_TOKEN`, `JIRA_ASSIGNEE_ACCOUNT_ID`, `ANTHROPIC_API_KEY`
- Git account: `jorgegalarzaverndale` (work). Run `gh auth status` if push fails

## Workflow
- Automated branches: `claude/fix-{JIRA_KEY}`
- Fix instructions for Claude in CI are in `@AGENTS.md`
- `.claude/settings.local.json` restricts allowed tools and Bash commands in CI
- Main workflow: `.github/workflows/codex-fix.yml`
- Three outcomes: success (PR + Code Review transition), failure (error comment + In Progress), no changes (info comment + In Progress)

## Conventions
- Keep same formatting when editing `operations.md`
- Fix only the specific issue described in the ticket — don't change unrelated code
