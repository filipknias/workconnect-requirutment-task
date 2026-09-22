import type { Product, ProductStatus } from "../types/product";
import { formatPrice } from "./format-price";
import { formatCategory } from "./product-labels";

/**
 * A catalogue row as the two layouts print it: every cell already a string,
 * resolved and formatted.
 *
 * `status` stays the slug, because neither layout prints it — both hand it to
 * `ProductStatusBadge`, which owns the Polish word and the colour together.
 */
export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  status: ProductStatus;
  /** An em dash where a product is not stock-tracked. */
  stock: string;
};

/**
 * The desktop table and the mobile card list draw the same six values from a
 * `Product` and drew them through the same three calls each. The formatting is
 * not a layout decision — "9999,00 PLN" and the em dash for untracked stock
 * have to read the same on both — so it is made once, here, and the layouts
 * are left with nothing but their chrome.
 */
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
