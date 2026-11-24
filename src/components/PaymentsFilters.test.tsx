import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { setupServer } from "msw/node";
import App from "../App";
import { I18N } from "../constants/i18n";
import { handlers } from "../mocks/handlers";
import { PaymentsFilters } from "./PaymentsFilters";
import { renderWithProviders } from "../test/renderWithProviders";
import { initialState } from "../features/payments/paymentFiltersSlice";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function getSearchInput() {
  return screen.getByPlaceholderText(I18N.SEARCH_PLACEHOLDER);
}

test("typing alone sends no request", async () => {
  render(<App />);
  await screen.findByRole("table");

  let requests = 0;
  server.events.on("request:start", () => {
    requests += 1;
  });

  fireEvent.change(getSearchInput(), { target: { value: "pay_134" } });
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(requests).toBe(0);
  expect(getSearchInput()).toHaveValue("pay_134");
});

test("Enter submits the search", async () => {
  render(<App />);

  fireEvent.change(getSearchInput(), { target: { value: "pay_134_1" } });
  fireEvent.submit(screen.getByRole("search"));

  expect(await screen.findByText("pay_134_1")).toBeInTheDocument();
  expect(screen.getAllByRole("row")).toHaveLength(2);
});

test("whitespace is trimmed before the request", async () => {
  const searches: Array<string | null> = [];

  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/api/payments")) {
      searches.push(url.searchParams.get("search"));
    }
  });

  render(<App />);
  fireEvent.change(getSearchInput(), { target: { value: "  pay_134_1  " } });
  fireEvent.submit(screen.getByRole("search"));

  await screen.findByText("pay_134_1");

  expect(searches).toContain("pay_134_1");
  expect(searches).not.toContain("  pay_134_1  ");
});

function queryClearButton() {
  return screen.queryByRole("button", { name: I18N.CLEAR_FILTERS });
}

test("the clear button is hidden until a filter is applied, then hidden again after clearing", async () => {
  render(<App />);

  expect(queryClearButton()).not.toBeInTheDocument();

  fireEvent.change(getSearchInput(), { target: { value: "pay" } });
  expect(queryClearButton()).not.toBeInTheDocument();

  fireEvent.change(getSearchInput(), { target: { value: "pay_134_1" } });
  fireEvent.click(screen.getByRole("button", { name: I18N.SEARCH_BUTTON }));
  await screen.findByText("pay_134_1");

  fireEvent.click(screen.getByRole("button", { name: I18N.CLEAR_FILTERS }));

  expect(getSearchInput()).toHaveValue("");
  expect(queryClearButton()).not.toBeInTheDocument();
  expect(await screen.findByRole("table")).toBeInTheDocument();
  expect(screen.getAllByRole("row").length).toBeGreaterThan(2);
});

test("page 2 with no applied filters does not show the clear button", () => {
  renderWithProviders(<PaymentsFilters />, {
    preloadedState: {
      paymentFilters: { ...initialState, page: 2 },
    },
  });

  expect(queryClearButton()).not.toBeInTheDocument();
});

test("an applied currency shows the clear button", () => {
  renderWithProviders(<PaymentsFilters />, {
    preloadedState: {
      paymentFilters: { ...initialState, currency: "USD" },
    },
  });

  expect(screen.getByRole("button", { name: I18N.CLEAR_FILTERS })).toBeInTheDocument();
});
