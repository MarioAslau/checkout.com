import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { expect, test } from "vitest";
import App from "./App";
import { I18N } from "./constants/i18n";
import { renderWithProviders } from "./test/renderWithProviders";

test("renders the app title", () => {
  renderWithProviders(<App />);

  expect(
    screen.getByRole("heading", { name: I18N.APP_TITLE }),
  ).toBeInTheDocument();
});
