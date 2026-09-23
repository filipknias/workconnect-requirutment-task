import { describe, expect, it } from "vitest";
import {
  formatPageCaption,
  formatProductCount,
} from "@/features/products/utils/product-labels";

describe("formatProductCount", () => {
  it("uses the singular for one", () => {
    expect(formatProductCount(1)).toBe("1 produkt");
  });

  it("uses the few-form for counts ending in 2-4", () => {
    expect(formatProductCount(2)).toBe("2 produkty");
    expect(formatProductCount(4)).toBe("4 produkty");
    expect(formatProductCount(22)).toBe("22 produkty");
  });

  it("uses the many-form otherwise, including the teens", () => {
    expect(formatProductCount(0)).toBe("0 produktów");
    expect(formatProductCount(7)).toBe("7 produktów");
    expect(formatProductCount(12)).toBe("12 produktów");
    expect(formatProductCount(14)).toBe("14 produktów");
  });
});

describe("formatPageCaption", () => {
  it("binds each phrase with non-breaking spaces", () => {
    expect(formatPageCaption({ page: 1, totalPages: 2, total: 7 })).toBe(
      "Strona 1 z 2 · 7 produktów",
    );
  });

  it("leaves the separator the caption's one break point", () => {
    const caption = formatPageCaption({ page: 99, totalPages: 2, total: 7 });

    expect(caption.split(" ")).toEqual([
      "Strona\u00a099\u00a0z\u00a02",
      "·",
      "7\u00a0produktów",
    ]);
  });
});
