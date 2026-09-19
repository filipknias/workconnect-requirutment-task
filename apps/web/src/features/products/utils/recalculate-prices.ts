/**
 * Every pricing rule of step 2 ("Cena / Dane cenowe"), as arithmetic.
 *
 * Net and gross are tied by one equation, so an edit to any of the three
 * numbers is answered by rewriting the other two. Which of the two prices
 * anchors a VAT change is the only real decision here: the net price does,
 * because it is the number a VAT rate is applied *to*. The gross price is then
 * recomputed from it, and the net price is written back from that rounded
 * gross — so a VAT change updates both boxes and leaves them exactly
 * consistent at the cent, rather than leaving a net price with more precision
 * than the gross price beside it can account for.
 */

export type ProductPricing = {
  /**
   * `null`, never `0`, while the box is empty: `0` is a real price the schema
   * rejects, and treating an empty field as one would let "Dalej" light up
   * before anything has been typed.
   */
  priceNet: number | null;
  priceGross: number | null;
  /** A percentage, as the "Stawka VAT" option stores it: `23` means 23%. */
  vatRate: number;
};

/**
 * One edit, as the user made it. `vatRate` has no `null` case because the
 * select always holds one of its options — it starts on 23%.
 */
export type PriceEdit =
  | { field: "priceNet" | "priceGross"; value: number | null }
  | { field: "vatRate"; value: number };

/**
 * The pricing that replaces `pricing` after `edit`.
 *
 * Clearing either price clears the other: a lone gross price with no net price
 * behind it is a state nothing here can recompute from, and leaving the other
 * box showing a number nobody typed is worse than emptying it.
 */
export function applyPriceEdit(
  pricing: ProductPricing,
  edit: PriceEdit,
): ProductPricing {
  switch (edit.field) {
    case "priceNet":
      return fromNet(edit.value, pricing.vatRate);

    case "priceGross":
      return edit.value === null
        ? fromNet(null, pricing.vatRate)
        : fromGross(edit.value, pricing.vatRate);

    case "vatRate": {
      // The chain the spec describes, run in one go: the new rate gives a new
      // gross price, and that gross price gives the net price back. Both boxes
      // are rewritten. In the common case the net price returns unchanged —
      // the equation is its own inverse — and it moves only when it was
      // carrying precision finer than a cent, which no gross price can
      // represent anyway.
      const { priceGross } = fromNet(pricing.priceNet, edit.value);
      return priceGross === null
        ? fromNet(null, edit.value)
        : fromGross(priceGross, edit.value);
    }
  }
}

/**
 * Only the *computed* side is rounded. A typed 19.999 stays 19.999 and shows
 * 24.6 beside it: the alternative is rewriting a number under the cursor of
 * someone who is still typing it. Rounding the computed side is not optional,
 * though — the stored number is also the displayed one, and 19.99 x 1.23 is
 * 24.587699999999998 in binary floating point.
 */
function fromNet(priceNet: number | null, vatRate: number): ProductPricing {
  return {
    priceNet,
    priceGross: priceNet === null ? null : round(priceNet * grossFactor(vatRate)),
    vatRate,
  };
}

/** The same equation backwards, for a typed gross price. */
function fromGross(priceGross: number, vatRate: number): ProductPricing {
  return {
    priceNet: round(priceGross / grossFactor(vatRate)),
    priceGross,
    vatRate,
  };
}

const grossFactor = (vatRate: number) => 1 + vatRate / 100;

const round = (value: number) => Math.round(value * 100) / 100;
