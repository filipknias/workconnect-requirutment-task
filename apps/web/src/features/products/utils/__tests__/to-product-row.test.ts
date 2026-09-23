import { describe, expect, it } from "vitest";
import type { Product } from "@/features/products/types/product";
import { PRODUCTS } from "@/features/products/data/products";
import { toProductRow } from "@/features/products/utils/to-product-row";

const PRODUCT: Product = PRODUCTS[0]!;

describe("toProductRow", () => {
  it("resolves the category slug and formats the price", () => {
    expect(toProductRow(PRODUCT)).toEqual({
      id: "mbp14m3pro",
      name: 'MacBook Pro 14"',
      sku: "MBP14M3PRO",
      category: "Komputery",
      price: "9999,00 PLN",
      status: "available",
      stock: "—",
    });
  });

  it("prints the currency the row is actually in", () => {
    expect(toProductRow({ ...PRODUCT, price: 1200.5, currency: "EUR" }).price).toBe(
      "1200,50 EUR",
    );
  });

  it("tells an untracked product apart from one with nothing left", () => {
    expect(toProductRow({ ...PRODUCT, stock: null }).stock).toBe("—");
    expect(toProductRow({ ...PRODUCT, stock: 0 }).stock).toBe("0");
  });

  it("leaves the status a slug for the badge to colour", () => {
    expect(toProductRow({ ...PRODUCT, status: "unavailable" }).status).toBe(
      "unavailable",
    );
  });
});
