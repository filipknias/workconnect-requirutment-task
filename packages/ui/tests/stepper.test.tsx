import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stepper } from "../src/components/stepper";

const STEPS = [
  { title: "Informacje", description: "Dane podstawowe" },
  { title: "Cena", description: "Dane cenowe" },
  { title: "Dostępność", description: "Stany magazynowe" },
];

describe("Stepper", () => {
  it("renders the steps in order as a list", () => {
    render(<Stepper steps={STEPS} currentStep={1} aria-label="Postęp" />);

    const items = within(screen.getByRole("list", { name: "Postęp" })).getAllByRole(
      "listitem",
    );
    expect(items.map((item) => item.textContent)).toEqual([
      "1InformacjeDane podstawowe",
      "2CenaDane cenowe",
      "3DostępnośćStany magazynowe",
    ]);
  });

  it("hides the numerals and the connectors from assistive technology", () => {
    render(<Stepper steps={STEPS} currentStep={1} />);

    // The list already conveys position, so the drawn numeral is decoration.
    for (const numeral of ["1", "2", "3"]) {
      expect(screen.getByText(numeral).closest("[aria-hidden]")).not.toBeNull();
    }
  });

  it("marks exactly one step as current", () => {
    const { rerender } = render(<Stepper steps={STEPS} currentStep={1} />);

    const current = () =>
      screen
        .getAllByRole("listitem")
        .filter((item) => item.getAttribute("aria-current") === "step");

    expect(current()).toHaveLength(1);
    expect(current()[0]).toHaveTextContent("Informacje");

    rerender(<Stepper steps={STEPS} currentStep={2} />);
    expect(current()).toHaveLength(1);
    expect(current()[0]).toHaveTextContent("Cena");
  });

  it("says which steps are behind the current one", () => {
    render(<Stepper steps={STEPS} currentStep={2} />);

    const items = screen.getAllByRole("listitem");
    // The checkmark replaces the numeral and is aria-hidden like it, so the
    // label is what has to carry "done" — otherwise a finished step and an
    // untouched one read identically.
    expect(items[0]).toHaveTextContent("Ukończony");
    expect(items[1]).not.toHaveTextContent("Ukończony");
    expect(items[2]).not.toHaveTextContent("Ukończony");
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("offers nothing to click or tab to", () => {
    render(<Stepper steps={STEPS} currentStep={1} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(document.querySelectorAll("[tabindex]")).toHaveLength(0);
  });
});
