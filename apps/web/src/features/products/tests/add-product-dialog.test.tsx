import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AddProductDialog } from "@/features/products/components/add-product-dialog";

function open() {
  return userEvent.setup();
}

async function openDialog(user: ReturnType<typeof open>) {
  await user.click(screen.getByRole("button", { name: "Dodaj produkt" }));
  return screen.getByRole("dialog");
}

describe("AddProductDialog", () => {
  it("opens from the trigger onto step one", async () => {
    const user = open();
    render(<AddProductDialog />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const dialog = await openDialog(user);

    expect(within(dialog).getByText("Dodaj nowy produkt")).toBeInTheDocument();
    const current = within(dialog)
      .getAllByRole("listitem")
      .filter((step) => step.getAttribute("aria-current") === "step");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Informacje");
  });

  it("renders the step-one fields the frame draws", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    expect(screen.getByLabelText("Nazwa produktu")).toHaveAttribute(
      "placeholder",
      "np. MacBook Pro 14",
    );
    expect(screen.getByLabelText("SKU produktu")).toHaveAttribute(
      "placeholder",
      "np. MBP14M3PRO",
    );
    // Deliberately not the frame's duplicated "Nazwa produktu".
    expect(screen.getByLabelText("Opis produktu")).toHaveAttribute(
      "placeholder",
      "Krótki opis produktu",
    );
    expect(screen.getByLabelText("Producent")).toBeInTheDocument();
    expect(screen.getByLabelText("Kategoria")).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "Cechy produktu" }))
        .getAllByRole("checkbox")
        .map((chip) => chip.textContent),
    ).toEqual([
      "Bluetooth",
      "WiFi",
      "USB-C",
      "Wodoodporny",
      "Bezprzewodowy",
      "Ekologiczny",
      "Premium",
    ]);
  });

  it("stays quiet while a field is being typed into, then explains on blur", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const name = screen.getByLabelText("Nazwa produktu");
    await user.type(name, "ab");

    expect(
      screen.queryByText("Nazwa musi mieć co najmniej 3 znaki"),
    ).not.toBeInTheDocument();
    expect(name).not.toHaveAttribute("aria-invalid");

    await user.tab();

    expect(
      screen.getByText("Nazwa musi mieć co najmniej 3 znaki"),
    ).toBeInTheDocument();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription(
      "Nazwa musi mieć co najmniej 3 znaki",
    );
  });

  it("clears the message as soon as the field is fixed, without waiting for another blur", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const sku = screen.getByLabelText("SKU produktu");
    await user.type(sku, "MBP-14");
    await user.tab();
    expect(
      screen.getByText("SKU może zawierać tylko litery i cyfry"),
    ).toBeInTheDocument();

    await user.clear(sku);
    await user.type(sku, "MBP14");

    expect(
      screen.queryByText("SKU może zawierać tylko litery i cyfry"),
    ).not.toBeInTheDocument();
    expect(sku).not.toHaveAttribute("aria-invalid");
  });

  it("keeps SKU exactly as it was typed", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const sku = screen.getByLabelText("SKU produktu");
    await user.type(sku, "mbp14m3pro");

    expect(sku).toHaveValue("mbp14m3pro");
  });

  it("picks a manufacturer from the dropdown", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const trigger = screen.getByLabelText("Producent");
    expect(trigger).toHaveTextContent("Wybierz producenta");

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "Sony" }));

    expect(trigger).toHaveTextContent("Sony");
  });

  it("toggles feature chips on and off", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const bluetooth = screen.getByRole("checkbox", { name: "Bluetooth" });
    const wifi = screen.getByRole("checkbox", { name: "WiFi" });

    await user.click(bluetooth);
    await user.click(wifi);
    expect(bluetooth).toBeChecked();
    expect(wifi).toBeChecked();

    await user.click(bluetooth);
    expect(bluetooth).not.toBeChecked();
    expect(wifi).toBeChecked();
  });

  it("complains once every chip is turned back off", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const bluetooth = screen.getByRole("checkbox", { name: "Bluetooth" });
    await user.click(bluetooth);
    expect(
      screen.queryByText("Wybierz co najmniej jedną cechę produktu"),
    ).not.toBeInTheDocument();

    await user.click(bluetooth);
    expect(
      screen.getByText("Wybierz co najmniej jedną cechę produktu"),
    ).toBeInTheDocument();
  });

  it("starts over when it is closed and reopened", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    await user.type(screen.getByLabelText("Nazwa produktu"), "MacBook Pro 14");
    await user.type(screen.getByLabelText("SKU produktu"), "MBP14M3PRO");
    await user.type(screen.getByLabelText(/Opis produktu/), "Krótki opis");
    await user.click(screen.getByLabelText("Kategoria"));
    await user.click(await screen.findByRole("option", { name: "Komputery" }));
    await user.click(screen.getByRole("checkbox", { name: "Bluetooth" }));

    await user.click(screen.getByRole("button", { name: "Zamknij" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openDialog(user);

    expect(screen.getByLabelText("Nazwa produktu")).toHaveValue("");
    expect(screen.getByLabelText("SKU produktu")).toHaveValue("");
    expect(screen.getByLabelText(/Opis produktu/)).toHaveValue("");
    expect(screen.getByLabelText("Kategoria")).toHaveTextContent(
      "Wybierz kategorię",
    );
    expect(
      screen.getByRole("checkbox", { name: "Bluetooth" }),
    ).not.toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("closes on Escape but not on a backdrop click", async () => {
    const user = open();
    render(<AddProductDialog />);
    const dialog = await openDialog(user);

    await user.click(document.querySelector("[data-slot=dialog-overlay]")!);
    expect(screen.getByRole("dialog")).toBe(dialog);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("puts the close button first in the tab order", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    // It is rendered before the fields, so it is where entry focus lands and
    // the first thing a keyboard user meets — unlike the shared DialogContent's
    // own close button, which sits after the children and is the last stop.
    expect(screen.getByRole("button", { name: "Zamknij" })).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText("Nazwa produktu")).toHaveFocus();
  });

  it("returns focus to the trigger when it closes", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Dodaj produkt" })).toHaveFocus();
  });

  it("marks the required fields as required, and the optional one as not", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    expect(screen.getByLabelText("Nazwa produktu")).toBeRequired();
    expect(screen.getByLabelText("SKU produktu")).toBeRequired();
    expect(screen.getByLabelText("Opis produktu")).not.toBeRequired();
    expect(screen.getByLabelText("Producent")).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByLabelText("Kategoria")).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("explains a required field left empty, without waiting for anything to be typed", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const name = screen.getByLabelText("Nazwa produktu");
    name.focus();
    await user.tab();

    expect(
      screen.getByText("Nazwa produktu jest wymagana"),
    ).toBeInTheDocument();
  });

  it("leaves Dalej inert but reachable", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const dalej = screen.getByRole("button", { name: "Dalej" });
    expect(dalej).toHaveAttribute("aria-disabled", "true");
    expect(dalej).not.toBeDisabled();

    dalej.focus();
    expect(dalej).toHaveFocus();

    // Clicking it does nothing — still step one, still open.
    await user.click(dalej);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("listitem")
        .filter((step) => step.getAttribute("aria-current") === "step")[0],
    ).toHaveTextContent("Informacje");
  });
});
