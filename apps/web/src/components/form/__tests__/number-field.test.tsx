import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useAppForm } from "@/components/form/hooks/use-app-form";

/**
 * `echo` is what step 2 does with `onValueChange`: take the edit, and write it
 * back itself. Without it the box would never fill, because the field only
 * holds what the handler puts there.
 */
function Harness({
  onValueChange,
  echo = false,
}: {
  onValueChange?: (value: number | null) => void;
  echo?: boolean;
}) {
  const form = useAppForm({ defaultValues: { price: null as number | null } });
  const handleValueChange =
    onValueChange &&
    ((value: number | null) => {
      onValueChange(value);
      if (echo) form.setFieldValue("price", value);
    });

  return (
    <>
      <form.AppField name="price">
        {(field) => (
          <field.NumberField
            label="Cena netto"
            placeholder="0.00"
            required
            onValueChange={handleValueChange}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.price}>
        {(price) => <output>{price === null ? "null" : String(price)}</output>}
      </form.Subscribe>
    </>
  );
}

function input() {
  return screen.getByLabelText("Cena netto");
}

function stored() {
  return screen.getByRole("status").textContent;
}

describe("NumberField", () => {
  it("starts empty rather than at a zero the schema would have to tell apart", () => {
    render(<Harness />);

    expect(input()).toHaveValue(null);
    expect(stored()).toBe("null");
  });

  it("stores a typed number as a number", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(input(), "100");

    expect(stored()).toBe("100");
  });

  it("stores null again when the box is cleared", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(input(), "100");
    await user.clear(input());

    expect(stored()).toBe("null");
  });

  it("hands the edit to onValueChange instead of writing it, when given one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);

    await user.type(input(), "5");

    expect(onValueChange).toHaveBeenCalledWith(5);
    // Step 2's prices rewrite each other, so the whole edit goes through one
    // place — the field does not also write itself.
    expect(stored()).toBe("null");
  });

  it("reports an emptied box to onValueChange as null", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} echo />);

    await user.type(input(), "5");
    await user.clear(input());

    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(stored()).toBe("null");
  });

  it("drops focus on a wheel, so scrolling past cannot rewrite the price", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(input());
    expect(input()).toHaveFocus();

    fireEvent.wheel(input());

    expect(input()).not.toHaveFocus();
  });

  it("leaves precision to the schema rather than to the browser", () => {
    render(<Harness />);

    // `step="0.01"` would have the browser call 19.999 invalid while the
    // schema calls it fine — two authorities on one box.
    expect(input()).toHaveAttribute("step", "any");
    expect(input()).toHaveAttribute("inputmode", "decimal");
  });
});
