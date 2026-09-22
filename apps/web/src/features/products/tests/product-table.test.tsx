import { render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import { ProductTable } from "@/features/products/components/product-table";
import { PRODUCTS } from "@/features/products/data/products";
import { getProductsPage } from "@/features/products/utils/get-products-page";

/** Keeps the non-breaking spaces intact — collapsing them would defeat the point. */
const verbatim = { normalizer: (value: string) => value };

/**
 * The paging controls inside both layouts read the page out of the URL with
 * nuqs, so they need an adapter even though these tests are handed the page.
 */
const wrapper = withNuqsTestingAdapter();

describe("ProductTable", () => {
  it("renders the Figma columns and rows for page one", () => {
    render(<ProductTable {...getProductsPage(1, PRODUCTS)} />, { wrapper });

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
    // The row stores the slug "komputery"; the cell shows the Polish label.
    expect(within(row).getByText("Komputery")).toBeInTheDocument();
    expect(within(row).getByText("9999,00 PLN", verbatim)).toBeInTheDocument();
    expect(within(row).getByText("Dostępny")).toBeInTheDocument();
  });

  it("resolves every category slug to its label", () => {
    render(<ProductTable {...getProductsPage(1, PRODUCTS)} />, { wrapper });

    expect(
      screen.getAllByRole("row").slice(1).map((row) => row.children[2]?.textContent),
    ).toEqual(["Komputery", "Telefony", "RTV", "AGD", "Akcesoria"]);
    expect(screen.queryByText("komputery")).not.toBeInTheDocument();
  });

  it("shows an em dash for untracked stock and a zero for an empty one", () => {
    render(<ProductTable {...getProductsPage(1, PRODUCTS)} />, { wrapper });

    expect(
      within(screen.getByRole("row", { name: /MacBook Pro 14"/ })).getByText("—"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("row", { name: /Bosch Serie 6/ })).getByText("0"),
    ).toBeInTheDocument();
  });

  it("replaces the rows with an empty state when the page does not exist", () => {
    render(<ProductTable {...getProductsPage(99, PRODUCTS)} />, { wrapper });

    expect(screen.queryAllByRole("row", { name: /PLN/ })).toHaveLength(0);
    expect(screen.getByText("Brak produktów na tej stronie")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć do pierwszej strony" })).toHaveAttribute(
      "href",
      "/",
    );
    // The caption reports the page that was asked for.
    expect(
      screen.getByText("Strona 99 z 2 · 7 produktów", verbatim),
    ).toBeInTheDocument();
  });

  it("offers no way back from an empty catalogue, since page one is where it is", () => {
    render(<ProductTable {...getProductsPage(1, [])} />, { wrapper });

    expect(screen.getByText("Brak produktów na tej stronie")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Wróć do pierwszej strony" }),
    ).not.toBeInTheDocument();
  });

  it("captions the page and links the other one", () => {
    render(<ProductTable {...getProductsPage(1, PRODUCTS)} />, { wrapper });

    expect(
      screen.getByText(
        "Strona 1 z 2 · 7 produktów",
        verbatim,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/?page=2");
  });
});
