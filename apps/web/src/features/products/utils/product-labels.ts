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

/**
 * `Strona 1 z 2 · 7 produktów`. Figma joins every word of this line with a
 * non-breaking space, so the caption never wraps mid-phrase.
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
  return `Strona ${page} z ${totalPages} · ${formatProductCount(total)}`.replace(
    / /g,
    " ",
  );
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
