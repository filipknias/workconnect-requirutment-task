import type { ProductOption } from "../types/product";

/**
 * The choices offered by the "Dodaj nowy produkt" wizard. Mocked, like
 * `PRODUCTS` — there is no API yet.
 *
 * Written out rather than derived from `PRODUCTS`: the catalogue happens to
 * contain one product per category today, but the list a user may pick from is
 * a separate thing from the list of categories already in use, and deriving one
 * from the other would silently shrink the dropdown as the mock data changes.
 */
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

/** The seven chips the frame draws under "Cechy produktu", in frame order. */
export const PRODUCT_FEATURES: readonly ProductOption[] = [
  { value: "bluetooth", label: "Bluetooth" },
  { value: "wifi", label: "WiFi" },
  { value: "usb-c", label: "USB-C" },
  { value: "wodoodporny", label: "Wodoodporny" },
  { value: "bezprzewodowy", label: "Bezprzewodowy" },
  { value: "ekologiczny", label: "Ekologiczny" },
  { value: "premium", label: "Premium" },
];
