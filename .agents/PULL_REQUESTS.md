# PR descriptions — Payment Search Challenge

Read this at the end of every ticket, and again when asked for a pull
request title, body, or `gh pr create` command. Write the title and
description in chat so they can be copied into the pull request. Do not
commit, push, create a branch, or open the pull request unless asked in that
message. `AGENTS.md` still applies: one ticket, no edits to `src/App.test.tsx`.

Fill every section from the ticket in `.agents/IMPLEMENTATION_PLAN.md`, the
diff, and the commands that were actually run. If a check was not run, leave
it unchecked and say so. Do not invent a pass.

Target branch: `main`.

## Title

`<type>[optional scope]: <description>`

Imperative, specific, under 72 characters. Name the ticket's outcome. Put the
ticket id in the body, not the title, unless the title would be ambiguous
without it.

| Type | Use when |
|---|---|
| `feat` | A challenge step or user-visible behaviour (T06–T13) |
| `fix` | A bug in something already signed off |
| `docs` | README or agent docs only (T01's README work, T14) |
| `refactor` | Behaviour stays the same |
| `test` | Tests only. Never a reason to edit `src/App.test.tsx` |
| `chore` | Setup, tooling, gitignore (T00) |
| `ci` | Workflow files only |

| Good | Avoid |
|---|---|
| `feat: show the first page of payments` | `Add some stuff` |
| `feat: search payments by id` | `T08` |
| `fix: map empty searches to payment not found` | `fixing bug` |
| `docs: describe setup, tests, and decisions` | `update readme` |
| `chore: ignore build artifacts` | `misc` |

## Branch

Suggest a name only. Daniel creates the branch.

`<type>/T<id>-<short-kebab-description>`

Lowercase. Match the ticket. Examples: `chore/T00-project-setup`,
`feat/T06-payments-table`, `feat/T08-search-by-payment-id`. After the first
review, add commits. Do not force-push.

## What to output

1. The title on its own line.
2. The body in one fenced markdown block, using the template below.
3. The `gh pr create` command in a second fence. Label it as not run unless
   Daniel asked to open the PR.

## Body template

```markdown
## Summary
<What changed and why, in 2–4 sentences. Name the ticket: T<id> — <title>.
Name the constraint or ADR when one drove the design. Mention a scoring step
when the ticket has one (Steps 1–8).>

## Ticket
- Plan: `.agents/IMPLEMENTATION_PLAN.md` — T<id>
- Depends on: <ticket ids, or none>
- Step: <`npm run test:stepN`, or "no scoring step">

## Test plan
Automated (commands that were run, with the result):
- [ ] `npx vitest run` — <pass, or the expected failure called out by the ticket>
- [ ] `npm run test:stepN` — <result, or "no scoring step">
- [ ] `npx tsc -b` — <result>
- [ ] `npm run lint` — <result>

Manual (`npm run dev`):
- [ ] <one checkbox per manual check, copied from the ticket>

## Screenshots
<Required when the UI changes. List each state to capture and the
`docs/*.png` it should match. Leave the boxes unchecked until the images are
attached. When nothing visual changed, write "No UI change.">

- [ ] <state> — matches `docs/<file>.png`

## Checklist
- [ ] One ticket only. Files outside that ticket's scope were not changed.
- [ ] `src/App.test.tsx` was not edited.
- [ ] User-facing strings come from `I18N` in `src/constants/i18n.ts`.
- [ ] No new dependency was added, unless it was already accepted in an ADR.
- [ ] No secrets, tokens, or `.env` values in the diff or this description.
- [ ] Accepted ADRs in `.agents/ARCHITECTURE.md` were followed. Nothing here depends on an ADR still marked Proposed.
```

## Checklist rules

Mark a box done only when it passed, or when it does not apply. When it does
not apply, check it and say why on the same line. Leave manual checks and
screenshots unchecked.

The pasted description names no person. It has no Follow-ups section. Out-of-scope notes stay in the chat report, not in the pull request.

Early tickets tell you the suite is expected to fail. Quote that expectation
in the test plan instead of treating the failure as a surprise.

## Opening the PR

Create it as a draft assigned to the author. Mark it ready only after the
automated checks passed, Daniel has run the manual scenarios, and the
checklist is filled in honestly.

```bash
gh pr create --title "feat: show the first page of payments" --assignee @me --draft --base main --body "$(cat <<'EOF'
<paste the filled body here>
EOF
)"
```
