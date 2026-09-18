import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCardList } from "@/features/products/components/product-card-list";
import { getProductsPage } from "@/features/products/data/get-products-page";

const verbatim = { normalizer: (value: string) => value };

describe("ProductCardList", () => {
  it("renders a card per product with the mobile stat panel", () => {
    render(<ProductCardList {...getProductsPage(1)} />);

    // "Cena brutto" on the card, against "Cena Brutto" in the table header.
    expect(screen.getAllByText("Cena brutto")).toHaveLength(5);
    expect(screen.getByText('MacBook Pro 14"')).toBeInTheDocument();
    expect(screen.getByText("MBP14M3PRO")).toBeInTheDocument();
    expect(screen.getByText("9999,00 PLN", verbatim)).toBeInTheDocument();
  });

  it("renders both badge states", () => {
    render(<ProductCardList {...getProductsPage(1)} />);

    expect(screen.getAllByText("Dostępny")).toHaveLength(4);
    expect(screen.getByText("Niedostępny")).toBeInTheDocument();
  });

  it("replaces the stack with an empty state when the page does not exist", () => {
    render(<ProductCardList {...getProductsPage(99)} />);

    expect(screen.queryByText("Cena brutto")).not.toBeInTheDocument();
    expect(screen.getByText("Brak produktów na tej stronie")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wróć do pierwszej strony" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("captions the page below the stack", () => {
    render(<ProductCardList {...getProductsPage(2)} />);

    expect(
      screen.getByText(
        "Strona 2 z 2 · 7 produktów",
        verbatim,
      ),
    ).toBeInTheDocument();
  });
});
