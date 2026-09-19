export type ProductStatus = "available" | "unavailable";

/**
 * A catalogue entry, as the add-product wizard produces one. Every field is
 * required: the wizard collects all of them, so an optional key here would
 * only ever describe a row nobody can create.
 *
 * `category`, `manufacturer` and `features` hold slugs (`"komputery"`,
 * `"apple"`, `"usb-c"`) rather than the Polish labels beside them — see
 * `../data/product-options.ts`. Anything that shows one resolves it through
 * `../utils/product-labels.ts`.
 */
export type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  /** Slug from `PRODUCT_MANUFACTURERS`. */
  manufacturer: string;
  /** Slug from `PRODUCT_CATEGORIES`. */
  category: string;
  /** Slugs from `PRODUCT_FEATURES`; empty is a normal product. */
  features: string[];
  priceNet: number;
  /** Gross price, in `currency` — the one the listing shows. */
  price: number;
  /** A percentage: `23` means 23%. */
  vatRate: number;
  /** ISO code, as `PRODUCT_CURRENCIES` stores it. */
  currency: string;
  status: ProductStatus;
  /** Units on hand, or `null` when the product is not stock-tracked. */
  stock: number | null;
  /** Cart limits — how few, and how many, may be bought at once. */
  minQuantity: number;
  maxQuantity: number;
};

/** One page of the catalogue, as `getProductsPage` reports it. */
export type ProductsPage = {
  /** Empty when the requested page is outside the catalogue. */
  products: Product[];
  /** The requested page, verbatim — an out-of-range number is reported as asked. */
  page: number;
  totalPages: number;
  total: number;
};

/**
 * A pickable choice in the add-product wizard.
 *
 * `value` is a slug, `label` is what the frame shows. Storing the slug keeps
 * the submitted value stable if the Polish copy is ever retouched.
 *
 * Generic because the VAT rates are the one list whose value is arithmetic
 * rather than an identifier: `ProductOption<number>` keeps `23` a number from
 * the list to the form state, instead of parsing `"23"` back out at the edge.
 */
export type ProductOption<TValue = string> = {
  value: TValue;
  label: string;
};
