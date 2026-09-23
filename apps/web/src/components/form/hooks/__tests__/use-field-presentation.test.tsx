import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { useFieldContext } from "@/components/form/context/field-context";
import { useAppForm } from "@/components/form/hooks/use-app-form";
import {
  useFieldPresentation,
  type RevealErrorsOn,
} from "@/components/form/hooks/use-field-presentation";

/**
 * The smallest control the hook can dress: it supplies the ids, the message
 * and the blur handler, and this does nothing but hang them on an input. Every
 * bound field in `../` is this plus its own markup, so the rule is tested once
 * here rather than five times over.
 */
function Probe({ revealOn }: { revealOn: RevealErrorsOn }) {
  const field = useFieldContext<string>();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation(revealOn);

  return (
    <div>
      <label htmlFor={id}>Pole</label>
      <input
        id={id}
        value={field.state.value}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={handleBlur}
      />
      <p id={errorId}>{error}</p>
    </div>
  );
}

const schema = z.object({
  pole: z.string().min(3, "Za krótkie"),
});

function Harness({ revealOn }: { revealOn: RevealErrorsOn }) {
  const form = useAppForm({
    defaultValues: { pole: "" },
    validators: { onChange: schema },
  });

  return (
    <form.AppField name="pole">{() => <Probe revealOn={revealOn} />}</form.AppField>
  );
}

function probe() {
  return screen.getByLabelText("Pole");
}

describe("useFieldPresentation", () => {
  it("ties the label, the control and the message together", () => {
    render(<Harness revealOn="blur" />);

    // The label resolves to the control at all, which is the id contract.
    expect(probe()).toBeInTheDocument();
    expect(probe()).not.toHaveAttribute("aria-describedby");
  });

  it("stays quiet under 'blur' until the field has been left once", async () => {
    const user = userEvent.setup();
    render(<Harness revealOn="blur" />);

    await user.type(probe(), "ab");

    expect(screen.queryByText("Za krótkie")).not.toBeInTheDocument();
    expect(probe()).not.toHaveAttribute("aria-invalid");

    await user.tab();

    expect(screen.getByText("Za krótkie")).toBeInTheDocument();
    expect(probe()).toHaveAttribute("aria-invalid", "true");
    expect(probe()).toHaveAccessibleDescription("Za krótkie");
  });

  it("tracks the value live once it has spoken, without waiting for another blur", async () => {
    const user = userEvent.setup();
    render(<Harness revealOn="blur" />);

    await user.type(probe(), "ab");
    await user.tab();
    expect(screen.getByText("Za krótkie")).toBeInTheDocument();

    // Straight back in and fixed. TanStack keeps one error per cause, so a
    // message produced by a `blur` validator would sit there until the next
    // blur — this is what proves the re-run happens under `change`.
    await user.type(probe(), "c");

    expect(screen.queryByText("Za krótkie")).not.toBeInTheDocument();
    expect(probe()).not.toHaveAttribute("aria-invalid");
  });

  it("explains a required field left untouched, as soon as it is left", async () => {
    const user = userEvent.setup();
    render(<Harness revealOn="blur" />);

    probe().focus();
    await user.tab();

    expect(screen.getByText("Za krótkie")).toBeInTheDocument();
  });

  it("waits for a touch rather than a blur under 'touch'", async () => {
    const user = userEvent.setup();
    render(<Harness revealOn="touch" />);

    expect(screen.queryByText("Za krótkie")).not.toBeInTheDocument();

    // A select moves focus into its popup and a chip group is a row of
    // separate boxes, so neither has a blur worth waiting for.
    await user.type(probe(), "a");

    expect(screen.getByText("Za krótkie")).toBeInTheDocument();
  });

  it("points at the message only while there is one", async () => {
    const user = userEvent.setup();
    render(<Harness revealOn="blur" />);

    probe().focus();
    await user.tab();
    const describedBy = probe().getAttribute("aria-describedby");
    expect(describedBy).not.toBeNull();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Za krótkie");

    await user.type(probe(), "abc");
    expect(probe()).not.toHaveAttribute("aria-describedby");
  });
});
