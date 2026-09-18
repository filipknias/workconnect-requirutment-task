import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Button } from "../src/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../src/components/dialog";

function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Open</Button>} />
      <DialogContent>
        <DialogTitle>Shift details</DialogTitle>
        <DialogDescription>Barista, Kraków — Rynek.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens from its trigger and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Shift details")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
