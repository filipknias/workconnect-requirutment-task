import type { Product } from "../types/product";
import type { ProductFormValues } from "../schema/product-form-schema";

export function toProduct(values: ProductFormValues, id: string): Product {
  return {
    id,
    name: values.name.trim(),
    sku: values.sku.trim(),
    description: values.description.trim(),
    manufacturer: values.manufacturer,
    category: values.category,
    features: values.features,
    priceNet: values.priceNet ?? 0,
    price: values.priceGross ?? 0,
    vatRate: values.vatRate,
    currency: values.currency,
    status: values.available ? "available" : "unavailable",
    stock: values.limited ? (values.stockQuantity ?? 0) : null,
    minQuantity: values.minQuantity ?? 1,
    maxQuantity: values.maxQuantity ?? 1,
  };
}
