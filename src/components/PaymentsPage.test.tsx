import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import App from "../App";
import { I18N } from "../constants/i18n";
import { handlers } from "../mocks/handlers";
import type { Payment } from "../types/payment";
import { PaymentsTable } from "./PaymentsTable";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("the first request asks for page 1 with five payments", async () => {
  let requestUrl = "";

  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/api/payments") && requestUrl === "") {
      requestUrl = request.url;
    }
  });

  render(<App />);
  await screen.findByRole("table");

  const url = new URL(requestUrl);
  expect(url.searchParams.get("page")).toBe("1");
  expect(url.searchParams.get("pageSize")).toBe("5");
});

test("missing customer and currency render the fallback", () => {
  const payment: Payment = {
    id: "pay_missing",
    amount: 10,
    customerAddress: "1 Test St",
    status: "completed",
    date: "2024-04-15T10:00:00Z",
    description: "Missing fields",
  };

  render(<PaymentsTable payments={[payment]} />);

  expect(screen.getAllByText(I18N.EMPTY_CUSTOMER)).toHaveLength(2);
});

test("shows a loading status before the payments arrive", async () => {
  server.use(
    http.get("*/api/payments", async () => {
      await delay(200);
      return HttpResponse.json({
        payments: [
          {
            id: "pay_134_1",
            customerName: "Alice Green",
            amount: 250,
            customerAddress: "101 Green St",
            currency: "USD",
            status: "completed",
            date: "2024-04-15T10:00:00Z",
            description: "Service payment",
          },
        ],
        total: 1,
        page: 1,
        pageSize: 5,
      });
    }),
  );

  render(<App />);

  expect(screen.getByRole("status")).toBeInTheDocument();
  expect(screen.getByText(I18N.LOADING)).toBeInTheDocument();
  expect(await screen.findByRole("table")).toBeInTheDocument();
});

test("shows the empty state when the response has no payments", async () => {
  server.use(
    http.get("*/api/payments", () =>
      HttpResponse.json({ payments: [], total: 0, page: 1, pageSize: 5 }),
    ),
  );

  render(<App />);

  expect(await screen.findByText(I18N.NO_PAYMENTS_FOUND)).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

function searchFor(value: string) {
  fireEvent.change(screen.getByPlaceholderText(I18N.SEARCH_PLACEHOLDER), {
    target: { value },
  });
  fireEvent.click(screen.getByRole("button", { name: I18N.SEARCH_BUTTON }));
}

test("searching 401 shows something went wrong", async () => {
  render(<App />);

  searchFor("401");

  expect(await screen.findByRole("alert")).toHaveTextContent(I18N.SOMETHING_WENT_WRONG);
});

test("a failed search replaces the table instead of keeping the previous rows", async () => {
  render(<App />);
  await screen.findByRole("table");

  searchFor("pay_404");

  expect(await screen.findByRole("alert")).toHaveTextContent(I18N.PAYMENT_NOT_FOUND);
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("clearing after an error brings the table back", async () => {
  render(<App />);
  await screen.findByRole("table");

  searchFor("pay_404");
  await screen.findByRole("alert");

  fireEvent.click(screen.getByRole("button", { name: I18N.CLEAR_FILTERS }));

  expect(await screen.findByRole("table")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

function payment(id: string): Payment {
  return {
    id,
    amount: 10,
    customerAddress: "1 Test St",
    status: "completed",
    date: "2024-04-15T10:00:00Z",
    description: "Paged payment",
    currency: "USD",
    customerName: "Ada",
  };
}

test("Next opens page 2 and Previous returns to page 1", async () => {
  render(<App />);
  await screen.findByText("pay_134_1");

  fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));

  expect(await screen.findByText("pay_456_1")).toBeInTheDocument();
  expect(screen.queryByText("pay_134_1")).not.toBeInTheDocument();
  expect(screen.getByText(`${I18N.PAGE_LABEL} 2`)).toBeInTheDocument();

  const previous = screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON });
  expect(previous).toBeEnabled();
  fireEvent.click(previous);

  expect(await screen.findByText("pay_134_1")).toBeInTheDocument();
  expect(screen.queryByText("pay_456_1")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON })).toBeDisabled();
});

test("Next is disabled when the search has exactly one page", async () => {
  render(<App />);

  fireEvent.change(screen.getByPlaceholderText(I18N.SEARCH_PLACEHOLDER), {
    target: { value: "pay_134" },
  });
  fireEvent.click(screen.getByRole("button", { name: I18N.SEARCH_BUTTON }));

  expect(await screen.findByText("pay_134_5")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: I18N.NEXT_BUTTON })).toBeDisabled();
  expect(screen.getByText(`${I18N.PAGE_LABEL} 1`)).toBeInTheDocument();
});

test("changing a filter on page 2 returns to page 1", async () => {
  const queries: Array<{ page: string | null; currency: string | null }> = [];

  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/api/payments")) {
      queries.push({
        page: url.searchParams.get("page"),
        currency: url.searchParams.get("currency"),
      });
    }
  });

  render(<App />);
  await screen.findByText("pay_134_1");
  fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));
  await screen.findByText("pay_456_1");

  fireEvent.change(screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL }), {
    target: { value: "USD" },
  });

  expect(await screen.findByText(`${I18N.PAGE_LABEL} 1`)).toBeInTheDocument();
  expect(queries).toContainEqual({ page: "1", currency: "USD" });
  expect(screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON })).toBeDisabled();
});

test("a slow earlier page does not replace a later page", async () => {
  server.use(
    http.get("*/api/payments", async ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
      await delay(page === 2 ? 400 : 20);
      return HttpResponse.json({
        payments: [payment(`page-${page}`)],
        total: 20,
        page,
        pageSize: 5,
      });
    }),
  );

  render(<App />);
  await screen.findByText("page-1");

  fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));
  fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));

  expect(await screen.findByText("page-3")).toBeInTheDocument();
  await delay(500);

  expect(screen.queryByText("page-2")).not.toBeInTheDocument();
  expect(screen.getByText("page-3")).toBeInTheDocument();
  expect(screen.getByText(`${I18N.PAGE_LABEL} 3`)).toBeInTheDocument();
});
