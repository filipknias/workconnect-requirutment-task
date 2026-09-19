import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "@repo/ui/components/toast";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import { ProductsCatalogue } from "@/features/products/components/products-catalogue";
import { PRODUCTS } from "@/features/products/data/products";

/**
 * The catalogue end to end: the wizard fills in, the row lands, the count and
 * the caption move with it.
 *
 * `hasMemory` makes the testing adapter behave like a real one — it keeps what
 * the setter writes, which is what "jump back to page one" needs to be visible
 * here. `Toaster` is mounted for the same reason it is in the root layout:
 * `toast.add` only reaches a provider that is listening.
 */
function renderCatalogue(searchParams: Record<string, string> = {}) {
  return render(<ProductsCatalogue initialProducts={PRODUCTS} />, {
    wrapper: ({ children }) => (
      <NuqsTestingAdapter searchParams={searchParams} hasMemory>
        <Toaster>{children}</Toaster>
      </NuqsTestingAdapter>
    ),
  });
}

/** The desktop table; the mobile cards render beside it and CSS picks one. */
function table() {
  return screen.getByRole("table");
}

/** A filled-in wizard, all the way to a clickable "Zapisz produkt". */
async function fillWizard(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Dodaj produkt" }));

  await user.type(screen.getByLabelText("Nazwa produktu"), "Pixel 9 Pro");
  await user.type(screen.getByLabelText("SKU produktu"), "PX9PRO256");
  await user.click(screen.getByLabelText("Producent"));
  await user.click(await screen.findByRole("option", { name: "Samsung" }));
  await user.click(screen.getByLabelText("Kategoria"));
  await user.click(await screen.findByRole("option", { name: "Telefony" }));
  await user.click(screen.getByRole("button", { name: "Dalej" }));

  await user.type(screen.getByLabelText("Cena netto"), "4065.04");
  await user.click(screen.getByRole("button", { name: "Dalej" }));
}

describe("ProductsCatalogue", () => {
  it("renders the seeded catalogue", () => {
    renderCatalogue();

    expect(screen.getByText("7 produktów w katalogu")).toBeInTheDocument();
    expect(screen.getAllByText('MacBook Pro 14"')).toHaveLength(2);
  });

  it("puts a saved product at the top of page one and counts it", async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await fillWizard(user);
    await user.click(screen.getByRole("button", { name: "Zapisz produkt" }));

    const rows = within(table()).getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Pixel 9 Pro");
    expect(rows[0]).toHaveTextContent("PX9PRO256");
    // The slug went in; the label comes out.
    expect(rows[0]).toHaveTextContent("Telefony");
    expect(rows[0]).toHaveTextContent("Dostępny");
    expect(screen.getByText("8 produktów w katalogu")).toBeInTheDocument();
  });

  it("recaptions the page, which now runs to two of five and a spare three", async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await fillWizard(user);
    await user.click(screen.getByRole("button", { name: "Zapisz produkt" }));

    const verbatim = { normalizer: (value: string) => value };
    expect(
      screen.getAllByText("Strona 1 z 2 · 8 produktów", verbatim),
    ).toHaveLength(2);
  });

  it("says so in a toast", async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await fillWizard(user);
    await user.click(screen.getByRole("button", { name: "Zapisz produkt" }));

    expect(await screen.findByText("Produkt został dodany")).toBeInTheDocument();
  });

  it("jumps back to page one so the new row is on screen", async () => {
    const user = userEvent.setup();
    renderCatalogue({ page: "2" });

    expect(screen.getAllByText("Dell UltraSharp U2723QE")).toHaveLength(2);

    await fillWizard(user);
    await user.click(screen.getByRole("button", { name: "Zapisz produkt" }));

    expect(within(table()).getAllByRole("row")[1]).toHaveTextContent("Pixel 9 Pro");
  });

  it("keeps the addition when the visitor pages away and back", async () => {
    const user = userEvent.setup();
    renderCatalogue();

    await fillWizard(user);
    await user.click(screen.getByRole("button", { name: "Zapisz produkt" }));

    // Paging is a shallow URL write, not a navigation — nothing remounts, so
    // the product added a moment ago is still in the catalogue.
    // Both layouts render a pagination; either one drives the same state.
    await user.click(screen.getAllByRole("link", { name: "2" })[0]!);
    expect(within(table()).getAllByRole("row")).toHaveLength(4);

    await user.click(screen.getAllByRole("link", { name: "1" })[0]!);
    expect(within(table()).getAllByRole("row")[1]).toHaveTextContent("Pixel 9 Pro");
  });
});
