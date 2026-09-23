import type { Product, ProductsPage } from "../types/product";

const PAGE_SIZE = 5;

export function getProductsPage(page: number, products: Product[]): ProductsPage {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
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
