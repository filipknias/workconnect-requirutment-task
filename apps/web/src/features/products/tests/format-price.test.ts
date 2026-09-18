import { describe, expect, it } from "vitest";
import { formatPrice } from "@/features/products/utils/format-price";

describe("formatPrice", () => {
  it("renders the Figma format — no grouping, comma decimals, NBSP before PLN", () => {
    expect(formatPrice(9999)).toBe("9999,00 PLN");
    expect(formatPrice(179)).toBe("179,00 PLN");
  });

  it("always shows two decimal places", () => {
    expect(formatPrice(1599.5)).toBe("1599,50 PLN");
    expect(formatPrice(0)).toBe("0,00 PLN");
  });
});
