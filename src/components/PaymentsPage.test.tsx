import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
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
