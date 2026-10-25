import React from "react";
import { render, screen } from "@testing-library/react";

import App from "./App";

test("renders the G5 playground", () => {
  render(<App />);

  expect(screen.getByText("Garmin G5")).toBeInTheDocument();
  expect(screen.getByText("GARMIN")).toBeInTheDocument();
});
