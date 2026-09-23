const priceFormatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export function formatPrice(price: number, currency: string): string {
  return `${priceFormatter.format(price)} ${currency}`;
}
