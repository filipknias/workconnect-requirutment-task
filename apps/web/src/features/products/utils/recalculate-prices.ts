export type ProductPricing = {
  // `null`, never `0`, while the box is empty: with `0` an empty box would
  // report "must be greater than zero" instead of "required".
  priceNet: number | null;
  priceGross: number | null;
  vatRate: number;
};

export type PriceEdit =
  | { field: "priceNet" | "priceGross"; value: number | null }
  | { field: "vatRate"; value: number };

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
      // Anchored on the net price: gross is recomputed from it, then net is
      // written back from that rounded gross.
      const { priceGross } = fromNet(pricing.priceNet, edit.value);
      return priceGross === null
        ? fromNet(null, edit.value)
        : fromGross(priceGross, edit.value);
    }
  }
}

// Only the computed side is rounded, and it must be: 19.99 × 1.23 is
// 24.5876999… in floating point.
function fromNet(priceNet: number | null, vatRate: number): ProductPricing {
  return {
    priceNet,
    priceGross: priceNet === null ? null : round(priceNet * grossFactor(vatRate)),
    vatRate,
  };
}

function fromGross(priceGross: number, vatRate: number): ProductPricing {
  return {
    priceNet: round(priceGross / grossFactor(vatRate)),
    priceGross,
    vatRate,
  };
}

const grossFactor = (vatRate: number) => 1 + vatRate / 100;

const round = (value: number) => Math.round(value * 100) / 100;
