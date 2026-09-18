import { z } from "zod";

/**
 * Step 1 ("Informacje / Dane podstawowe") of the add-product wizard. Steps 2
 * and 3 get their own schemas when they are built; nothing here assumes it is
 * the whole product.
 *
 * Keys are English and match `Product` in `../types/product.ts`, so a later
 * step can merge this straight into one. Messages are Polish because they are
 * shown.
 *
 * Check order matters: Zod reports every failing check in declaration order and
 * the form shows the first message, so the "required" check is always declared
 * before the more specific ones.
 */
export const productInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nazwa produktu jest wymagana")
    .min(3, "Nazwa musi mieć co najmniej 3 znaki")
    .max(100, "Nazwa może mieć maksymalnie 100 znaków"),

  // Case is preserved as typed. Auto-uppercasing a field while someone is
  // typing in it moves the caret and fights the user; if the catalogue ever
  // needs canonical SKUs that belongs on the way in, not in the input.
  sku: z
    .string()
    .trim()
    .min(1, "SKU jest wymagane")
    .regex(/^[A-Za-z0-9]+$/, "SKU może zawierać tylko litery i cyfry")
    .max(24, "SKU może mieć maksymalnie 24 znaki"),

  description: z.string().trim().max(500, "Opis może mieć maksymalnie 500 znaków"),

  manufacturer: z.string().min(1, "Producent jest wymagany"),

  category: z.string().min(1, "Kategoria jest wymagana"),

  features: z.array(z.string()).min(1, "Wybierz co najmniej jedną cechę produktu"),
});

export type ProductInfoValues = z.infer<typeof productInfoSchema>;

/**
 * Every field starts empty and controlled — `undefined` would make the inputs
 * uncontrolled on first render and React would complain the moment one is typed
 * into.
 */
export const PRODUCT_INFO_DEFAULTS: ProductInfoValues = {
  name: "",
  sku: "",
  description: "",
  manufacturer: "",
  category: "",
  features: [],
};
