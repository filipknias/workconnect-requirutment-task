import { act } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Toaster, createToastManager } from "../toast";

// A fresh manager per test: the module-level one carries toasts between tests.
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
