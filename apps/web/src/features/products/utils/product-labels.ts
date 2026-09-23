import { PRODUCT_CATEGORIES } from "../data/product-options";

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

function unbreakable(phrase: string): string {
  return phrase.replace(/ /g, "\u00a0");
}

// Only the phrases are unbreakable; the spaces around `·` must stay ordinary or
// the caption cannot wrap and overflows the mobile layout.
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

export function formatCategory(slug: string): string {
  return PRODUCT_CATEGORIES.find((option) => option.value === slug)?.label ?? slug;
}
