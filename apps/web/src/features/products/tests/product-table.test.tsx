import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductTable } from "@/features/products/components/product-table";
import { getProductsPage } from "@/features/products/utils/get-products-page";

/** Keeps the non-breaking spaces intact — collapsing them would defeat the point. */
const verbatim = { normalizer: (value: string) => value };

describe("ProductTable", () => {
  it("renders the Figma columns and rows for page one", () => {
    render(<ProductTable {...getProductsPage(1)} />);

    const headers = screen.getAllByRole("columnheader").map((cell) => cell.textContent);
    expect(headers).toEqual([
      "Nazwa",
      "SKU",
      "Kategoria",
      "Cena Brutto",
      "Status",
      "Magazyn",
    ]);

    const row = screen.getByRole("row", { name: /MacBook Pro 14"/ });
    expect(within(row).getByText("MBP14M3PRO")).toBeInTheDocument();
    expect(within(row).getByText("Komputery")).toBeInTheDocument();
    expect(within(row).getByText("9999,00 PLN", verbatim)).toBeInTheDocument();
    expect(within(row).getByText("Dostępny")).toBeInTheDocument();
  });

  it("shows an em dash for untracked stock and a zero for an empty one", () => {
    render(<ProductTable {...getProductsPage(1)} />);

    expect(
      within(screen.getByRole("row", { name: /MacBook Pro 14"/ })).getByText("—"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("row", { name: /Bosch Serie 6/ })).getByText("0"),
    ).toBeInTheDocument();
  });

  it("replaces the rows with an empty state when the page does not exist", () => {
    render(<ProductTable {...getProductsPage(99)} />);

    expect(screen.queryAllByRole("row", { name: /PLN/ })).toHaveLength(0);
    expect(screen.getByText("Brak produktów na tej stronie")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć do pierwszej strony" })).toHaveAttribute(
      "href",
      "/",
    );
    // The caption reports the page that was asked for.
    expect(
      screen.getByText("Strona 99 z 2 · 7 produktów", verbatim),
    ).toBeInTheDocument();
  });

  it("captions the page and links the other one", () => {
    render(<ProductTable {...getProductsPage(1)} />);

    expect(
      screen.getByText(
        "Strona 1 z 2 · 7 produktów",
        verbatim,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/?page=2");
  });
});
