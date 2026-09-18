const priceFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

/**
 * Matches the Figma frames literally: no thousands separator, a comma for the
 * decimal mark and a non-breaking space before the currency — `9999,00 PLN`.
 */
export function formatPrice(price: number): string {
  return `${priceFormatter.format(price)} PLN`;
}
