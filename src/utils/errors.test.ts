import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { expect, test } from "vitest";
import { I18N } from "../constants/i18n";
import { getErrorMessage } from "./errors";

test("maps each error shape to the right message", () => {
  const notFound: FetchBaseQueryError = { status: 404, data: undefined };
  const serverError: FetchBaseQueryError = { status: 500, data: undefined };
  const unavailable: FetchBaseQueryError = { status: 503, data: undefined };
  const unauthorized: FetchBaseQueryError = { status: 401, data: undefined };
  const network: FetchBaseQueryError = {
    status: "FETCH_ERROR",
    error: "failed to fetch",
  };
  const serialized: SerializedError = { message: "something broke" };

  expect(getErrorMessage(notFound)).toBe(I18N.PAYMENT_NOT_FOUND);
  expect(getErrorMessage(serverError)).toBe(I18N.INTERNAL_SERVER_ERROR);
  expect(getErrorMessage(unavailable)).toBe(I18N.INTERNAL_SERVER_ERROR);
  expect(getErrorMessage(unauthorized)).toBe(I18N.SOMETHING_WENT_WRONG);
  expect(getErrorMessage(network)).toBe(I18N.SOMETHING_WENT_WRONG);
  expect(getErrorMessage(serialized)).toBe(I18N.SOMETHING_WENT_WRONG);
});
