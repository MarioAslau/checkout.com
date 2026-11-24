import { expect, test } from "vitest";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import type { RootState } from "../../store/store";
import {
  currencyChanged,
  filtersCleared,
  initialState,
  pageChanged,
  paymentFiltersReducer,
  searchInputChanged,
  searchSubmitted,
  selectHasActiveFilters,
  selectPaymentQueryArgs,
  type PaymentFiltersState,
} from "./paymentFiltersSlice";

function root(paymentFilters: PaymentFiltersState): RootState {
  return { paymentFilters };
}

test("typing does not change the applied search", () => {
  const typed = paymentFiltersReducer(
    initialState,
    searchInputChanged("pay_134"),
  );

  expect(typed.searchInput).toBe("pay_134");
  expect(typed.search).toBe("");
});

test("submitting trims the draft, applies it, and resets the page", () => {
  const drafted = paymentFiltersReducer(
    { ...initialState, page: 3 },
    searchInputChanged("  pay_134  "),
  );
  const submitted = paymentFiltersReducer(drafted, searchSubmitted());

  expect(submitted.search).toBe("pay_134");
  expect(submitted.page).toBe(1);
});

test("changing currency applies it immediately and resets the page", () => {
  const changed = paymentFiltersReducer(
    { ...initialState, page: 4 },
    currencyChanged("USD"),
  );

  expect(changed.currency).toBe("USD");
  expect(changed.page).toBe(1);
});

test("the page never goes below 1", () => {
  expect(
    paymentFiltersReducer(initialState, pageChanged(0)).page,
  ).toBe(1);
  expect(
    paymentFiltersReducer(initialState, pageChanged(-3)).page,
  ).toBe(1);
  expect(
    paymentFiltersReducer(initialState, pageChanged(2)).page,
  ).toBe(2);
});

test("clearing filters returns the initial state", () => {
  const dirty = paymentFiltersReducer(
    {
      searchInput: "pay_134",
      search: "pay_134",
      currency: "EUR",
      page: 2,
    },
    filtersCleared(),
  );

  expect(dirty).toEqual(initialState);
});

test("active filters ignore unsaved text and the page number", () => {
  const typed = paymentFiltersReducer(
    initialState,
    searchInputChanged("pay_134"),
  );
  const paged = paymentFiltersReducer(initialState, pageChanged(2));

  expect(selectHasActiveFilters(root(typed))).toBe(false);
  expect(selectHasActiveFilters(root(paged))).toBe(false);
});

test("active filters are true when search or currency is applied", () => {
  const searched = paymentFiltersReducer(
    paymentFiltersReducer(initialState, searchInputChanged("pay_134")),
    searchSubmitted(),
  );
  const filtered = paymentFiltersReducer(initialState, currencyChanged("EUR"));

  expect(selectHasActiveFilters(root(searched))).toBe(true);
  expect(selectHasActiveFilters(root(filtered))).toBe(true);
});

test("query args omit empty search and currency and always include page size", () => {
  const empty = selectPaymentQueryArgs(root(initialState));
  const filled = selectPaymentQueryArgs(
    root({
      searchInput: "  pay_205  ",
      search: "pay_205",
      currency: "EUR",
      page: 2,
    }),
  );

  expect(empty).toEqual({ page: 1, pageSize: DEFAULT_PAGE_SIZE });
  expect(empty).not.toHaveProperty("search");
  expect(empty).not.toHaveProperty("currency");
  expect(filled).toEqual({
    search: "pay_205",
    currency: "EUR",
    page: 2,
    pageSize: DEFAULT_PAGE_SIZE,
  });
});
