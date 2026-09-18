import { PRODUCTS, type Product } from "./products";

const PAGE_SIZE = 5;

export type ProductsPage = {
  /** Empty when the requested page is outside the catalogue. */
  products: Product[];
  /** The requested page, verbatim — an out-of-range number is reported as asked. */
  page: number;
  totalPages: number;
  total: number;
};

/**
 * The single seam between the catalogue and the view. Everything paging-related
 * — the source array, the page size, deciding a page does not exist, slicing —
 * lives behind this one call, so a real API only has to replace this file.
 *
 * A page outside the range returns no products rather than clamping, and the
 * URL is left as the visitor typed it: `?page=99` renders the empty state and
 * still captions itself "Strona 99 z 2". The views read that state off an empty
 * `products`, so there is no second flag to keep in step.
 */
export function getProductsPage(page: number): ProductsPage {
  const total = PRODUCTS.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A non-numeric `?page=` never reaches here — nuqs defaults it to 1 — but the
  // seam is callable from anywhere, so it does not assume that.
  const current = Number.isFinite(page) ? Math.trunc(page) : 1;
  const start = (current - 1) * PAGE_SIZE;
  const exists = current >= 1 && current <= totalPages;

  return {
    products: exists ? PRODUCTS.slice(start, start + PAGE_SIZE) : [],
    page: current,
    totalPages,
    total,
  };
}
