import { format } from "date-fns";
import { expect, test } from "vitest";
import { formatAmount, formatDate } from "./format";

test("formats amounts with two decimal places", () => {
  expect(formatAmount(250)).toBe("250.00");
  expect(formatAmount(150.5)).toBe("150.50");
  expect(formatAmount(85.25)).toBe("85.25");
});

test("formats dates the same way as the scoring helper", () => {
  const iso = "2024-04-15T10:00:00Z";

  expect(formatDate(iso)).toBe(format(new Date(iso), "dd/MM/yyyy, HH:mm:ss"));
});
