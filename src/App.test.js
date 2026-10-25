import React from "react";
import { render, screen } from "@testing-library/react";

import App from "./App";

test("renders the G5 playground", () => {
  render(<App />);

  expect(screen.getByText("Garmin G5")).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "G5 knob" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Power" })).toBeInTheDocument();
});

test("the instrument powers up into the alignment sequence", () => {
  render(<App />);

  // Both the bezel and the power-up splash carry the Garmin name.
  expect(screen.getAllByText("GARMIN")).toHaveLength(2);
});
