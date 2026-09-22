import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../src/components/checkbox";

function Controlled({ onCheckedChange = vi.fn() }) {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Checkbox
        id="limited"
        checked={checked}
        onCheckedChange={(next) => {
          setChecked(next);
          onCheckedChange(next);
        }}
      />
      <label htmlFor="limited">Produkt limitowany</label>
    </>
  );
}

function box() {
  return screen.getByRole("checkbox", { name: "Produkt limitowany" });
}

describe("Checkbox", () => {
  it("is a checkbox its label names", () => {
    render(<Controlled />);

    expect(box()).toBeInTheDocument();
    expect(box()).not.toBeChecked();
    expect(box()).toHaveAttribute("data-slot", "checkbox");
  });

  it("reports both directions of a click", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Controlled onCheckedChange={onCheckedChange} />);

    await user.click(box());
    expect(box()).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.click(box());
    expect(box()).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("answers the space bar, like a native one", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    box().focus();
    await user.keyboard(" ");

    expect(box()).toBeChecked();
  });

  it("shows the tick only while it is on", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlled />);
    const indicator = () =>
      container.querySelector("[data-slot=checkbox-indicator]");

    expect(indicator()).toBeNull();

    await user.click(box());

    expect(indicator()).not.toBeNull();
  });

  it("refuses the click when it is disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <>
        <Checkbox id="off" disabled onCheckedChange={onCheckedChange} />
        <label htmlFor="off">Wyłączony</label>
      </>,
    );

    await user.click(screen.getByRole("checkbox", { name: "Wyłączony" }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
