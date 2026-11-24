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
