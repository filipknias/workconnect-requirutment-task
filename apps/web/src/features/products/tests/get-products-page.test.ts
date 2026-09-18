import { describe, expect, it } from "vitest";
import { getProductsPage } from "@/features/products/data/get-products-page";

describe("getProductsPage", () => {
  it("returns the first five products on page one", () => {
    const { products, page, totalPages, total } = getProductsPage(1);

    expect(products).toHaveLength(5);
    expect(products[0]?.name).toBe('MacBook Pro 14"');
    expect(page).toBe(1);
    expect(totalPages).toBe(2);
    expect(total).toBe(7);
  });

  it("returns the remaining two products on page two", () => {
    const { products, page } = getProductsPage(2);

    expect(products).toHaveLength(2);
    expect(page).toBe(2);
  });

  it("covers both badge states on page two", () => {
    const statuses = getProductsPage(2).products.map((product) => product.status);

    expect(statuses).toContain("available");
    expect(statuses).toContain("unavailable");
  });

  it("returns no products for a page above the range, reporting it verbatim", () => {
    const { page, products, totalPages, total } = getProductsPage(99);

    expect(products).toEqual([]);
    expect(page).toBe(99);
    // The catalogue counts stay honest so the caption can still be rendered.
    expect(totalPages).toBe(2);
    expect(total).toBe(7);
  });

  it("returns no products for a page below the range", () => {
    expect(getProductsPage(0).products).toEqual([]);
    expect(getProductsPage(-5).products).toEqual([]);
  });

  it("falls back to page one when the page is not a number", () => {
    const { page, products } = getProductsPage(Number.NaN);

    expect(page).toBe(1);
    expect(products).toHaveLength(5);
  });
});
