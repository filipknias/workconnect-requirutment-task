import { describe, expect, it } from "vitest";
import {
  isStepComplete,
  PRODUCT_FORM_DEFAULTS,
  PRODUCT_INFO_DEFAULTS,
  PRODUCT_PRICING_DEFAULTS,
  productInfoSchema,
  productPricingSchema,
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
      expect(isStepComplete(1, { ...VALID, features: [] })).toBe(true);
    });
  });
});

/** The same, for step 2. */
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
      // Both checks see null; only the first one is meant to complain about it.
      const issues = productPricingSchema
        .safeParse({ ...VALID_PRICING, priceNet: null })
        .error?.issues.filter((issue) => issue.path[0] === "priceNet");

      expect(issues).toHaveLength(1);
      expect(issues?.[0]?.message).toBe("Cena netto jest wymagana");
    });
  });
});

describe("isStepComplete", () => {
  const FILLED = { ...PRODUCT_FORM_DEFAULTS, ...VALID, ...VALID_PRICING };

  it("reports a blank form incomplete", () => {
    expect(isStepComplete(1, PRODUCT_FORM_DEFAULTS)).toBe(false);
    expect(isStepComplete(2, PRODUCT_FORM_DEFAULTS)).toBe(false);
  });

  it("judges only the step it is asked about", () => {
    expect(isStepComplete(1, { ...PRODUCT_FORM_DEFAULTS, ...VALID })).toBe(true);
    expect(isStepComplete(2, { ...PRODUCT_FORM_DEFAULTS, ...VALID })).toBe(false);

    expect(isStepComplete(1, { ...PRODUCT_FORM_DEFAULTS, ...VALID_PRICING })).toBe(
      false,
    );
    expect(isStepComplete(2, { ...PRODUCT_FORM_DEFAULTS, ...VALID_PRICING })).toBe(
      true,
    );
  });

  it("reports the unbuilt step incomplete however full the form is", () => {
    expect(isStepComplete(3, FILLED)).toBe(false);
  });
});
