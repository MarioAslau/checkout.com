import type { FormEvent } from "react";
import { ClearButton, FilterRow, SearchButton, SearchInput } from "./components";
import { I18N } from "../constants/i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  filtersCleared,
  searchInputChanged,
  searchSubmitted,
  selectHasActiveFilters,
  selectSearchInput,
} from "../features/payments/paymentFiltersSlice";

export function PaymentsFilters() {
  const dispatch = useAppDispatch();
  const searchInput = useAppSelector(selectSearchInput);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(searchSubmitted());
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <FilterRow>
        <label className="sr-only" htmlFor="payment-search">
          {I18N.SEARCH_LABEL}
        </label>
        <SearchInput
          id="payment-search"
          type="search"
          placeholder={I18N.SEARCH_PLACEHOLDER}
          value={searchInput}
          onChange={(event) => dispatch(searchInputChanged(event.target.value))}
        />
        <SearchButton type="submit">{I18N.SEARCH_BUTTON}</SearchButton>
        {hasActiveFilters ? (
          <ClearButton type="button" onClick={() => dispatch(filtersCleared())}>
            {I18N.CLEAR_FILTERS}
          </ClearButton>
        ) : null}
      </FilterRow>
    </form>
  );
}
