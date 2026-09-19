import { act } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Toaster, createToastManager } from "../src/components/toast";

/**
 * A toast has no close button, so the whole toast is the dismiss target. A
 * fresh manager per test rather than the module-level one, which would carry
 * a toast from one test into the next.
 */
function showToast() {
  const manager = createToastManager();
  render(<Toaster toastManager={manager} />);

  act(() => {
    manager.add({ title: "Produkt został dodany", type: "success" });
  });

  return manager;
}

describe("Toast", () => {
  it("closes when it is clicked", async () => {
    const user = userEvent.setup();
    showToast();

    const toast = await screen.findByRole("dialog");
    expect(within(toast).getByText("Produkt został dodany")).toBeInTheDocument();

    await user.click(toast);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
