import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../src/components/switch";

function Controlled({ onCheckedChange = vi.fn() }) {
  const [checked, setChecked] = useState(true);

  return (
    <>
      <Switch
        id="available"
        checked={checked}
        onCheckedChange={(next) => {
          setChecked(next);
          onCheckedChange(next);
        }}
      />
      <label htmlFor="available">Produkt jest dostępny</label>
    </>
  );
}

function toggle() {
  return screen.getByRole("switch", { name: "Produkt jest dostępny" });
}

describe("Switch", () => {
  it("is a switch its label names, honouring the value it was handed", () => {
    render(<Controlled />);

    expect(toggle()).toBeChecked();
    expect(toggle()).toHaveAttribute("data-slot", "switch");
  });

  it("reports both directions of a click", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Controlled onCheckedChange={onCheckedChange} />);

    await user.click(toggle());
    expect(toggle()).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);

    await user.click(toggle());
    expect(toggle()).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("answers the space bar, like a native one", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    toggle().focus();
    await user.keyboard(" ");

    expect(toggle()).not.toBeChecked();
  });

  it("moves its thumb with the state, so the two cannot disagree", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlled />);
    const thumb = () => container.querySelector("[data-slot=switch-thumb]")!;

    expect(thumb()).toHaveAttribute("data-checked");

    await user.click(toggle());

    expect(thumb()).toHaveAttribute("data-unchecked");
  });

  it("comes in the two sizes the tokens are written for", () => {
    const { rerender } = render(<Switch aria-label="Rozmiar" />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-size", "default");

    rerender(<Switch size="sm" aria-label="Rozmiar" />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-size", "sm");
  });
});
