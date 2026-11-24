import type { ChangeEvent, FormEvent } from "react";
import { ClearButton, FilterRow, SearchButton, SearchInput, Select } from "./components";
import { CURRENCIES, type Currency } from "../constants";
import { I18N } from "../constants/i18n";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  currencyChanged,
  filtersCleared,
  searchInputChanged,
  searchSubmitted,
  selectCurrency,
  selectHasActiveFilters,
  selectSearchInput,
} from "../features/payments/paymentFiltersSlice";

function isCurrency(value: string): value is Currency {
  return CURRENCIES.some((currency) => currency === value);
}

export function PaymentsFilters() {
  const dispatch = useAppDispatch();
  const searchInput = useAppSelector(selectSearchInput);
  const currency = useAppSelector(selectCurrency);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(searchSubmitted());
  }

  function handleCurrencyChange(event: ChangeEvent<HTMLSelectElement>) {
    const { value } = event.target;
    if (value === "" || isCurrency(value)) {
      dispatch(currencyChanged(value));
    }
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
        <label className="sr-only" htmlFor="currency-filter">
          {I18N.CURRENCY_FILTER_LABEL}
        </label>
        <Select id="currency-filter" value={currency} onChange={handleCurrencyChange}>
          <option value="">{I18N.CURRENCIES_OPTION}</option>
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
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
