import type { ProductOption } from "../types/product";

export const PRODUCT_CATEGORIES: readonly ProductOption[] = [
  { value: "komputery", label: "Komputery" },
  { value: "telefony", label: "Telefony" },
  { value: "rtv", label: "RTV" },
  { value: "agd", label: "AGD" },
  { value: "akcesoria", label: "Akcesoria" },
];

export const PRODUCT_MANUFACTURERS: readonly ProductOption[] = [
  { value: "apple", label: "Apple" },
  { value: "samsung", label: "Samsung" },
  { value: "sony", label: "Sony" },
  { value: "bosch", label: "Bosch" },
  { value: "xiaomi", label: "Xiaomi" },
  { value: "dell", label: "Dell" },
  { value: "philips", label: "Philips" },
];

export const PRODUCT_FEATURES: readonly ProductOption[] = [
  { value: "bluetooth", label: "Bluetooth" },
  { value: "wifi", label: "WiFi" },
  { value: "usb-c", label: "USB-C" },
  { value: "wodoodporny", label: "Wodoodporny" },
  { value: "bezprzewodowy", label: "Bezprzewodowy" },
  { value: "ekologiczny", label: "Ekologiczny" },
  { value: "premium", label: "Premium" },
];

// The first entry is the form's default (23%).
export const PRODUCT_VAT_RATES: readonly ProductOption<number>[] = [
  { value: 23, label: "23%" },
  { value: 8, label: "8%" },
  { value: 5, label: "5%" },
  { value: 0, label: "0%" },
];

// The first entry is the form's default (PLN).
export const PRODUCT_CURRENCIES: readonly ProductOption[] = [
  { value: "PLN", label: "PLN" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
];
