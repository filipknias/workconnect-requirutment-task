import { describe, expect, it } from "vitest";
import {
  applyPriceEdit,
  type ProductPricing,
} from "@/features/products/utils/recalculate-prices";

const EMPTY: ProductPricing = { priceNet: null, priceGross: null, vatRate: 23 };

describe("applyPriceEdit", () => {
  describe("typing a net price", () => {
    it("derives the gross price from it", () => {
      expect(applyPriceEdit(EMPTY, { field: "priceNet", value: 100 })).toEqual({
        priceNet: 100,
        priceGross: 123,
        vatRate: 23,
      });
    });

    it("rounds the gross price to the cent", () => {
      // 19.99 x 1.23 is 24.587699999999998 in floating point, and the stored
      // number is what the input shows.
      expect(
        applyPriceEdit(EMPTY, { field: "priceNet", value: 19.99 }).priceGross,
      ).toBe(24.59);
    });

    it("leaves the typed price exactly as it was typed", () => {
      expect(applyPriceEdit(EMPTY, { field: "priceNet", value: 19.999 })).toEqual({
        priceNet: 19.999,
        priceGross: 24.6,
        vatRate: 23,
      });
    });

    it("handles a zero rate", () => {
      const zeroRated = { ...EMPTY, vatRate: 0 };
      expect(
        applyPriceEdit(zeroRated, { field: "priceNet", value: 19.99 }).priceGross,
      ).toBe(19.99);
    });
  });

  describe("typing a gross price", () => {
    it("runs the same equation backwards", () => {
      expect(applyPriceEdit(EMPTY, { field: "priceGross", value: 123 })).toEqual({
        priceNet: 100,
        priceGross: 123,
        vatRate: 23,
      });
    });

    it("rounds the net price, not the typed one", () => {
      // 24.5 / 1.23 is 19.91869918699187.
      expect(applyPriceEdit(EMPTY, { field: "priceGross", value: 24.5 })).toEqual({
        priceNet: 19.92,
        priceGross: 24.5,
        vatRate: 23,
      });
    });

    it("returns the original cent when a derived price is typed straight back", () => {
      const fromNet = applyPriceEdit(EMPTY, { field: "priceNet", value: 19.99 });
      const roundTripped = applyPriceEdit(fromNet, {
        field: "priceGross",
        value: fromNet.priceGross,
      });

      expect(roundTripped.priceNet).toBe(19.99);
    });
  });

  describe("changing the VAT rate", () => {
    it("recomputes the gross price from the net one", () => {
      const priced = applyPriceEdit(EMPTY, { field: "priceNet", value: 100 });

      expect(applyPriceEdit(priced, { field: "vatRate", value: 8 })).toEqual({
        priceNet: 100,
        priceGross: 108,
        vatRate: 8,
      });
    });

    it("writes the net price back from the recomputed gross one", () => {
      // 19.999 was typed, so it was left alone at the time. The new rate makes
      // 21.6 the gross price, and 21.6 is a 20.00 net price — the sub-cent
      // precision has nowhere to live once a gross price is derived from it,
      // so both boxes move.
      const priced = applyPriceEdit(EMPTY, { field: "priceNet", value: 19.999 });

      expect(applyPriceEdit(priced, { field: "vatRate", value: 8 })).toEqual({
        priceNet: 20,
        priceGross: 21.6,
        vatRate: 8,
      });
    });

    it("leaves a pair already consistent to the cent where it is", () => {
      const priced = applyPriceEdit(EMPTY, { field: "priceNet", value: 19.99 });

      expect(applyPriceEdit(priced, { field: "vatRate", value: 23 })).toEqual({
        priceNet: 19.99,
        priceGross: 24.59,
        vatRate: 23,
      });
    });

    it("settles after one change rather than drifting on every repeat", () => {
      let pricing = applyPriceEdit(EMPTY, { field: "priceNet", value: 19.999 });
      pricing = applyPriceEdit(pricing, { field: "vatRate", value: 8 });

      for (const value of [23, 8, 23, 8]) {
        pricing = applyPriceEdit(pricing, { field: "vatRate", value });
        expect(pricing.priceNet).toBe(20);
      }
    });

    it("anchors on the net price even when the gross one is what was typed", () => {
      const priced = applyPriceEdit(EMPTY, { field: "priceGross", value: 123 });

      expect(applyPriceEdit(priced, { field: "vatRate", value: 0 })).toEqual({
        priceNet: 100,
        priceGross: 100,
        vatRate: 0,
      });
    });

    it("leaves an untouched pair empty", () => {
      expect(applyPriceEdit(EMPTY, { field: "vatRate", value: 5 })).toEqual({
        priceNet: null,
        priceGross: null,
        vatRate: 5,
      });
    });
  });

  describe("emptying a price", () => {
    it("clears the gross price when the net one is cleared", () => {
      const priced = applyPriceEdit(EMPTY, { field: "priceNet", value: 100 });

      expect(applyPriceEdit(priced, { field: "priceNet", value: null })).toEqual({
        priceNet: null,
        priceGross: null,
        vatRate: 23,
      });
    });

    it("clears the net price when the gross one is cleared", () => {
      const priced = applyPriceEdit(EMPTY, { field: "priceNet", value: 100 });

      expect(applyPriceEdit(priced, { field: "priceGross", value: null })).toEqual({
        priceNet: null,
        priceGross: null,
        vatRate: 23,
      });
    });

    it("never leaves one price behind without the other", () => {
      // The only two shapes reachable: both empty, or both present.
      const edits = [
        { field: "priceNet", value: 100 },
        { field: "priceGross", value: null },
        { field: "vatRate", value: 8 },
        { field: "priceGross", value: 54 },
        { field: "priceNet", value: null },
      ] as const;

      let pricing = EMPTY;
      for (const edit of edits) {
        pricing = applyPriceEdit(pricing, edit);
        expect(pricing.priceNet === null).toBe(pricing.priceGross === null);
      }
    });
  });
});
