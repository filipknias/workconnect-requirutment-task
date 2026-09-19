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

/**
 * A filled-in step one. The chip is not part of what "Dalej" waits for — the
 * features are optional — but it is ticked here so the step-2 tests carry a
 * value across the step boundary and back.
 */
async function fillStepOne(user: ReturnType<typeof open>) {
  await user.type(screen.getByLabelText("Nazwa produktu"), "MacBook Pro 14");
  await user.type(screen.getByLabelText("SKU produktu"), "MBP14M3PRO");
  await user.click(screen.getByLabelText("Producent"));
  await user.click(await screen.findByRole("option", { name: "Apple" }));
  await user.click(screen.getByLabelText("Kategoria"));
  await user.click(await screen.findByRole("option", { name: "Komputery" }));
  await user.click(screen.getByRole("checkbox", { name: "Bluetooth" }));
}

async function goToStepTwo(user: ReturnType<typeof open>) {
  await fillStepOne(user);
  await user.click(screen.getByRole("button", { name: "Dalej" }));
}

/** The step the stepper is showing as in progress. */
function currentStep() {
  return screen
    .getAllByRole("listitem")
    .filter((step) => step.getAttribute("aria-current") === "step")[0];
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

  it("says nothing when every chip is turned back off", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    const bluetooth = screen.getByRole("checkbox", { name: "Bluetooth" });
    await user.click(bluetooth);
    await user.click(bluetooth);

    expect(bluetooth).not.toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("lets step one through with no chip ticked at all", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    await fillStepOne(user);
    await user.click(screen.getByRole("checkbox", { name: "Bluetooth" }));

    expect(screen.getByRole("checkbox", { name: "Bluetooth" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Dalej" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
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

  it("keeps Dalej inert while step one is incomplete", async () => {
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
    expect(currentStep()).toHaveTextContent("Informacje");
  });

  it("keeps Dalej inert while step one is only half filled", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    await user.type(screen.getByLabelText("Nazwa produktu"), "MacBook Pro 14");
    await user.type(screen.getByLabelText("SKU produktu"), "MBP14M3PRO");

    expect(screen.getByRole("button", { name: "Dalej" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("lights Dalej up once step one validates, and not before", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    await fillStepOne(user);

    // Base UI keeps the attribute and flips it, rather than dropping it.
    expect(screen.getByRole("button", { name: "Dalej" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });

  it("goes on to step two, and says step one is done", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    await goToStepTwo(user);

    expect(currentStep()).toHaveTextContent("Cena");
    // The circle that turns into a checkmark is aria-hidden, so this is the
    // only thing that tells a screen reader step one is behind us.
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Ukończony");
    expect(screen.queryByLabelText("Nazwa produktu")).not.toBeInTheDocument();
  });

  it("renders the step-two fields the frame draws", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    expect(screen.getByLabelText("Cena netto")).toHaveAttribute(
      "placeholder",
      "0.00",
    );
    expect(screen.getByLabelText("Cena brutto")).toHaveAttribute(
      "placeholder",
      "0.00",
    );
    // Both start empty, and empty means empty — not a zero the schema would
    // have to tell apart from a typed one.
    expect(screen.getByLabelText("Cena netto")).toHaveValue(null);
    expect(screen.getByLabelText("Cena brutto")).toHaveValue(null);
    // Filled in the frame, so they are defaults rather than placeholders.
    expect(screen.getByLabelText("Stawka VAT")).toHaveTextContent("23%");
    expect(screen.getByLabelText("Waluta")).toHaveTextContent("PLN");
  });

  it("fills in the gross price as the net one is typed", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    await user.type(screen.getByLabelText("Cena netto"), "100");

    expect(screen.getByLabelText("Cena brutto")).toHaveValue(123);
  });

  it("works backwards from the gross price too", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    await user.type(screen.getByLabelText("Cena brutto"), "123");

    expect(screen.getByLabelText("Cena netto")).toHaveValue(100);
  });

  it("recalculates both prices when the VAT rate changes", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    await user.type(screen.getByLabelText("Cena netto"), "100");
    await user.click(screen.getByLabelText("Stawka VAT"));
    await user.click(await screen.findByRole("option", { name: "8%" }));

    expect(screen.getByLabelText("Cena netto")).toHaveValue(100);
    expect(screen.getByLabelText("Cena brutto")).toHaveValue(108);
  });

  it("empties one price when the other is cleared", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    await user.type(screen.getByLabelText("Cena netto"), "100");
    await user.clear(screen.getByLabelText("Cena netto"));

    expect(screen.getByLabelText("Cena brutto")).toHaveValue(null);
  });

  it("complains about a price left empty, and about a zero", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    screen.getByLabelText("Cena netto").focus();
    await user.tab();
    expect(screen.getByText("Cena netto jest wymagana")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Cena netto"), "0");
    expect(
      screen.getByText("Cena netto musi być większa od zera"),
    ).toBeInTheDocument();
  });

  it("keeps what was typed when Wstecz goes back", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    await user.type(screen.getByLabelText("Cena netto"), "100");
    await user.click(screen.getByRole("button", { name: "Wstecz" }));

    expect(currentStep()).toHaveTextContent("Informacje");
    expect(screen.getByLabelText("Nazwa produktu")).toHaveValue(
      "MacBook Pro 14",
    );
    expect(screen.getByLabelText("Kategoria")).toHaveTextContent("Komputery");
    expect(screen.getByRole("checkbox", { name: "Bluetooth" })).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Dalej" }));
    expect(screen.getByLabelText("Cena netto")).toHaveValue(100);
    expect(screen.getByLabelText("Cena brutto")).toHaveValue(123);
  });

  it("has no Wstecz on step one", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);

    expect(
      screen.queryByRole("button", { name: "Wstecz" }),
    ).not.toBeInTheDocument();
  });

  it("leaves step two's Dalej inert, however complete the prices are", async () => {
    const user = open();
    render(<AddProductDialog />);
    await openDialog(user);
    await goToStepTwo(user);

    await user.type(screen.getByLabelText("Cena netto"), "100");

    // Step three has no panel to go to. An enabled button that ignores the
    // click would be worse than one that says it is not ready.
    const dalej = screen.getByRole("button", { name: "Dalej" });
    expect(dalej).toHaveAttribute("aria-disabled", "true");
    expect(dalej).not.toBeDisabled();

    await user.click(dalej);
    expect(currentStep()).toHaveTextContent("Cena");
  });
});
