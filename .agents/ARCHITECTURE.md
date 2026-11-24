# Architecture decisions — Payment Search Challenge

Agent rules live in `AGENTS.md` at the repo root. This file holds the
constraints and the decisions. Each decision has a **status**:

- **Accepted** — follow it.
- **Proposed** — a recommendation that Daniel has not signed off yet. Don't
  implement anything that depends on a Proposed decision. Stop and ask instead.
- **Rejected / Superseded** — kept for history. Don't follow it.

Change a status only when Daniel says so, and add the date.

---

## 1. Fixed constraints (from Checkout's challenge brief, `CHALLENGE.md`, and tests — not up for debate)

| Area | Constraint | Source |
|---|---|---|
| API | `GET /api/payments?search=&currency=&page=&pageSize=`, mocked by MSW (`src/mocks/handlers.ts`) | CHALLENGE.md |
| First load | `page=1`, `pageSize=5`; the table shows exactly 5 rows plus 1 header row | Step 1 test |
| Strings | Headers, buttons, labels and messages must match the `I18N` constants exactly | CHALLENGE.md, all tests |
| Search input | Found by placeholder `I18N.SEARCH_PLACEHOLDER`, or as role `searchbox` with name `I18N.SEARCH_LABEL` | Step 2 test |
| Search trigger | A button named `I18N.SEARCH_BUTTON` | Step 2 test |
| Clear | A button named `I18N.CLEAR_FILTERS`; clicking it empties the search input | Step 3 test |
| Errors | `pay_404` shows `I18N.PAYMENT_NOT_FOUND`; `pay_500` shows `I18N.INTERNAL_SERVER_ERROR` | Steps 4–5 |
| Currency | A `combobox` named `I18N.CURRENCY_FILTER_LABEL`; it **filters as soon as it changes, without clicking Search** | Step 6 test |
| Combined | Search then currency: both params are sent | Step 7 test |
| Pagination | Buttons named `I18N.PREVIOUS_BUTTON` / `I18N.NEXT_BUTTON`; Previous is disabled on page 1 | Step 8 test |
| Date format | `dd/MM/yyyy, HH:mm:ss` in **local time** (the test helper uses date-fns `format` on `new Date(iso)`) | Test helper + designs |
| Retries | Failed requests must not be retried; the error tests expect the message straight away. RTK Query doesn't retry by default. (If React Query is used, `retry: false` is already set in `App.tsx`.) | `App.tsx` comment |

### Known quirks in the starter

- The mock API returns **404 when a search has no results**, not `200` with an
  empty list. So "Payment not found" also covers "no results". See ADR-06.
- `CURRENCIES` in `constants/index.ts` lists 8 currencies (adds JPY and CZK).
  `CHALLENGE.md` lists 6. The mock data uses all 8. **Decision:** the dropdown
  lists all 8.
- `types/payment.ts` is empty. Defining the types is part of the task.
- `StatusBadge` in `components.tsx` forwards a `status` prop to the DOM, which
  makes React warn. It also styles `refunded` (present in the data) red, like
  `failed`. **Decision:** keep that red fallback. Fix the DOM warning only.
- `Table` in `components.tsx` contains invalid CSS (`text-sm: 14px`).
- The `QueryClient` in `App.tsx` is created at module level, so its cache is
  **shared between tests** in `App.test.tsx`. A Redux store created at module
  level would leak the same way: filters set in one test would still be set in
  the next. See ADR-03 for how to avoid it.
- `@reduxjs/toolkit` and `react-redux` are **not installed** yet.
- There is no `.gitignore`.
- `npm run score` points to a `scoring.js` file that doesn't exist. Leave it.
  No ticket.

---

## 2. Decisions

### ADR-01: Fetching data (server state)
**Status:** Accepted 2026-11-24. **RTK Query** (option A).

**Options**
- **A. RTK Query.** Ships inside `@reduxjs/toolkit`, so you get one state
  library and one set of DevTools. It caches per argument, has loading/error
  flags (`isLoading`, `isFetching`, `isError`), and keeps showing the last
  result while new arguments load. Remove `QueryClientProvider` from `App.tsx`.
- **B. Keep React Query for server state, Redux only for UI state.** A valid,
  common split, but it means two state libraries for one page. You'd need to
  explain why both are needed.

**Decision:** A.

**Loading behavior**
- First load (`isLoading`): the spinner, with `role="status"`.
- Later loads (`isFetching`): keep the current table and dim it with
  `aria-busy`.

**RTK Query gotchas to know (and to mention in the review):**
- When the arguments change, `data` still holds the **previous** result, even
  if the new request fails. Always check `isError` before rendering `data`, or
  use `currentData`.
- It does **not** cancel the old request when the arguments change. A stale
  response can't show on screen, because the hook reads the cache entry for
  the current arguments, but the request still completes.
- No retries by default, which is what the tests need.

---

### ADR-02: HTTP layer
**Status:** Accepted 2026-11-24

With RTK Query (ADR-01 A), use `fetchBaseQuery`. No axios.

- `baseUrl` must be **absolute**: `window.location.origin`. Under Vitest,
  `fetch` is Node's and rejects relative URLs. Verify this in T04.
- Leave out empty `search`/`currency` instead of sending `search=`. Pass
  `undefined`; `fetchBaseQuery` drops undefined params (verify in T04).
- `axios` becomes unused. Remove it in T02 (ADR-12).

---

### ADR-03: Where filter and page state live (client state)
**Status:** Accepted 2026-11-24 (Daniel): **Redux Toolkit.**

There are two kinds of state:
- **Draft:** what's typed in the search input.
- **Applied:** the filters actually sent to the API.

Search applies on submit. Currency applies immediately, because the test
requires it.

**Design**
- A `paymentFilters` slice (`createSlice`) holding
  `{ searchInput, search, currency, page }`. Reducers:
  - `searchInputChanged`
  - `searchSubmitted`: trims the draft and copies it to `search`
  - `currencyChanged`
  - `pageChanged`
  - `filtersCleared`
- **Resetting to page 1 happens inside the reducers** (`searchSubmitted`,
  `currencyChanged`), so no component can forget it.
- Selectors live next to the slice, e.g. `selectPaymentQueryArgs` and
  `selectHasActiveFilters`. Components read state only through selectors.
- `makeStore(preloadedState?)` is a factory, and `App` creates **one store per
  mount** (`useState(() => makeStore())`), not at module level. Each
  `render(<App />)` in Checkout's tests then starts clean.
- Typed hooks are created once and used everywhere:
  `useAppDispatch = useDispatch.withTypes<AppDispatch>()` and
  `useAppSelector = useSelector.withTypes<RootState>()`.
- `currency` is `"" | Currency`. `""` is the "Currencies" option and means no
  currency filter. Narrow the select's value with a type guard, not a cast.
- `selectHasActiveFilters` is true only when the applied `search` or
  `currency` is set. Unsaved text in `searchInput` does not count. `page > 1`
  does not count. The Clear button uses this selector.

**Settled 2026-11-24**
- Draft search text lives in the slice, so Clear resets it in one action.
- `searchSubmitted` trims the draft.
- `searchSubmitted` and `currencyChanged` reset `page` to 1.

**Rejected:** `useState`, `useReducer` (simpler, but you chose RTK), URL params
(jsdom keeps the URL between tests; mention it as the production choice).

---

### ADR-04: Component structure
**Status:** Accepted 2026-11-24

```
PaymentsPage        reads selectors + RTK Query hook; renders exactly one of loading / error / empty / table
├─ PaymentsFilters  <form role="search">: input, currency select, Search, Clear
├─ PaymentsTable    presentational; receives payments[]
└─ Pagination       presentational; receives page, total, pageSize, onPageChange
```

`PaymentsFilters` dispatches its own actions. `PaymentsPage` reads the
selectors, calls the query hook, and passes `onPageChange`. `PaymentsTable`
and `Pagination` receive plain props and don't know about Redux.

`PaymentsTable` is plain JSX: one written-out column per header. No column
config.

The pagination bar is shown whenever the table is shown, including a result
that fits on one page. Previous is disabled on page 1. Next is disabled when
there is no next page. The label is `Page N`.

---

### ADR-05: Styling
**Status:** Accepted 2026-11-24

Use the styled-components already provided in `src/components/components.tsx`.
They match the designs. Use Tailwind only for small utilities such as
`sr-only`. Fix the `StatusBadge` prop, using the transient `$status` prop, and
the invalid `Table` CSS when you touch them.

`refunded` keeps the same red styling as `failed`. Do not add a separate
colour. The search input and currency select already have a `:focus` ring.
`SearchButton`, `ClearButton`, and `DefaultButton` do not; add one.

---

### ADR-06: Error handling
**Status:** Accepted 2026-11-24

RTK Query returns errors as `FetchBaseQueryError` (`status` is a number for
HTTP errors, or a string such as `"FETCH_ERROR"`) or `SerializedError`. One
function, `getErrorMessage(error)`, narrows the shape with type guards and maps
it to the text shown:

| Status | Message |
|---|---|
| 404 | `I18N.PAYMENT_NOT_FOUND` |
| ≥ 500 | `I18N.INTERNAL_SERVER_ERROR` |
| anything else (401, network failure) | `I18N.SOMETHING_WENT_WRONG` |

The error **replaces the table**, as in the designs. Render it with
`role="alert"`.

A search that matches nothing is a **404** from the mock, so it shows
`I18N.PAYMENT_NOT_FOUND`. `I18N.NO_PAYMENTS_FOUND` is only for a **200** whose
`payments` array is empty. The mock never sends that response; the empty state
still exists for it.

---

### ADR-07: Formatting
**Status:** Accepted 2026-11-24

- **Date:** date-fns `format(new Date(iso), "dd/MM/yyyy, HH:mm:ss")` in local
  time. Matches the test helper and the designs.
- **Amount:** always 2 decimal places. The designs show JPY as `200.00`.
  `toFixed(2)` or `Intl.NumberFormat` with 2 fraction digits.

**Trade-off to mention in the review:** in production, format per currency with
`style: "currency"`. JPY has no minor units.

---

### ADR-08: Types
**Status:** Accepted 2026-11-24

- `Payment` with `status: "completed" | "pending" | "failed" | "refunded"`.
- `customerName` and `currency` are optional. When they're missing, the table
  renders `I18N.EMPTY_CUSTOMER` and `I18N.EMPTY_CURRENCY`.
- The currency filter value is `"" | Currency`, not `Currency` alone.
- `PaymentSearchResponse` is `{ payments, total, page, pageSize }`.
- Make `CURRENCIES` `as const` and derive `type Currency` from it.
- No `any`. Avoid `as` casts. Narrow unknown values with type guards
  (e.g. the select value → `"" | Currency`). Use `import type` for type-only
  imports.
- `tsconfig` already has `strict: true`. Don't weaken it.

---

### ADR-09: Testing
**Status:** Accepted 2026-11-24

- Checkout's `App.test.tsx` must pass and is never edited. That includes
  lint-only edits. An unused catch in that file stays.
- Each ticket adds its own tests in a separate file, e.g.
  `PaymentsPage.test.tsx` or `*.test.ts` for pure functions.
- A `renderWithProviders(ui, { preloadedState })` helper creates a **fresh
  store per test**, so filters and the API cache never leak between tests.
- The slice reducer and selectors are tested as plain functions, without
  rendering.
- Do **not** add `@testing-library/user-event`. Tests use `fireEvent`, same as
  Checkout's suite.

---

### ADR-10: Accessibility
**Status:** Accepted 2026-11-24

- Real `<label>` elements, visually hidden, for the search input and the select.
- The search input is `type="search"`, inside a `<form>`, so Enter submits.
- Errors use `role="alert"`. The loading state uses `role="status"` and the
  visually hidden string `I18N.LOADING` (`"Loading payments"`). That key is
  not in the starter file; add it.
- Table headers use `scope="col"`.
- The page label uses `aria-live="polite"`, so page changes are announced.
  The text is `I18N.PAGE_LABEL` plus the number (`Page 1`), matching the
  designs. Not "Page N of M".
- Every interactive element works with the keyboard alone and has a visible
  focus state (the designs show focus rings).
- Status is shown as text, not only as colour.

---

### ADR-11: Git workflow
**Status:** Accepted 2026-11-24

- Make one commit per signed-off ticket, with the ticket ID in the message,
  e.g. `T04: payments table (Step 1)`.
- Daniel commits and pushes. Agents never do (see AGENTS.md).

---

### ADR-12: Additional libraries
**Status:** Accepted 2026-11-24

The brief encourages libraries "if they improve your solution". Each option
below was considered, so the choice is deliberate and you can explain it if
the reviewer asks.

| Need | Candidates | Recommendation |
|---|---|---|
| Server state | RTK Query, React Query (installed), SWR | RTK Query (ADR-01, Accepted) |
| Client/UI state | Redux Toolkit, Zustand, Jotai, `useReducer` | **Redux Toolkit** (Accepted, ADR-03). Expect to be asked if it's overkill for 4 fields. Answer: predictable transitions in one place, selectors, DevTools, RTK Query for data in the same store, and it scales as filters grow. Add `@reduxjs/toolkit` and `react-redux`. |
| Forms | React Hook Form, Formik | **None.** One input and one select; a native `<form>` covers submit-on-Enter. Revisit if validation or more fields are added. |
| URL state | React Router search params, nuqs | **Not now** (see ADR-03, option C). Name it as the production choice. |
| UI components | Radix, Headless UI, MUI | **None.** The provided styled-components match the designs, and native `<select>`/`<button>` are accessible by default. |
| Clean-up | `@tanstack/react-query`, `axios` | **Remove** in T02, so `package.json` shows no unused dependencies. |
| Testing | `@testing-library/user-event` | **Not now.** Checkout's tests use `fireEvent`. Enter-to-submit is tested the same way. |

**Rule:** a new library needs a one-line reason here, e.g. "solves X, which
would otherwise need Y lines of custom code".

---

## 3. Decision log

| Date | ADR | Change | By |
|---|---|---|---|
| 2026-11-24 | ADR-03 | Accepted: Redux Toolkit for client state | Daniel |
| 2026-11-24 | ADR-01, 02, 06, 09, 12 | Updated to follow ADR-03 (RTK Query proposed) | Claude, for review |
| 2026-11-24 | ADR-01, 02, 04–12 | Accepted. Open questions closed in the same pass | User |
| 2026-11-24 | ADR-03 | Draft in the slice; trim on submit; filter changes reset page; Clear watches applied search or currency only; `currency` is `"" \| Currency` | User |
| 2026-11-24 | ADR-06 | No-match searches stay 404. Empty state is only a 200 with `payments: []` | User |
| 2026-11-24 | — | Currency dropdown lists all 8 codes. `refunded` stays red. No `scoring.js` ticket. `App.test.tsx` is never edited | User |
