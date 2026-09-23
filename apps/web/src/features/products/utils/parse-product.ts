import { z } from "zod";
import type { Product } from "../types/product";
import {
  productAvailabilitySchema,
  productInfoSchema,
  productPricingSchema,
  type ProductFormValues,
} from "../schema/product-form-schema";

const availabilityOutputSchema = z.discriminatedUnion("limited", [
  z.object({
    available: z.boolean(),
    limited: z.literal(true),
    stockQuantity: z.number(),
    minQuantity: z.number(),
    maxQuantity: z.number(),
  }),
  z.object({
    available: z.boolean(),
    limited: z.literal(false),
    minQuantity: z.number(),
    maxQuantity: z.number(),
  }),
]);

// Throws on invalid values: the wizard only calls it once every step has passed.
export function parseProduct(values: ProductFormValues): Product {
  const info = productInfoSchema.parse(values);
  const pricing = productPricingSchema.parse(values);
  const availability = availabilityOutputSchema.parse(
    productAvailabilitySchema.parse(values),
  );

  return {
    id: info.sku.toLowerCase(),
    ...info,
    priceNet: pricing.priceNet,
    price: pricing.priceGross,
    vatRate: pricing.vatRate,
    currency: pricing.currency,
    status: availability.available ? "available" : "unavailable",
    stock: availability.limited ? availability.stockQuantity : null,
    minQuantity: availability.minQuantity,
    maxQuantity: availability.maxQuantity,
  };
}
