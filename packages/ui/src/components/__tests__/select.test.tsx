import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

const OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "sony", label: "Sony" },
];

function Controlled({ onValueChange = vi.fn() }) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select
      items={OPTIONS}
      value={value}
      onValueChange={(next: string | null) => {
        setValue(next);
        onValueChange(next);
      }}
    >
      <SelectTrigger id="manufacturer" aria-label="Producent">
        <SelectValue placeholder="Wybierz producenta" />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function trigger() {
  return screen.getByLabelText("Producent");
}

async function openPopup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(trigger());
  await waitFor(() => expect(trigger()).toHaveAttribute("aria-expanded", "true"));
}

describe("Select", () => {
  it("shows the placeholder while nothing is chosen", () => {
    render(<Controlled />);

    expect(trigger()).toHaveTextContent("Wybierz producenta");
    // What the muted placeholder colour hangs off.
    expect(trigger()).toHaveAttribute("data-placeholder");
  });

  it("opens onto the options and shows the one that is picked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);

    await openPopup(user);
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Apple", "Sony"]);

    await user.click(screen.getByRole("option", { name: "Sony" }));

    expect(onValueChange).toHaveBeenCalledWith("sony");
    await waitFor(() => expect(trigger()).toHaveTextContent("Sony"));
    expect(trigger()).not.toHaveAttribute("data-placeholder");
  });

  it("marks the chosen option as selected, and only that one", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await openPopup(user);
    await user.click(screen.getByRole("option", { name: "Apple" }));
    await openPopup(user);

    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Sony" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("closes on Escape without choosing anything", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);

    await openPopup(user);
    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(trigger()).toHaveAttribute("aria-expanded", "false"),
    );
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveTextContent("Wybierz producenta");
  });

  it("is a combobox that says it opens a listbox", () => {
    render(<Controlled />);

    expect(trigger()).toHaveAttribute("role", "combobox");
    expect(trigger()).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger()).toHaveAttribute("data-slot", "select-trigger");
  });

  it("comes in the two trigger sizes the tokens are written for", () => {
    const { rerender } = render(<Controlled />);
    expect(trigger()).toHaveAttribute("data-size", "default");

    rerender(
      <Select items={OPTIONS}>
        <SelectTrigger size="sm" aria-label="Producent">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    expect(trigger()).toHaveAttribute("data-size", "sm");
  });
});
