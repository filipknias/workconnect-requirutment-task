import { describe, expect, it } from "vitest";
import {
  PRODUCT_AVAILABILITY_DEFAULTS,
  PRODUCT_INFO_DEFAULTS,
  PRODUCT_PRICING_DEFAULTS,
  productAvailabilitySchema,
  productInfoSchema,
  productPricingSchema,
} from "@/features/products/schema/product-form-schema";

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
      new Set(["name", "sku", "manufacturer", "category"]),
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
    it("is optional", () => {
      expect(firstError({ features: [] }, "features")).toBeUndefined();
      expect(firstError({ features: ["bluetooth", "wifi"] }, "features")).toBeUndefined();
    });

    it("does not hold step one back", () => {
      expect(productInfoSchema.safeParse({ ...VALID, features: [] }).success).toBe(true);
    });
  });
});

function firstPricingError(
  values: Partial<typeof PRODUCT_PRICING_DEFAULTS>,
  field: keyof typeof PRODUCT_PRICING_DEFAULTS,
): string | undefined {
  const result = productPricingSchema.safeParse({ ...VALID_PRICING, ...values });
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

const VALID_PRICING = {
  priceNet: 100,
  priceGross: 123,
  vatRate: 23,
  currency: "PLN",
};

describe("productPricingSchema", () => {
  it("accepts a filled-in step two", () => {
    expect(productPricingSchema.safeParse(VALID_PRICING).success).toBe(true);
  });

  it("accepts the rate and currency it starts on", () => {
    expect(
      firstPricingError({ vatRate: PRODUCT_PRICING_DEFAULTS.vatRate }, "vatRate"),
    ).toBeUndefined();
    expect(
      firstPricingError(
        { currency: PRODUCT_PRICING_DEFAULTS.currency },
        "currency",
      ),
    ).toBeUndefined();
  });

  it("rejects the empty defaults on both prices", () => {
    const result = productPricingSchema.safeParse(PRODUCT_PRICING_DEFAULTS);

    expect(result.success).toBe(false);
    expect(new Set(result.error?.issues.map((issue) => issue.path[0]))).toEqual(
      new Set(["priceNet", "priceGross"]),
    );
  });

  describe("prices", () => {
    it("are required, and an empty box is null rather than zero", () => {
      expect(firstPricingError({ priceNet: null }, "priceNet")).toBe(
        "Cena netto jest wymagana",
      );
      expect(firstPricingError({ priceGross: null }, "priceGross")).toBe(
        "Cena brutto jest wymagana",
      );
    });

    it("reject zero — which is what a half-hearted keystroke leaves behind", () => {
      expect(firstPricingError({ priceNet: 0 }, "priceNet")).toBe(
        "Cena netto musi być większa od zera",
      );
      expect(firstPricingError({ priceGross: 0 }, "priceGross")).toBe(
        "Cena brutto musi być większa od zera",
      );
    });

    it("reject negatives", () => {
      expect(firstPricingError({ priceNet: -1 }, "priceNet")).toBe(
        "Cena netto musi być większa od zera",
      );
    });

    it("accept a cent, and anything above it", () => {
      expect(firstPricingError({ priceNet: 0.01 }, "priceNet")).toBeUndefined();
      expect(
        firstPricingError({ priceNet: 1_000_000 }, "priceNet"),
      ).toBeUndefined();
    });

    it("shows the required message first when a field is empty", () => {
      const issues = productPricingSchema
        .safeParse({ ...VALID_PRICING, priceNet: null })
        .error?.issues.filter((issue) => issue.path[0] === "priceNet");

      expect(issues).toHaveLength(1);
      expect(issues?.[0]?.message).toBe("Cena netto jest wymagana");
    });
  });
});

function firstAvailabilityError(
  values: Partial<typeof PRODUCT_AVAILABILITY_DEFAULTS>,
  field: keyof typeof PRODUCT_AVAILABILITY_DEFAULTS,
): string | undefined {
  const result = productAvailabilitySchema.safeParse({
    ...PRODUCT_AVAILABILITY_DEFAULTS,
    ...values,
  });
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("productAvailabilitySchema", () => {
  it("accepts the defaults the frame draws — available, unlimited, 1 to 10", () => {
    expect(PRODUCT_AVAILABILITY_DEFAULTS).toEqual({
      available: true,
      limited: false,
      stockQuantity: null,
      minQuantity: 1,
      maxQuantity: 10,
    });
    expect(
      productAvailabilitySchema.safeParse(PRODUCT_AVAILABILITY_DEFAULTS).success,
    ).toBe(true);
  });

  describe("stockQuantity", () => {
    it("is ignored entirely while the product is not limited", () => {
      expect(
        firstAvailabilityError({ limited: false, stockQuantity: null }, "stockQuantity"),
      ).toBeUndefined();
      expect(
        firstAvailabilityError({ limited: false, stockQuantity: -4 }, "stockQuantity"),
      ).toBeUndefined();
      expect(
        firstAvailabilityError({ limited: false, stockQuantity: 2.5 }, "stockQuantity"),
      ).toBeUndefined();
    });

    it("is required as soon as it is", () => {
      expect(
        firstAvailabilityError({ limited: true, stockQuantity: null }, "stockQuantity"),
      ).toBe("Ilość na magazynie jest wymagana");
    });

    it("has to be a whole number", () => {
      expect(
        firstAvailabilityError({ limited: true, stockQuantity: 2.5 }, "stockQuantity"),
      ).toBe("Ilość na magazynie musi być liczbą całkowitą");
    });

    it("allows zero — an empty shelf is a real answer — but not less", () => {
      expect(
        firstAvailabilityError({ limited: true, stockQuantity: 0 }, "stockQuantity"),
      ).toBeUndefined();
      expect(
        firstAvailabilityError({ limited: true, stockQuantity: -1 }, "stockQuantity"),
      ).toBe("Ilość na magazynie nie może być ujemna");
    });
  });

  describe("cart limits", () => {
    it("are both required", () => {
      expect(firstAvailabilityError({ minQuantity: null }, "minQuantity")).toBe(
        "Minimalna ilość jest wymagana",
      );
      expect(firstAvailabilityError({ maxQuantity: null }, "maxQuantity")).toBe(
        "Maksymalna ilość jest wymagana",
      );
    });

    it("are both whole numbers", () => {
      expect(firstAvailabilityError({ minQuantity: 1.5 }, "minQuantity")).toBe(
        "Minimalna ilość musi być liczbą całkowitą",
      );
      expect(firstAvailabilityError({ maxQuantity: 9.5 }, "maxQuantity")).toBe(
        "Maksymalna ilość musi być liczbą całkowitą",
      );
    });

    it("both start at one — zero of something is not a cart limit", () => {
      expect(firstAvailabilityError({ minQuantity: 0 }, "minQuantity")).toBe(
        "Minimalna ilość musi wynosić co najmniej 1",
      );
      expect(
        firstAvailabilityError({ minQuantity: 1, maxQuantity: 0 }, "maxQuantity"),
      ).toBe("Maksymalna ilość musi wynosić co najmniej 1");
    });

    it("allow max === min, for a buy-exactly-one product", () => {
      expect(
        productAvailabilitySchema.safeParse({
          ...PRODUCT_AVAILABILITY_DEFAULTS,
          minQuantity: 1,
          maxQuantity: 1,
        }).success,
      ).toBe(true);
    });

    it("reject a maximum below the minimum, and say so on both boxes", () => {
      const message = "Maksymalna ilość nie może być mniejsza od minimalnej";

      expect(
        firstAvailabilityError({ minQuantity: 5, maxQuantity: 2 }, "minQuantity"),
      ).toBe(message);
      expect(
        firstAvailabilityError({ minQuantity: 5, maxQuantity: 2 }, "maxQuantity"),
      ).toBe(message);
    });

    it("says nothing about the order while either box is still empty", () => {
      expect(
        firstAvailabilityError({ minQuantity: null, maxQuantity: 2 }, "maxQuantity"),
      ).toBeUndefined();
      expect(
        firstAvailabilityError({ minQuantity: 5, maxQuantity: null }, "minQuantity"),
      ).toBeUndefined();
    });

    it("shows a box's own problem before the cross-field one", () => {
      expect(
        firstAvailabilityError({ minQuantity: 5, maxQuantity: 0 }, "maxQuantity"),
      ).toBe("Maksymalna ilość musi wynosić co najmniej 1");
    });
  });

  describe("available", () => {
    it("is free of the stock level — an available product may have none", () => {
      expect(
        productAvailabilitySchema.safeParse({
          ...PRODUCT_AVAILABILITY_DEFAULTS,
          available: true,
          limited: true,
          stockQuantity: 0,
        }).success,
      ).toBe(true);
    });
  });
});
