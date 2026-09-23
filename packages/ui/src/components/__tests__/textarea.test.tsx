import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("is a plain textarea the caller's props reach", () => {
    render(
      <Textarea
        aria-label="Opis produktu"
        placeholder="Krótki opis produktu"
        rows={3}
      />,
    );

    const field = screen.getByLabelText("Opis produktu");
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("rows", "3");
    expect(field).toHaveAttribute("placeholder", "Krótki opis produktu");
    expect(field).toHaveAttribute("data-slot", "textarea");
  });

  it("takes what is typed", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Opis" />);

    await user.type(screen.getByLabelText("Opis"), "Laptop z ekranem XDR");

    expect(screen.getByLabelText("Opis")).toHaveValue("Laptop z ekranem XDR");
  });

  it("grows with its content unless a caller says otherwise", () => {
    const { rerender } = render(<Textarea aria-label="Opis" />);
    expect(screen.getByLabelText("Opis").className).toContain(
      "field-sizing-content",
    );

    // The wizard pins it: a box that grows as the description is typed would
    // push the dialog's footer around.
    rerender(<Textarea aria-label="Opis" className="field-sizing-fixed resize-y" />);
    expect(screen.getByLabelText("Opis").className).toContain(
      "field-sizing-fixed",
    );
  });
});
