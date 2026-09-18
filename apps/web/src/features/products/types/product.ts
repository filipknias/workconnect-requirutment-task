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
 */
export type ProductOption = {
  value: string;
  label: string;
};
