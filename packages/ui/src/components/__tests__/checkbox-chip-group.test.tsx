import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckboxChipGroup } from "../checkbox-chip-group";

const OPTIONS = [
  { value: "bluetooth", label: "Bluetooth" },
  { value: "wifi", label: "WiFi" },
  { value: "usb-c", label: "USB-C" },
];

function Example({ onChange }: { onChange?: (value: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);

  return (
    <CheckboxChipGroup
      options={OPTIONS}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("CheckboxChipGroup", () => {
  it("renders one checkbox per option", () => {
    render(<Example />);

    expect(screen.getAllByRole("checkbox").map((chip) => chip.textContent)).toEqual([
      "Bluetooth",
      "WiFi",
      "USB-C",
    ]);
    for (const chip of screen.getAllByRole("checkbox")) {
      expect(chip).not.toBeChecked();
    }
  });

  it("lets several be on at once, and turns them off again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Bluetooth" }));
    await user.click(screen.getByRole("checkbox", { name: "USB-C" }));

    expect(screen.getByRole("checkbox", { name: "Bluetooth" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "WiFi" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "USB-C" })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(["bluetooth", "usb-c"]);

    await user.click(screen.getByRole("checkbox", { name: "Bluetooth" }));
    expect(onChange).toHaveBeenLastCalledWith(["usb-c"]);
  });

  it("is operable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Bluetooth" })).toHaveFocus();

    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Bluetooth" })).toBeChecked();
  });
});
