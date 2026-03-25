# Next steps

1. ~~**Auto-transition ticket after AI fix** - Transition to "Code Review" (success) or "In Progress" (failure/no changes) and assign to reviewer via Jira API.~~ DONE

2. **Test with a real codebase** - Replace operations.md with an actual project. Add CLAUDE.md with project structure and test commands.

3. **Add test validation before PR creation** - Run the test suite after Claude fixes the code. Only create PR if tests pass.

4. **Create a structured Jira ticket template** - Template with file path, expected behavior, actual behavior. Improves fix accuracy.

5. **Add cost tracking per fix** - Log API usage/cost in the PR body or Jira comment for the business case.

6. **Add retry logic for API errors** - Retry up to 3 times on transient errors (529, 500) before posting failure to Jira.
