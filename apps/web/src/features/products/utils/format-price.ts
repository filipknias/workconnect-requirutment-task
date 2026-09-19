const priceFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

/**
 * Matches the Figma frames literally: no thousands separator, a comma for the
 * decimal mark and a non-breaking space before the currency — `9999,00 PLN`.
 *
 * The currency is a parameter rather than the `PLN` this used to hardcode: the
 * wizard offers four, and printing "PLN" under a price entered in euro would
 * be a visible lie. Every mock row is in PLN, so the listing is unchanged.
 */
export function formatPrice(price: number, currency: string): string {
  return `${priceFormatter.format(price)} ${currency}`;
}
