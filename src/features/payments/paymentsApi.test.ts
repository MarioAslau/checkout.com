import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "../../mocks/handlers";
import { makeStore } from "../../store/store";
import { paymentsApi } from "./paymentsApi";

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("an empty search omits search and currency from the request URL", async () => {
  let requestUrl = "";

  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/api/payments")) {
      requestUrl = request.url;
    }
  });

  const store = makeStore();
  const request = store.dispatch(
    paymentsApi.endpoints.getPayments.initiate({ page: 1, pageSize: 5 }),
  );

  await request;
  request.unsubscribe();

  const url = new URL(requestUrl);
  expect(url.origin).toBe(window.location.origin);
  expect(url.pathname.endsWith("/api/payments")).toBe(true);
  expect(url.searchParams.get("page")).toBe("1");
  expect(url.searchParams.get("pageSize")).toBe("5");
  expect(url.searchParams.has("search")).toBe(false);
  expect(url.searchParams.has("currency")).toBe(false);
});
