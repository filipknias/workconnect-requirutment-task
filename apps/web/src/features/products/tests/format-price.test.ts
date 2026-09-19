import { describe, expect, it } from "vitest";
import { formatPrice } from "@/features/products/utils/format-price";

describe("formatPrice", () => {
  it("renders the Figma format — no grouping, comma decimals, NBSP before the currency", () => {
    expect(formatPrice(9999, "PLN")).toBe("9999,00 PLN");
    expect(formatPrice(179, "PLN")).toBe("179,00 PLN");
  });

  it("always shows two decimal places", () => {
    expect(formatPrice(1599.5, "PLN")).toBe("1599,50 PLN");
    expect(formatPrice(0, "PLN")).toBe("0,00 PLN");
  });

  it("prints the currency it was given, not the one the frames happen to show", () => {
    expect(formatPrice(99, "EUR")).toBe("99,00 EUR");
    expect(formatPrice(99, "GBP")).toBe("99,00 GBP");
  });
});
