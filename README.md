# Payment search

A payments table with search, a currency filter, and pagination. The challenge brief is in [CHALLENGE.md](./CHALLENGE.md).

## Prerequisites

Node.js 20.

## Commands

```bash
npm install
npm run dev                 # http://localhost:3000, API mocked by MSW
npx vitest run              # all tests
npx vitest run -t "Step 1:" # one scoring step; Step 2 through Step 8 the same way
npm run lint
npx tsc -b
npm run build
```

`npm run test:stepN` starts Vitest in watch mode and does not exit. Use the `npx vitest run -t` command above.

## Test payment IDs

- `pay_134_*`
- `pay_205_*`
- `pay_404`
- `pay_500`

## Structure

```
src/App.tsx                  one Redux store per mount
src/components/              page, filters, table, pagination, styled parts
src/features/payments/       filter slice and the payments query
src/store/                   store factory and typed hooks
src/utils/                   amount, date, and error text
src/mocks/                   MSW handlers and fixture payments
src/constants/               currencies, page size, copy
src/types/payment.ts         payment and query types
```

`PaymentsPage` reads the filters and the query, then shows one of loading, error, empty, or the table. `PaymentsFilters` dispatches its own actions. The table and pagination only receive props.

## Decisions

Filter state lives in a Redux Toolkit slice: the search draft, the applied search, the currency, and the page. Search is sent on submit, after trimming. Currency is sent as soon as the select changes. Either change returns to page 1. Clear is shown only when a search or a currency is applied, and it resets the draft as well. Redux Toolkit is more than four fields need on their own. The reason for it is that those transitions stay in one reducer, the selectors are shared, Redux DevTools shows each change, and RTK Query keeps the server cache in the same store. A store created at module level would leak between tests, so each mount of `App` creates its own.

The payments request is an RTK Query endpoint. The first load shows a spinner. A later load keeps the table and marks it busy. A failure replaces the table. The error is checked before the cached rows, because a failed request still leaves the previous result on `data`. There are no retries. `404` shows "Payment not found." A `200` with an empty list shows "No payments found." A status of 500 or higher shows the server message. Anything else, including `401`, shows "Something went wrong!"

Dates use `dd/MM/yyyy, HH:mm:ss` in local time. Amounts always show two decimal places. The currency select lists the eight codes in the fixtures, including JPY and CZK. Pagination shows Previous, `Page N`, and Next inside the table card, including when the result fits on one page. The rows come from the current query arguments, so a slow response for an earlier page does not replace a later one.

Copy comes from `src/constants/i18n.ts`. The layout uses the styled-components from the starter. Tailwind is only used for small utilities such as `sr-only` and the busy-state opacity.

## Trade-offs

Shareable views would keep the filters in the URL. That is the better production shape. The tests share one jsdom URL, so the filters stay in Redux instead.

Amounts are always two decimals, including JPY, which has no minor units. Formatting per currency would be the production choice. Dates are local, so a screenshot taken in another timezone will not show the same clock time.

The mock answers a search with no matches with `404`, not with an empty `200`. The empty state is still implemented for a real empty list. `refunded` uses the same red as `failed`.

styled-components and Tailwind are both still installed. The page does not depend on both for the same job, but one system would be enough.

## Next steps

Not built yet:

- Put the filters in the URL so a view can be shared. Sync the slice to the URL, or let the router own the filters.
- Format amounts per currency.
- Add a retry button on the error state, using the query's `refetch`.
- Search as you type, with a debounce.
- Use only one of styled-components and Tailwind.
