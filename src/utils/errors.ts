import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { I18N } from "../constants/i18n";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return isRecord(error) && "status" in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return (
    isRecord(error) &&
    !("status" in error) &&
    ("message" in error || "name" in error || "code" in error)
  );
}

export function getErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    if (error.status === 404) {
      return I18N.PAYMENT_NOT_FOUND;
    }

    if (typeof error.status === "number" && error.status >= 500) {
      return I18N.INTERNAL_SERVER_ERROR;
    }

    return I18N.SOMETHING_WENT_WRONG;
  }

  if (isSerializedError(error)) {
    return I18N.SOMETHING_WENT_WRONG;
  }

  return I18N.SOMETHING_WENT_WRONG;
}
