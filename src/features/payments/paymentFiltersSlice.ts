import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_PAGE_SIZE, type Currency } from "../../constants";
import type { PaymentQueryArgs } from "../../types/payment";
import type { RootState } from "../../store/store";

export interface PaymentFiltersState {
  searchInput: string;
  search: string;
  currency: "" | Currency;
  page: number;
}

export const initialState: PaymentFiltersState = {
  searchInput: "",
  search: "",
  currency: "",
  page: 1,
};

const paymentFiltersSlice = createSlice({
  name: "paymentFilters",
  initialState,
  reducers: {
    searchInputChanged(state, action: PayloadAction<string>) {
      state.searchInput = action.payload;
    },
    searchSubmitted(state) {
      state.search = state.searchInput.trim();
      state.page = 1;
    },
    currencyChanged(state, action: PayloadAction<"" | Currency>) {
      state.currency = action.payload;
      state.page = 1;
    },
    pageChanged(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    filtersCleared() {
      return initialState;
    },
  },
});

export const {
  searchInputChanged,
  searchSubmitted,
  currencyChanged,
  pageChanged,
  filtersCleared,
} = paymentFiltersSlice.actions;

export const paymentFiltersReducer = paymentFiltersSlice.reducer;

export const selectSearchInput = (state: RootState) =>
  state.paymentFilters.searchInput;

export const selectCurrency = (state: RootState) =>
  state.paymentFilters.currency;

export const selectPage = (state: RootState) => state.paymentFilters.page;

export const selectHasActiveFilters = (state: RootState) =>
  state.paymentFilters.search !== "" || state.paymentFilters.currency !== "";

export const selectPaymentQueryArgs = createSelector(
  [(state: RootState) => state.paymentFilters],
  (filters): PaymentQueryArgs => {
    const { search, currency, page } = filters;

    return {
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      ...(search === "" ? {} : { search }),
      ...(currency === "" ? {} : { currency }),
    };
  },
);
