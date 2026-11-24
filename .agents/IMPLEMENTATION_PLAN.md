# Implementation plan — Payment Search Challenge

Read `AGENTS.md` and `.agents/ARCHITECTURE.md` first. Tickets go in order. Each
one is small enough to review in a few minutes.

**Status:** T00–T14 are complete and merged to `main` on 2026-11-24.

> **ADR-01 is Accepted: RTK Query.** T02, T04, T06 and T13 are written for that.

## Workflow for every ticket

1. **Agent** implements the ticket. Scope and acceptance criteria only.
2. **Agent** runs the automated checks and reports: files changed, command
   output, deviations. Then the agent **stops**.
3. In that same report, the agent gives a **PR title** and **description**
   to copy into the pull request. Follow `.agents/PULL_REQUESTS.md`.
   Fill it from this ticket and the commands that actually ran. Do not open
   the pull request.
4. **Daniel** runs the manual checks in the browser (`npm run dev`).
5. **Daniel** ticks the sign-off box, commits, and pushes. The manual checks
   in the description stay unchecked until he has run them.

A ticket is not done until it's signed off. If a ticket depends on a
**Proposed** ADR, Daniel accepts or changes that ADR before work starts.

**Run before every sign-off:**
```bash
npx vitest run          # all tests; the target step(s) must pass
npx tsc -b              # no type errors
npm run lint            # no lint errors in files you touched
```

## Brief checklist (from "Tips" in `CHALLENGE.md`)

| Tip | Where it's covered |
|---|---|
| Start with Step 1 and work through incrementally | Tickets follow steps 1→8. T01–T05 are small prep tickets for Step 1. T00b is folded into T01. |
| Run tests after each step | "Run before every sign-off", above, plus each ticket's `test:stepN` |
| Keep accessibility in mind | ADR-10; a11y criteria in T06 (header scope, button focus), T07, T08, T10, T11, T13 (page label); keyboard and screen-reader pass in T14 |
| Use TypeScript effectively | ADR-08; T01 (types), T02 (typed hooks), T04 (error type guards), T11 (currency type guard), T14 (no `any`) |
| Test with the provided payment IDs | T10 (`pay_404`, `pay_500`, `401`), T12 (`pay_205`), T13 (`pay_134`), T14 manual pass |
| Install packages if they help | ADR-12. Agents ask first (AGENTS.md); Daniel decides. |
| Consider libraries for state, forms, UI | ADR-12: Redux Toolkit chosen for state; forms and UI kits considered and not used, with reasons |

---

## T00 — Project setup
**Depends on:** —  **ADRs:** 11

**Scope**
- Add a `.gitignore` covering `node_modules`, `dist`, `coverage`, `junit.xml`
  and `*.tsbuildinfo`.
- `npm install`.
- Confirm `npm run dev` starts, and that MSW logs "Mocking enabled" in the
  browser console.

**Acceptance criteria**
- [x] `git status` shows no `node_modules` or `junit.xml`.
- [x] `npx vitest run` runs. All 11 tests fail, which is expected at this point.

**Manual checks**
- [x] The page shows "Start here".
- [x] DevTools console: MSW started.

**Sign-off:** ☑ 2026-11-24

---

## T01 — README, types, and constants
**Depends on:** T00  **ADRs:** 08

Former T00b and T01, done as one ticket.

**Scope**
- Rename Checkout's `README.md` to `CHALLENGE.md` with `git mv`, so git keeps
  its history. Image links (`./docs/*.png`) still work because the file stays in
  the root.
- Write a new `README.md` with:
  - a one-line summary, linking to `CHALLENGE.md` for the brief
  - prerequisites: Node.js 20. There is no `.nvmrc` in the repo.
  - how to install, run the app, run the tests (all, and per step), lint and
    type-check
  - the test payment IDs (`pay_134_*`, `pay_205_*`, `pay_404`, `pay_500`)
  - placeholder headings for **Structure**, **Decisions**, **Trade-offs** and
    **Next steps**, filled in at T14
- Fill in `Payment` and `PaymentSearchResponse` in `src/types/payment.ts`.
- Add `PaymentQueryArgs`: `{ search?, currency?, page, pageSize }`.
- Make `CURRENCIES` `as const`, export `type Currency`, and add
  `DEFAULT_PAGE_SIZE = 5`.

**Acceptance criteria**
- [x] Every command in the README runs as written on a fresh clone.
- [x] Nothing from the original brief is lost; it's all in `CHALLENGE.md`.
- [x] `npx tsc -b` passes, including `mockPaymentsData.ts`, which imports
      `Payment`.
- [x] No `any` in the new types.

**Manual checks**
- [x] The README renders properly on GitHub after you push. Check the
      `CHALLENGE.md` link and the images inside it.
- [x] Read the types against one mock payment and one API response from
      `CHALLENGE.md`.

**Sign-off:** ☑ 2026-11-24

---

## T02 — Redux store setup
**Depends on:** T01  **ADRs:** 01, 03, 12

**Scope**
- Install `@reduxjs/toolkit` and `react-redux`. If ADR-01 = RTK Query,
  uninstall `@tanstack/react-query` and `axios`.
- `src/store/store.ts`: `makeStore(preloadedState?)`, plus the `RootState`,
  `AppStore` and `AppDispatch` types.
- `src/store/hooks.ts`: `useAppDispatch` and `useAppSelector` via
  `.withTypes()`.
- `App.tsx`: replace `QueryClientProvider` with `<Provider>`, and create the
  store **per mount** with `useState(() => makeStore())`.
- `src/test/renderWithProviders.tsx`: renders with a fresh store and an
  optional `preloadedState`.
- Do not add `@testing-library/user-event`.

The store is empty in this ticket. The slices are added in T03 and T04.

**Acceptance criteria**
- [x] `npx tsc -b` and `npm run lint` pass.
- [x] A smoke test renders `<App />` with `renderWithProviders` and finds the
      title.
- [x] `package.json` has no unused state or HTTP libraries.

**Manual checks**
- [x] The Redux DevTools browser extension shows the store.
- [x] Read `App.tsx`: the store is not created at module level.

**Sign-off:** ☑ 2026-11-24

---

## T03 — Filters slice and selectors
**Depends on:** T02  **ADRs:** 03

**Scope**
- `src/features/payments/paymentFiltersSlice.ts`:
  - state `{ searchInput, search, currency, page }`
  - `currency` is `"" | Currency`
  - reducers `searchInputChanged`, `searchSubmitted`, `currencyChanged`,
    `pageChanged`, `filtersCleared`
- Selectors: `selectSearchInput`, `selectCurrency`, `selectPage`,
  `selectHasActiveFilters`, and `selectPaymentQueryArgs`, which leaves out
  empty `search` and `currency`.
- `selectHasActiveFilters` is true only when the applied `search` or
  `currency` is set. Unsaved `searchInput` and `page > 1` do not count.
- Register the slice in `makeStore`.

**Acceptance criteria** (unit tests, no rendering)
- [x] Typing (`searchInputChanged`) doesn't change the applied `search`.
- [x] `searchSubmitted` trims the draft, applies it, and resets `page` to 1.
- [x] `currencyChanged` applies the currency immediately and resets `page`
      to 1.
- [x] `pageChanged` never goes below 1.
- [x] `filtersCleared` returns the initial state.
- [x] `selectHasActiveFilters` is false for unsaved input and for page 2 with
      no search or currency, and true when `search` or `currency` is applied.
- [x] `selectPaymentQueryArgs` has no empty `search` or `currency`, and always
      has `page` and `pageSize`.

**Manual checks**
- [x] Read the reducers. Could you explain each one in the review?

**Sign-off:** ☑ 2026-11-24

---

## T04 — Payments API slice and error mapping
**Depends on:** T02  **ADRs:** 01, 02, 06

**Scope**
- `src/features/payments/paymentsApi.ts`:
  - `createApi` with `fetchBaseQuery`, using `baseUrl: window.location.origin`
  - one `getPayments` query endpoint taking `PaymentQueryArgs`
  - export `useGetPaymentsQuery`
- Register the API reducer **and middleware** in `makeStore`.
- `src/utils/errors.ts`: `getErrorMessage(error)` with type guards for
  `FetchBaseQueryError` and `SerializedError`, mapped as in ADR-06.

**Acceptance criteria**
- [x] Test with MSW: the request URL has `page=1&pageSize=5` and no `search=`
      or `currency=` when they're empty. This confirms the ADR-02 assumptions.
- [x] Unit tests: 404, 500, 503, 401, `FETCH_ERROR` and `SerializedError` each
      map to the right message.

**Manual checks**
- [x] Redux DevTools shows the `paymentsApi` cache entry after load.

**Sign-off:** ☑ 2026-11-24

---

## T05 — Formatters
**Depends on:** T00  **ADRs:** 07

**Scope:** `src/utils/format.ts` with `formatAmount` and `formatDate`.

**Acceptance criteria**
- [x] Unit tests: `250 → "250.00"`, `150.5 → "150.50"`, `85.25 → "85.25"`.
- [x] `formatDate` returns the same output as the test helper's `formattedDate`.

**Manual checks**
- [x] Compare against the date and amount columns in `docs/payments_page.png`.

**Sign-off:** ☑ 2026-11-24

---

## T06 — Payments table (Step 1)
**Depends on:** T03, T04, T05  **ADRs:** 01, 04, 05

**Scope**
- `PaymentsTable` with the 6 i18n headers, written out as plain JSX, and
  `StatusBadge`. Header cells use `scope="col"`.
- A missing `customerName` or `currency` renders `I18N.EMPTY_CUSTOMER` or
  `I18N.EMPTY_CURRENCY`.
- Fix the `$status` prop and the `Table` CSS in `components.tsx`. Leave the
  `refunded` colour as the red fallback.
- Add a visible `:focus` ring to `SearchButton`, `ClearButton`, and
  `DefaultButton`. The input and select already have one.
- `PaymentsPage` reads `selectPaymentQueryArgs`, calls `useGetPaymentsQuery`,
  and renders the title and the table.

**Acceptance criteria**
- [x] `npm run test:step1` passes.
- [x] The first request sends `page=1&pageSize=5`.

**Manual checks**
- [x] Matches `docs/payments_page.png`: title, columns, badge colours, 2-decimal
      amounts.
- [x] No React or styled-components warnings in the console.

**Sign-off:** ☑ 2026-11-24

---

## T07 — Loading and empty states
**Depends on:** T06  **ADRs:** 04, 10

**Scope**
- Loading (`isLoading`, the first load only): the `Spinner`, with
  `role="status"` and a visually hidden `I18N.LOADING` (`"Loading payments"`).
  Add that key to `src/constants/i18n.ts`.
- Later loads (`isFetching`): keep the current table and dim it with
  `aria-busy`.
- Empty list: `I18N.NO_PAYMENTS_FOUND` in an `EmptyBox`. This is only for a
  200 with `payments: []`. A 404, including a search that matches nothing, is
  the error state in T10.

**Acceptance criteria**
- [x] A test asserts the loading state shows before the data arrives.
- [x] A test asserts the empty state, using an MSW override that returns
      `payments: []`.

**Manual checks**
- [x] DevTools → Network → throttle to "Slow 3G": the spinner shows, then the
      table.

**Sign-off:** ☑ 2026-11-24

---

## T08 — Search by payment ID (Step 2)
**Depends on:** T06  **ADRs:** 03, 10

**Scope**
- `PaymentsFilters`: a `<form role="search">` with a labelled `type="search"`
  input and a Search submit button.
- The input dispatches `searchInputChanged`. Submit dispatches
  `searchSubmitted`. `PaymentsFilters` dispatches these itself.
- Submit tests use `fireEvent`, not `@testing-library/user-event`.

**Acceptance criteria**
- [x] `npm run test:step2` passes.
- [x] Test: typing alone sends no request.
- [x] Test: Enter submits.
- [x] Test: whitespace is trimmed.

**Manual checks**
- [x] Matches `docs/search_by_payment_id_with_search.png`.
- [x] Searching `pay_134_1` shows exactly one row.
- [x] Redux DevTools: typing logs `searchInputChanged`, and Search logs
      `searchSubmitted`.

**Sign-off:** ☑ 2026-11-24

---

## T09 — Clear filters (Step 3)
**Depends on:** T08  **ADRs:** 03

**Scope**
- The Clear button shows when `selectHasActiveFilters` is true: an applied
  `search` or `currency`. Typing without submitting does not show it. Page 2
  with no filters does not show it.
- Clicking it dispatches `filtersCleared`.

**Acceptance criteria**
- [x] `npm run test:step3` passes.
- [x] Test: the button is hidden on first load and hidden again after clearing.

**Manual checks**
- [x] Matches `docs/clear_filters.png`.
- [x] After clearing, the unfiltered list comes back.

**Sign-off:** ☑ 2026-11-24

---

## T10 — Error states (Steps 4 & 5)
**Depends on:** T04, T08  **ADRs:** 06, 10

**Scope**
- If `isError`, render `getErrorMessage(error)` in an `ErrorBox` with
  `role="alert"`, in place of the table.
- Check `isError` **before** `data`. RTK Query keeps the previous `data` when a
  new request fails (ADR-01 gotcha).

**Acceptance criteria**
- [x] `npm run test:step4` and `npm run test:step5` pass.
- [x] Test: searching `401` shows `SOMETHING_WENT_WRONG`.
- [x] Test: after a successful load, searching `pay_404` shows the error and
      **no table**. This proves the stale data isn't shown.
- [x] Test: clearing after an error brings the table back.

**Manual checks**
- [x] Matches `docs/payment_not_found.png` and `docs/internal_server_error.png`.
- [x] The Clear button is visible in the error state.

**Sign-off:** ☑ 2026-11-24

---

## T11 — Currency filter (Step 6)
**Depends on:** T09  **ADRs:** 03, 08, 10

**Scope**
- A labelled `<select>`. The first option is `I18N.CURRENCIES_OPTION` with value
  `""`. The other options come from `CURRENCIES`.
- On change, dispatch `currencyChanged`. Narrow the value to `"" | Currency`
  with a type guard, not a cast. The options are all 8 entries in
  `CURRENCIES`, including JPY and CZK.
- `filtersCleared` already resets it.

**Acceptance criteria**
- [x] `npm run test:step6` passes.
- [x] Test: the request carries `currency=USD`.
- [x] Test: Clear resets the select to `""`.

**Manual checks**
- [x] Matches `docs/filter_by_currency.png`.
- [x] Every row shows the selected currency.

**Sign-off:** ☑ 2026-11-24

---

## T12 — Combined filters (Step 7)
**Depends on:** T11

**Scope:** mostly verification. Make sure search and currency are sent
together, and that changing one keeps the other.

**Acceptance criteria**
- [x] `npm run test:step7` passes.
- [x] Test: `pay_205` + `EUR` sends both params, and every row is EUR.

**Manual checks**
- [x] Matches `docs/filter_by_payment_id_and_currency.png`: `pay_205_2` and
      `pay_205_13`.

**Sign-off:** ☑ 2026-11-24

---

## T13 — Pagination (Step 8)
**Depends on:** T06, T11  **ADRs:** 01, 03, 10

**Scope**
- `Pagination` with Previous, "Page N" and Next, inside the table card. It
  receives `page`, `pageSize`, `total` and `onPageChange` as props.
- `PaymentsPage` passes `onPageChange`, which dispatches `pageChanged`.
- Previous is disabled on page 1. Next is disabled on the last page, using
  `total`.
- The bar is shown whenever the table is shown, including a one-page result.
- The label is `I18N.PAGE_LABEL` plus the number (`Page 1`), inside an element
  with `aria-live="polite"`. Not "Page N of M".

**Acceptance criteria**
- [x] `npm run test:step8` passes.
- [x] Test: Next → page 2 shows different rows. Previous is enabled and goes
      back.
- [x] Test: Next is disabled for `pay_134`, which has exactly 5 results.
- [x] Test: changing a filter on page 2 goes back to page 1.

**Manual checks**
- [x] Matches `docs/paginate_payments_page_1.png` and `_2.png`.
- [x] Going back to page 1 is instant, served from the RTK Query cache. Check
      the Network tab: no new request.
- [x] Click Next quickly several times: no flicker, and no page skipped or
      shown out of order.

**Sign-off:** ☑ 2026-11-24

---

## T14 — Clean-up and README
**Depends on:** T00–T13

**Scope**
- `npm run lint` and `npx tsc -b` are clean across the repo, including the
  `any` in `mocks/handlers.ts`. Do not edit `App.test.tsx`. The unused catch
  in that file stays.
- Fill in the README headings left as placeholders in T01:
  - Structure
  - Decisions: summarise the accepted ADRs in plain words, including why Redux
    Toolkit
  - Trade-offs
  - Next steps: the follow-ups at the end of this plan
- Update the run instructions if anything changed since T01.

**Acceptance criteria**
- [x] All tests pass. `npm run build` succeeds.
- [x] The README describes what was actually built. Nothing is listed that
      isn't in the code.

**Manual checks**
- [x] Go through every screenshot in `docs/` once more.
- [x] Keyboard-only pass: Tab through input → select → Search → Clear →
      Previous → Next. Every element has a visible focus ring, and Enter/Space
      work.
- [x] Screen reader pass (VoiceOver: Cmd+F5). The input and select read their
      labels, errors are announced, and the page number is announced on Next.
- [x] Run the test IDs by hand: `pay_134_1`, `pay_205` + EUR, `pay_404`,
      `pay_500`, `401`.

**Sign-off:** ☑ 2026-11-24

---

## Follow-ups (out of scope; for the review discussion)
- Filters in the URL, so views can be shared. With Redux: sync the slice to and
  from the URL, or let the router own them.
- Amounts formatted per currency.
- A retry button on the error state (RTK Query's `refetch`).
- Search-as-you-type with debounce.
- Use only one of styled-components and Tailwind.
