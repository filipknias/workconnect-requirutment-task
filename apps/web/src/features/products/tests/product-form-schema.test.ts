import { describe, expect, it } from "vitest";
import {
  PRODUCT_INFO_DEFAULTS,
  productInfoSchema,
} from "@/features/products/schema/product-form-schema";

/** The message a field would show — the first failing check, as the form does. */
function firstError(
  values: Partial<typeof PRODUCT_INFO_DEFAULTS>,
  field: keyof typeof PRODUCT_INFO_DEFAULTS,
): string | undefined {
  const result = productInfoSchema.safeParse({ ...VALID, ...values });
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

const VALID = {
  name: 'MacBook Pro 14"',
  sku: "MBP14M3PRO",
  description: "",
  manufacturer: "apple",
  category: "komputery",
  features: ["bluetooth"],
};

describe("productInfoSchema", () => {
  it("accepts a filled-in step one", () => {
    expect(productInfoSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects the empty defaults on every required field", () => {
    const result = productInfoSchema.safeParse(PRODUCT_INFO_DEFAULTS);

    expect(result.success).toBe(false);
    expect(new Set(result.error?.issues.map((issue) => issue.path[0]))).toEqual(
      new Set(["name", "sku", "manufacturer", "category", "features"]),
    );
  });

  describe("name", () => {
    it("is required, and whitespace does not count", () => {
      expect(firstError({ name: "" }, "name")).toBe("Nazwa produktu jest wymagana");
      expect(firstError({ name: "   " }, "name")).toBe("Nazwa produktu jest wymagana");
    });

    it("needs at least three characters", () => {
      expect(firstError({ name: "ab" }, "name")).toBe("Nazwa musi mieć co najmniej 3 znaki");
      expect(firstError({ name: "abc" }, "name")).toBeUndefined();
    });

    it("caps at a hundred", () => {
      expect(firstError({ name: "a".repeat(100) }, "name")).toBeUndefined();
      expect(firstError({ name: "a".repeat(101) }, "name")).toBe(
        "Nazwa może mieć maksymalnie 100 znaków",
      );
    });

    it("measures the trimmed value", () => {
      expect(firstError({ name: `  ${"a".repeat(100)}  ` }, "name")).toBeUndefined();
    });
  });

  describe("sku", () => {
    it("is required", () => {
      expect(firstError({ sku: "" }, "sku")).toBe("SKU jest wymagane");
    });

    it("allows only letters and digits", () => {
      expect(firstError({ sku: "MBP-14" }, "sku")).toBe("SKU może zawierać tylko litery i cyfry");
      expect(firstError({ sku: "MBP 14" }, "sku")).toBe("SKU może zawierać tylko litery i cyfry");
      expect(firstError({ sku: "MBP14M3PRO" }, "sku")).toBeUndefined();
    });

    it("caps at twenty-four", () => {
      expect(firstError({ sku: "A".repeat(24) }, "sku")).toBeUndefined();
      expect(firstError({ sku: "A".repeat(25) }, "sku")).toBe(
        "SKU może mieć maksymalnie 24 znaki",
      );
    });

    it("preserves the case it was typed in", () => {
      expect(productInfoSchema.parse({ ...VALID, sku: "mbp14m3pro" }).sku).toBe("mbp14m3pro");
    });
  });

  describe("description", () => {
    it("is optional", () => {
      expect(firstError({ description: "" }, "description")).toBeUndefined();
    });

    it("caps at five hundred", () => {
      expect(firstError({ description: "a".repeat(500) }, "description")).toBeUndefined();
      expect(firstError({ description: "a".repeat(501) }, "description")).toBe(
        "Opis może mieć maksymalnie 500 znaków",
      );
    });
  });

  describe("manufacturer and category", () => {
    it("are both required", () => {
      expect(firstError({ manufacturer: "" }, "manufacturer")).toBe("Producent jest wymagany");
      expect(firstError({ category: "" }, "category")).toBe("Kategoria jest wymagana");
    });
  });

  describe("features", () => {
    it("needs at least one", () => {
      expect(firstError({ features: [] }, "features")).toBe(
        "Wybierz co najmniej jedną cechę produktu",
      );
      expect(firstError({ features: ["bluetooth", "wifi"] }, "features")).toBeUndefined();
    });
  });
});
