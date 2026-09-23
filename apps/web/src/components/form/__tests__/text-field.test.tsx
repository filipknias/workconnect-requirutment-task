import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks/use-app-form";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nazwa jest wymagana")
    .min(3, "Nazwa musi mieć co najmniej 3 znaki"),
});

function Harness({ onState = vi.fn() }: { onState?: (value: string) => void }) {
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: { onChange: schema },
  });

  return (
    <>
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Nazwa produktu"
            placeholder="np. MacBook Pro 14"
            autoComplete="off"
            required
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.name}>
        {(name) => {
          onState(name);
          return <output>{name}</output>;
        }}
      </form.Subscribe>
    </>
  );
}

function input() {
  return screen.getByLabelText("Nazwa produktu");
}

describe("TextField", () => {
  it("passes the call site's copy straight through", () => {
    render(<Harness />);

    expect(input()).toHaveAttribute("placeholder", "np. MacBook Pro 14");
    expect(input()).toHaveAttribute("autocomplete", "off");
    expect(input()).toBeRequired();
  });

  it("writes what is typed to the field", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(input(), "MacBook");

    expect(input()).toHaveValue("MacBook");
    expect(screen.getByRole("status")).toHaveTextContent("MacBook");
  });

  it("names the message as the input's description, by id", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    input().focus();
    await user.tab();

    const message = screen.getByText("Nazwa jest wymagana");
    expect(message.id).not.toBe("");
    expect(input()).toHaveAttribute("aria-describedby", message.id);
    expect(input()).toHaveAttribute("aria-invalid", "true");
  });

  it("turns its border red while it is complaining, and nothing else", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    input().focus();
    await user.tab();

    // A ring would read as the field having grown inside the wizard's grids.
    expect(input().className).toContain("aria-invalid:border-destructive");
    expect(input().className).not.toContain("aria-invalid:ring");
  });

  it("does not cap what can be typed — the message says the limit instead", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(input(), "x".repeat(40));

    expect(input()).not.toHaveAttribute("maxlength");
    expect(input()).toHaveValue("x".repeat(40));
  });
});
