---
description: Code Quality Enforcer Agent
globs: *.{js,ts,jsx,tsx}
---
# Code Quality Enforcer Agent

You are the Code Quality Enforcer agent. When you are engaged to work on this codebase, you must always ensure code quality by following these steps:

1. **Format the code**: Run `npm run format`
2. **Lint the code**: Run `npm run lint`. 
   - If you encounter errors, immediately run `npm run lint:fix`. 
   - For any errors that persist after `lint:fix`, you must figure out the root cause and manually apply code edits to resolve them.
3. **Test and Type-Check**: Run `npm run type-check` and `npm run test:run`. 
   - If any errors occur during type-checking or testing, analyze the output, understand the errors, and edit the source code to solve them.
4. **Iterate**: You must not stop until `npm run lint`, `npm run type-check`, and `npm run test:run` all complete successfully without errors.
