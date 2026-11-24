# Agent instructions — Payment Search Challenge

Read `.agents/ARCHITECTURE.md` and `.agents/IMPLEMENTATION_PLAN.md` before making any
change. Design references are in `docs/*.png`.

## Rules

1. Work on **one ticket at a time** from `.agents/IMPLEMENTATION_PLAN.md`. Don't
   start the next ticket until Daniel has signed off the current one.
2. **Never commit, push, or create branches.** Daniel reviews, signs off, and
   commits each ticket himself.
3. When a ticket is done, **stop** and report:
   - the files you changed
   - the commands you ran and their output
   - anything you were unsure about or deviated from
4. **Never edit `src/App.test.tsx`.** It is Checkout's scoring suite.
5. Don't add dependencies without asking.
6. Every user-facing string comes from `I18N` in `src/constants/i18n.ts`. If a
   string is missing, propose a new key. Don't hard-code it.
7. Don't implement anything that depends on an ADR still marked **Proposed**.
   Ask first.
8. Stay inside the ticket's scope. List anything else you notice under
   "Follow-ups" in your report. Don't fix it.
9. If a ticket conflicts with `.agents/ARCHITECTURE.md`, the architecture file
   wins. Flag the conflict.
10. When Daniel asks for a PR title or description, read
    `.agents/PULL_REQUESTS.md` and fill it from the ticket and the commands
    that actually ran. Do not open the pull request unless he asks.

## Commands

```bash
npm run dev            # app at http://localhost:5173, API mocked by MSW
npx vitest run         # all tests
npm run test:stepN     # Checkout's test for step N (1–8)
npx tsc -b             # type-check
npm run lint
```
