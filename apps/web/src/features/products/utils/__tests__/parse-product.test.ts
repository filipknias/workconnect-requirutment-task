import { describe, expect, it } from "vitest";
import {
  PRODUCT_FORM_DEFAULTS,
  type ProductFormValues,
} from "@/features/products/schema/product-form-schema";
import { parseProduct } from "@/features/products/utils/parse-product";

const SUBMITTED: ProductFormValues = {
  ...PRODUCT_FORM_DEFAULTS,
  name: "Pixel 9 Pro",
  sku: "PX9PRO256",
  description: "Smartfon z aparatem Pro.",
  manufacturer: "samsung",
  category: "telefony",
  features: ["bluetooth", "usb-c"],
  priceNet: 4065.04,
  priceGross: 4999.99,
  vatRate: 23,
  currency: "PLN",
};

describe("parseProduct", () => {
  it("carries every answer over under the catalogue's names", () => {
    expect(parseProduct(SUBMITTED)).toEqual({
      id: "px9pro256",
      name: "Pixel 9 Pro",
      sku: "PX9PRO256",
      description: "Smartfon z aparatem Pro.",
      manufacturer: "samsung",
      category: "telefony",
      features: ["bluetooth", "usb-c"],
      priceNet: 4065.04,
      price: 4999.99,
      vatRate: 23,
      currency: "PLN",
      status: "available",
      stock: null,
      minQuantity: 1,
      maxQuantity: 10,
    });
  });

  it("keeps the slugs rather than the labels beside them", () => {
    const product = parseProduct(SUBMITTED);

    expect(product.category).toBe("telefony");
    expect(product.manufacturer).toBe("samsung");
  });

  it("derives the id from the SKU, lowercased and trimmed", () => {
    expect(parseProduct({ ...SUBMITTED, sku: " PX9PRO256 " }).id).toBe("px9pro256");
  });

  it("trims the text fields, the way the schema measured them", () => {
    const product = parseProduct({
      ...SUBMITTED,
      name: "  Pixel 9 Pro  ",
      sku: " PX9PRO256 ",
      description: " Opis ",
    });

    expect(product.name).toBe("Pixel 9 Pro");
    expect(product.sku).toBe("PX9PRO256");
    expect(product.description).toBe("Opis");
  });

  it("throws on values the steps would not have let through", () => {
    expect(() => parseProduct(PRODUCT_FORM_DEFAULTS)).toThrow();
    expect(() => parseProduct({ ...SUBMITTED, priceGross: null })).toThrow();
    expect(() =>
      parseProduct({ ...SUBMITTED, limited: true, stockQuantity: null }),
    ).toThrow();
  });

  describe("status", () => {
    it("comes from the switch alone", () => {
      expect(parseProduct({ ...SUBMITTED, available: true }).status).toBe("available");
      expect(parseProduct({ ...SUBMITTED, available: false }).status).toBe(
        "unavailable",
      );
    });

    it("is not second-guessed by an empty shelf", () => {
      const product = parseProduct({
        ...SUBMITTED,
        available: true,
        limited: true,
        stockQuantity: 0,
      });

      expect(product.status).toBe("available");
      expect(product.stock).toBe(0);
    });
  });

  describe("stock", () => {
    it("is null for a product that is not limited", () => {
      expect(parseProduct({ ...SUBMITTED, limited: false }).stock).toBeNull();
    });

    it("ignores a quantity left behind by an untick", () => {
      expect(
        parseProduct({ ...SUBMITTED, limited: false, stockQuantity: 12 }).stock,
      ).toBeNull();
    });

    it("is the quantity once it is", () => {
      expect(parseProduct({ ...SUBMITTED, limited: true, stockQuantity: 12 }).stock).toBe(
        12,
      );
    });
  });

  it("carries the cart limits across", () => {
    const product = parseProduct({ ...SUBMITTED, minQuantity: 2, maxQuantity: 4 });

    expect(product.minQuantity).toBe(2);
    expect(product.maxQuantity).toBe(4);
  });
});
