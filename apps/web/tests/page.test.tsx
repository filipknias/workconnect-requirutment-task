import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the scaffold smoke page", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "WorkConnect" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open dialog" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
