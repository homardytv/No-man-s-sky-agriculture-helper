// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./main";

describe("Crop Atlas interface", () => {
  afterEach(cleanup);

  it("shows the default Living Glass calculation", () => {
    render(<App />);
    expect(screen.getByText("Crop requirements")).toBeInTheDocument();
    expect(screen.getAllByText("566,000")).toHaveLength(2);
  });

  it("reports an invalid harvest quantity", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Harvest quantity"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /calculate harvest/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Quantity must be a positive whole number.");
  });

  it("hides hydroponic construction costs and counts plants instead", async () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText("Hydroponic Tray"));
    await waitFor(() => expect(screen.getByText("Plants to plant")).toBeInTheDocument());
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.queryByText("Hydroponic Tray materials")).not.toBeInTheDocument();
  });
});
