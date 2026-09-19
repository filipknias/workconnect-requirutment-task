import type { Product } from "../types/product";
import type { ProductFormValues } from "../schema/product-form-schema";

/**
 * The wizard's answers, as a catalogue row.
 *
 * This is where the two vocabularies meet and the three step schemas collapse
 * into one record — every rule about how a form value becomes a product lives
 * here, so the catalogue's submit handler is three lines with no translation
 * in it.
 *
 * `id` is a parameter rather than something generated in here: a pure function
 * that invents an identifier cannot be checked against an expected value, and
 * the caller is the one that knows what the catalogue already holds.
 */
export function toProduct(values: ProductFormValues, id: string): Product {
  return {
    id,
    // Trimmed on the way in, not while typing — the schema measures the
    // trimmed value, so this is what it actually accepted.
    name: values.name.trim(),
    sku: values.sku.trim(),
    description: values.description.trim(),
    manufacturer: values.manufacturer,
    category: values.category,
    features: values.features,
    // Both prices are `number | null` while a box can be empty. Step 2 has to
    // parse before "Zapisz produkt" is reachable at all, so null never gets
    // this far; zero is the inert fallback rather than a crash on the way to
    // the listing.
    priceNet: values.priceNet ?? 0,
    price: values.priceGross ?? 0,
    vatRate: values.vatRate,
    currency: values.currency,
    // The switch is the sole source of the badge. A product marked available
    // with nothing in stock is allowed — the two are separate answers.
    status: values.available ? "available" : "unavailable",
    // Untracked unless the product was marked limited, which is what the
    // listing's em dash means.
    stock: values.limited ? (values.stockQuantity ?? 0) : null,
    minQuantity: values.minQuantity ?? 1,
    maxQuantity: values.maxQuantity ?? 1,
  };
}
