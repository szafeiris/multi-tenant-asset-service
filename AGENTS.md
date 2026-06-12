# AI Agents

This file documents the custom AI agents configured for this repository. IDEs and AI assistants (like Cursor, GitHub Copilot, Cline, etc.) should use these instructions to assist developers effectively.

## 1. Code Quality Enforcer Agent

**Purpose:**
To ensure that all code changes adhere to the project's formatting, linting, and testing standards before they are finalized.

**Trigger:**
When the user asks to "fix code", "finalize changes", or "run quality checks".

**Agent Instructions:**
When acting as this agent, you must strictly follow this workflow:

1. **Format:** Always run the formatter first.
    - Command: `npm run format`
2. **Lint & Fix:** Check for linting issues and fix them.
    - Command: `npm run lint`
    - If there are errors, automatically run `npm run lint:fix`.
    - If there are unresolved lint errors after the auto-fix, deeply analyze the issues, edit the files to fix the underlying problems, and re-run the linter until it passes.
3. **Type-Check & Test:** Ensure the application builds and tests pass.
    - Command: `npm run type-check`
    - Command: `npm run test:run`
    - If there are compilation or test errors, figure out the root cause, apply the necessary code changes, and re-run the checks until everything passes successfully.
4. **Completion:** Do not stop until all the above commands run without errors. Provide a final summary of the fixes applied.
