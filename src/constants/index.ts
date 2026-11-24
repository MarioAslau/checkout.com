export const API_URL = "/api/payments";

export const CURRENCIES = [
  "USD", "EUR", "GBP", "AUD", "CAD", "ZAR", "JPY", "CZK",
] as const;

export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_PAGE_SIZE = 5;
