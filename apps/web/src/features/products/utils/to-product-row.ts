import type { Product, ProductStatus } from "../types/product";
import { formatPrice } from "./format-price";
import { formatCategory } from "./product-labels";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  status: ProductStatus;
  stock: string;
};

export function toProductRow(product: Product): ProductRow {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: formatCategory(product.category),
    price: formatPrice(product.price, product.currency),
    status: product.status,
    stock: product.stock === null ? "—" : String(product.stock),
  };
}
