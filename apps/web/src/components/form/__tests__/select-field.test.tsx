import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks/use-app-form";

const MANUFACTURERS = [
  { value: "apple", label: "Apple" },
  { value: "sony", label: "Sony" },
];

const VAT_RATES = [
  { value: 23, label: "23%" },
  { value: 8, label: "8%" },
];

const schema = z.object({
  manufacturer: z.string().min(1, "Producent jest wymagany"),
});

function TextHarness({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  const form = useAppForm({
    defaultValues: { manufacturer: "" },
    validators: { onChange: schema },
  });

  return (
    <>
      <form.AppField name="manufacturer">
        {(field) => (
          <field.SelectField
            label="Producent"
            placeholder="Wybierz producenta"
            options={MANUFACTURERS}
            required
            onValueChange={onValueChange}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.manufacturer}>
        {(value) => <output>{value === "" ? "empty" : value}</output>}
      </form.Subscribe>
    </>
  );
}

/** The one list whose value is arithmetic rather than an identifier. */
function NumberHarness() {
  const form = useAppForm({ defaultValues: { vatRate: 23 } });

  return (
    <>
      <form.AppField name="vatRate">
        {(field) => (
          <field.SelectField label="Stawka VAT" options={VAT_RATES} required />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.vatRate}>
        {(value) => <output>{`${typeof value}:${value}`}</output>}
      </form.Subscribe>
    </>
  );
}

function trigger(name = "Producent") {
  return screen.getByLabelText(name);
}

function stored() {
  return screen.getByRole("status").textContent;
}

/**
 * Base UI opens and closes on its own schedule, so both halves wait for the
 * trigger to say so rather than assuming the click landed.
 */
async function openPopup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(trigger());
  await waitFor(() => expect(trigger()).toHaveAttribute("aria-expanded", "true"));
}

async function closePopup(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(trigger()).toHaveAttribute("aria-expanded", "false"),
  );
}

describe("SelectField", () => {
  it("shows the placeholder while the field holds the empty string", () => {
    render(<TextHarness />);

    // Base UI spells "nothing selected" as null; the form spells it "".
    expect(trigger()).toHaveTextContent("Wybierz producenta");
    expect(stored()).toBe("empty");
    expect(trigger()).toHaveAttribute("aria-required", "true");
  });

  it("stores the option's value and shows its label", async () => {
    const user = userEvent.setup();
    render(<TextHarness />);

    await user.click(trigger());
    await user.click(await screen.findByRole("option", { name: "Sony" }));

    expect(trigger()).toHaveTextContent("Sony");
    expect(stored()).toBe("sony");
  });

  it("keeps a number-valued option a number", async () => {
    const user = userEvent.setup();
    render(<NumberHarness />);

    expect(stored()).toBe("number:23");

    await user.click(trigger("Stawka VAT"));
    await user.click(await screen.findByRole("option", { name: "8%" }));

    expect(stored()).toBe("number:8");
  });

  it("hands the choice to onValueChange instead of writing it, when given one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TextHarness onValueChange={onValueChange} />);

    await user.click(trigger());
    await user.click(await screen.findByRole("option", { name: "Apple" }));

    expect(onValueChange).toHaveBeenCalledWith("apple");
    expect(stored()).toBe("empty");
  });

  it("waits for the popup to close before it complains", async () => {
    const user = userEvent.setup();
    render(<TextHarness />);

    // Opening the popup moves focus off the trigger, so a blur rule would
    // flash a message while the list is still open.
    await openPopup(user);
    expect(screen.queryByText("Producent jest wymagany")).not.toBeInTheDocument();

    await closePopup(user);

    expect(screen.getByText("Producent jest wymagany")).toBeInTheDocument();
    expect(trigger()).toHaveAttribute("aria-invalid", "true");
    expect(trigger().className).toContain("aria-invalid:border-destructive");
  });

  it("clears the message the moment something is picked", async () => {
    const user = userEvent.setup();
    render(<TextHarness />);

    await openPopup(user);
    await closePopup(user);
    expect(screen.getByText("Producent jest wymagany")).toBeInTheDocument();

    await user.click(trigger());
    await user.click(await screen.findByRole("option", { name: "Apple" }));

    expect(
      screen.queryByText("Producent jest wymagany"),
    ).not.toBeInTheDocument();
    expect(trigger()).not.toHaveAttribute("aria-invalid");
  });
});
