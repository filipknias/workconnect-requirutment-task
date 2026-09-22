import { render, screen } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import { ProductCardList } from "@/features/products/components/product-card-list";
import { PRODUCTS } from "@/features/products/data/products";
import { getProductsPage } from "@/features/products/utils/get-products-page";

const verbatim = { normalizer: (value: string) => value };

/**
 * The paging controls inside both layouts read the page out of the URL with
 * nuqs, so they need an adapter even though these tests are handed the page.
 */
const wrapper = withNuqsTestingAdapter();

describe("ProductCardList", () => {
  it("renders a card per product with the mobile stat panel", () => {
    render(<ProductCardList {...getProductsPage(1, PRODUCTS)} />, { wrapper });

    // "Cena brutto" on the card, against "Cena Brutto" in the table header.
    expect(screen.getAllByText("Cena brutto")).toHaveLength(5);
    expect(screen.getByText('MacBook Pro 14"')).toBeInTheDocument();
    expect(screen.getByText("MBP14M3PRO")).toBeInTheDocument();
    expect(screen.getByText("9999,00 PLN", verbatim)).toBeInTheDocument();
  });

  it("resolves every category slug to its label", () => {
    render(<ProductCardList {...getProductsPage(1, PRODUCTS)} />, { wrapper });

    for (const label of ["Komputery", "Telefony", "RTV", "AGD", "Akcesoria"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    // The cards store slugs; none of them reaches the screen.
    expect(screen.queryByText("komputery")).not.toBeInTheDocument();
  });

  it("renders both badge states", () => {
    render(<ProductCardList {...getProductsPage(1, PRODUCTS)} />, { wrapper });

    expect(screen.getAllByText("Dostępny")).toHaveLength(4);
    expect(screen.getByText("Niedostępny")).toBeInTheDocument();
  });

  it("replaces the stack with an empty state when the page does not exist", () => {
    render(<ProductCardList {...getProductsPage(99, PRODUCTS)} />, { wrapper });

    expect(screen.queryByText("Cena brutto")).not.toBeInTheDocument();
    expect(screen.getByText("Brak produktów na tej stronie")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć do pierwszej strony" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("offers no way back from an empty catalogue, since page one is where it is", () => {
    render(<ProductCardList {...getProductsPage(1, [])} />, { wrapper });

    expect(screen.getByText("Brak produktów na tej stronie")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Wróć do pierwszej strony" }),
    ).not.toBeInTheDocument();
  });

  it("captions the page below the stack", () => {
    render(<ProductCardList {...getProductsPage(2, PRODUCTS)} />, { wrapper });

    expect(
      screen.getByText(
        "Strona 2 z 2 · 7 produktów",
        verbatim,
      ),
    ).toBeInTheDocument();
  });
});
