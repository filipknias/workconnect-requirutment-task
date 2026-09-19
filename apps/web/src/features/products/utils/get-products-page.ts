import type { Product, ProductsPage } from "../types/product";

const PAGE_SIZE = 5;

/**
 * The single seam between the catalogue and the view. Everything paging-related
 * — the page size, deciding a page does not exist, slicing — lives behind this
 * one call, so a real API only has to replace this file.
 *
 * `products` is a required parameter rather than the module's own `PRODUCTS`:
 * the catalogue is client state now that the wizard can add to it, and a
 * function that reached for the seed array would page a list nobody is
 * looking at. Making it required is what stops a call site forgetting.
 *
 * A page outside the range returns no products rather than clamping, and the
 * URL is left as the visitor typed it: `?page=99` renders the empty state and
 * still captions itself "Strona 99 z 2". The views read that state off an empty
 * `products`, so there is no second flag to keep in step.
 */
export function getProductsPage(page: number, products: Product[]): ProductsPage {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A non-numeric `?page=` never reaches here — nuqs defaults it to 1 — but the
  // seam is callable from anywhere, so it does not assume that.
  const current = Number.isFinite(page) ? Math.trunc(page) : 1;
  const start = (current - 1) * PAGE_SIZE;
  const exists = current >= 1 && current <= totalPages;

  return {
    products: exists ? products.slice(start, start + PAGE_SIZE) : [],
    page: current,
    totalPages,
    total,
  };
}
