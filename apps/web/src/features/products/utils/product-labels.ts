import { PRODUCT_CATEGORIES } from "../data/product-options";

/**
 * Polish counts take three forms. `total` is no longer hardcoded now that it
 * comes from `getProductsPage`, so the copy has to agree with it.
 */
export function formatProductCount(count: number): string {
  const abs = Math.abs(count);
  const lastDigit = abs % 10;
  const lastTwoDigits = abs % 100;

  if (abs === 1) return `${count} produkt`;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${count} produkty`;
  }
  return `${count} produktów`;
}

/** Every space inside a phrase, so neither half of the caption can break. */
function unbreakable(phrase: string): string {
  return phrase.replace(/ /g, "\u00a0");
}

/**
 * `Strona 1 z 2 · 7 produktów`. Figma joins the line with non-breaking spaces,
 * which is about the phrases rather than the line: "Strona 1 z 2" and
 * "7 produktów" each have to stay whole.
 *
 * Binding the whole string, separator included, left the caption nothing it
 * could break on — in the mobile frame it sits under a stack narrower than it
 * is, and an unbreakable line there overflows or squeezes the pagination
 * beside it. The spaces around the `·` are ordinary, so the one place the
 * line may wrap is between the two phrases.
 */
export function formatPageCaption({
  page,
  totalPages,
  total,
}: {
  page: number;
  totalPages: number;
  total: number;
}): string {
  return `${unbreakable(`Strona ${page} z ${totalPages}`)} · ${unbreakable(formatProductCount(total))}`;
}

/**
 * The Polish label for a stored category slug.
 *
 * Products carry slugs, not copy — see `../types/product.ts` — so every view
 * that prints a category goes through here. An unrecognised slug is shown as
 * it is rather than blanked out: a row from a list this build no longer offers
 * is still a row, and an empty cell would hide it.
 */
export function formatCategory(slug: string): string {
  return PRODUCT_CATEGORIES.find((option) => option.value === slug)?.label ?? slug;
}
