export type ProductStatus = "available" | "unavailable";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  /** Gross price in PLN. */
  price: number;
  status: ProductStatus;
  /** Units on hand, or `null` when the product is not stock-tracked. */
  stock: number | null;
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
