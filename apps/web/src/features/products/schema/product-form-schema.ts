import { z } from "zod";
import {
  PRODUCT_CURRENCIES,
  PRODUCT_VAT_RATES,
} from "@/features/products/data/product-options";

// Check order matters: the form shows only the first failing message, so the
// "required" check must come before the more specific ones.
export const productInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nazwa produktu jest wymagana")
    .min(3, "Nazwa musi mieć co najmniej 3 znaki")
    .max(100, "Nazwa może mieć maksymalnie 100 znaków"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU jest wymagane")
    .regex(/^[A-Za-z0-9]+$/, "SKU może zawierać tylko litery i cyfry")
    .max(24, "SKU może mieć maksymalnie 24 znaki"),

  description: z.string().trim().max(500, "Opis może mieć maksymalnie 500 znaków"),

  manufacturer: z.string().min(1, "Producent jest wymagany"),

  category: z.string().min(1, "Kategoria jest wymagana"),

  features: z.array(z.string()),
});

export type ProductInfoValues = z.input<typeof productInfoSchema>;

// `""`, not `undefined`: an `undefined` value makes the inputs uncontrolled.
export const PRODUCT_INFO_DEFAULTS: ProductInfoValues = {
  name: "",
  sku: "",
  description: "",
  manufacturer: "",
  category: "",
  features: [],
};

function priceSchema(label: string) {
  return z
    .number()
    .nullable()
    .refine((value): value is number => value !== null, {
      message: `${label} jest wymagana`,
      abort: true,
    })
    .refine((value) => value > 0, `${label} musi być większa od zera`);
}

export const productPricingSchema = z.object({
  priceNet: priceSchema("Cena netto"),
  priceGross: priceSchema("Cena brutto"),
  vatRate: z.number(),
  currency: z.string().min(1, "Waluta jest wymagana"),
});

export type ProductPricingValues = z.input<typeof productPricingSchema>;

export const PRODUCT_PRICING_DEFAULTS: ProductPricingValues = {
  priceNet: null,
  priceGross: null,
  vatRate: PRODUCT_VAT_RATES[0]!.value,
  currency: PRODUCT_CURRENCIES[0]!.value,
};

export const productAvailabilitySchema = z
  .object({
    available: z.boolean(),
    limited: z.boolean(),
    stockQuantity: z.number().nullable(),
    minQuantity: z.number().nullable(),
    maxQuantity: z.number().nullable(),
  })
  .check((ctx) => {
    for (const [field, message] of availabilityIssues(ctx.value)) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value[field],
        path: [field],
        message,
      });
    }
  });

export type ProductAvailabilityValues = z.input<typeof productAvailabilitySchema>;

export const PRODUCT_AVAILABILITY_DEFAULTS: ProductAvailabilityValues = {
  available: true,
  limited: false,
  stockQuantity: null,
  minQuantity: 1,
  maxQuantity: 10,
};

const MAX_BELOW_MIN = "Maksymalna ilość nie może być mniejsza od minimalnej";

type AvailabilityField = "stockQuantity" | "minQuantity" | "maxQuantity";

// `stockQuantity` is checked only while `limited` is on, so a hidden value is kept
// (not cleared) on untick and can never block submit invisibly.
function availabilityIssues(
  values: ProductAvailabilityValues,
): [field: AvailabilityField, message: string][] {
  const issues: [AvailabilityField, string][] = [];

  const check = (field: AvailabilityField, label: string, minimum: number) => {
    const value = values[field];

    if (value === null) issues.push([field, `${label} jest wymagana`]);
    else if (!Number.isInteger(value))
      issues.push([field, `${label} musi być liczbą całkowitą`]);
    else if (value < minimum)
      issues.push([
        field,
        minimum === 0
          ? `${label} nie może być ujemna`
          : `${label} musi wynosić co najmniej ${minimum}`,
      ]);
  };

  if (values.limited) check("stockQuantity", "Ilość na magazynie", 0);
  check("minQuantity", "Minimalna ilość", 1);
  check("maxQuantity", "Maksymalna ilość", 1);

  const { minQuantity, maxQuantity } = values;
  if (minQuantity !== null && maxQuantity !== null && maxQuantity < minQuantity) {
    // On both fields on purpose: a message stays hidden until its field is blurred,
    // so one attached only to max would be invisible to someone editing min.
    issues.push(["minQuantity", MAX_BELOW_MIN], ["maxQuantity", MAX_BELOW_MIN]);
  }

  return issues;
}

export const PRODUCT_FORM_DEFAULTS = {
  ...PRODUCT_INFO_DEFAULTS,
  ...PRODUCT_PRICING_DEFAULTS,
  ...PRODUCT_AVAILABILITY_DEFAULTS,
};

export type ProductFormValues = typeof PRODUCT_FORM_DEFAULTS;
