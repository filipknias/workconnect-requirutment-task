import { describe, expect, it } from "vitest";
import {
  PRODUCT_FORM_DEFAULTS,
  type ProductFormValues,
} from "@/features/products/schema/product-form-schema";
import { toProduct } from "@/features/products/utils/to-product";

/** A wizard filled in the whole way, as "Zapisz produkt" would hand it over. */
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

describe("toProduct", () => {
  it("carries every answer over under the catalogue's names", () => {
    expect(toProduct(SUBMITTED, "px9pro256")).toEqual({
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
    const product = toProduct(SUBMITTED, "px9pro256");

    expect(product.category).toBe("telefony");
    expect(product.manufacturer).toBe("samsung");
  });

  it("takes the id it is given rather than inventing one", () => {
    expect(toProduct(SUBMITTED, "whatever").id).toBe("whatever");
  });

  it("trims the text fields, the way the schema measured them", () => {
    const product = toProduct(
      { ...SUBMITTED, name: "  Pixel 9 Pro  ", sku: " PX9PRO256 ", description: " Opis " },
      "px9pro256",
    );

    expect(product.name).toBe("Pixel 9 Pro");
    expect(product.sku).toBe("PX9PRO256");
    expect(product.description).toBe("Opis");
  });

  describe("status", () => {
    it("comes from the switch alone", () => {
      expect(toProduct({ ...SUBMITTED, available: true }, "x").status).toBe(
        "available",
      );
      expect(toProduct({ ...SUBMITTED, available: false }, "x").status).toBe(
        "unavailable",
      );
    });

    it("is not second-guessed by an empty shelf", () => {
      const product = toProduct(
        { ...SUBMITTED, available: true, limited: true, stockQuantity: 0 },
        "x",
      );

      expect(product.status).toBe("available");
      expect(product.stock).toBe(0);
    });
  });

  describe("stock", () => {
    it("is null for a product that is not limited", () => {
      expect(toProduct({ ...SUBMITTED, limited: false }, "x").stock).toBeNull();
    });

    it("ignores a quantity left behind by an untick", () => {
      expect(
        toProduct({ ...SUBMITTED, limited: false, stockQuantity: 12 }, "x").stock,
      ).toBeNull();
    });

    it("is the quantity once it is", () => {
      expect(
        toProduct({ ...SUBMITTED, limited: true, stockQuantity: 12 }, "x").stock,
      ).toBe(12);
    });
  });

  it("carries the cart limits across", () => {
    const product = toProduct(
      { ...SUBMITTED, minQuantity: 2, maxQuantity: 4 },
      "x",
    );

    expect(product.minQuantity).toBe(2);
    expect(product.maxQuantity).toBe(4);
  });
});
