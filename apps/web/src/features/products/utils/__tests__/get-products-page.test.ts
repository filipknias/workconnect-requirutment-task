import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/features/products/data/products";
import { getProductsPage } from "@/features/products/utils/get-products-page";

describe("getProductsPage", () => {
  it("returns the first five products on page one", () => {
    const { products, page, totalPages, total } = getProductsPage(1, PRODUCTS);

    expect(products).toHaveLength(5);
    expect(products[0]?.name).toBe('MacBook Pro 14"');
    expect(page).toBe(1);
    expect(totalPages).toBe(2);
    expect(total).toBe(7);
  });

  it("returns the remaining two products on page two", () => {
    const { products, page } = getProductsPage(2, PRODUCTS);

    expect(products).toHaveLength(2);
    expect(page).toBe(2);
  });

  it("covers both badge states on page two", () => {
    const statuses = getProductsPage(2, PRODUCTS).products.map((product) => product.status);

    expect(statuses).toContain("available");
    expect(statuses).toContain("unavailable");
  });

  it("returns no products for a page above the range, reporting it verbatim", () => {
    const { page, products, totalPages, total } = getProductsPage(99, PRODUCTS);

    expect(products).toEqual([]);
    expect(page).toBe(99);
    expect(totalPages).toBe(2);
    expect(total).toBe(7);
  });

  it("returns no products for a page below the range", () => {
    expect(getProductsPage(0, PRODUCTS).products).toEqual([]);
    expect(getProductsPage(-5, PRODUCTS).products).toEqual([]);
  });

  it("pages the list it was handed, not the seed", () => {
    const one = PRODUCTS.slice(0, 1);

    expect(getProductsPage(1, one).products).toEqual(one);
    expect(getProductsPage(1, one).total).toBe(1);
    expect(getProductsPage(1, one).totalPages).toBe(1);
    expect(getProductsPage(2, one).products).toEqual([]);
  });

  it("falls back to page one when the page is not a number", () => {
    const { page, products } = getProductsPage(Number.NaN, PRODUCTS);

    expect(page).toBe(1);
    expect(products).toHaveLength(5);
  });
});
