import { z } from "zod";
import {
  PRODUCT_CURRENCIES,
  PRODUCT_VAT_RATES,
} from "@/features/products/data/product-options";

/**
 * Step 1 ("Informacje / Dane podstawowe") of the add-product wizard. Each step
 * owns its own schema and describes only its own fields; `PRODUCT_FORM_DEFAULTS`
 * at the bottom is where the three meet.
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

  // Optional: a product with no notable features is a normal product, and
  // nothing downstream needs the array to be non-empty. Declared anyway so the
  // schema describes the whole step and the key is always present.
  features: z.array(z.string()),
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

/**
 * A price box: empty is `null` and both empty and zero are rejected, in that
 * order, so the "required" message is the one a blank field shows. There is no
 * upper bound — a catalogue that refuses a genuinely expensive product is a
 * worse bug than one that accepts a typo.
 */
function priceSchema(label: string) {
  return (
    z
      .number()
      .nullable()
      // The `: boolean` annotations are load-bearing. Without them TypeScript
      // infers `value is number` from the first check and Zod narrows the
      // parsed type to `number` — but the *stored* value really is nullable,
      // and `PRODUCT_PRICING_DEFAULTS` below has to be able to say so.
      .refine((value): boolean => value !== null, `${label} jest wymagana`)
      .refine(
        (value): boolean => value === null || value > 0,
        `${label} musi być większa od zera`,
      )
  );
}

/**
 * Step 2 ("Cena / Dane cenowe"). `vatRate` and `currency` always hold one of
 * their options — the form starts them on 23% and PLN — so neither can be
 * empty; they are declared anyway so the step's schema describes the whole
 * step rather than the interesting half of it.
 */
export const productPricingSchema = z.object({
  priceNet: priceSchema("Cena netto"),
  priceGross: priceSchema("Cena brutto"),
  vatRate: z.number(),
  currency: z.string().min(1, "Waluta jest wymagana"),
});

export type ProductPricingValues = z.infer<typeof productPricingSchema>;

export const PRODUCT_PRICING_DEFAULTS: ProductPricingValues = {
  priceNet: null,
  priceGross: null,
  vatRate: PRODUCT_VAT_RATES[0]!.value,
  currency: PRODUCT_CURRENCIES[0]!.value,
};

/**
 * Step 3 ("Dostępność / Stany magazynowe").
 *
 * Flat rather than a discriminated union, and every rule that depends on
 * another field lives in the `.check` below. Two reasons: the three quantity
 * boxes all store `number | null`, the same way a price does, and a value
 * hidden by an unticked checkbox has to stay *unvalidated* rather than be
 * cleared — see `availabilityIssues`.
 */
export const productAvailabilitySchema = z
  .object({
    /**
     * The switch, and the only thing `status` is derived from. A product can
     * be marked available with nothing on the shelf: the two answer different
     * questions and cross-checking them would override what was just chosen.
     */
    available: z.boolean(),
    /** The checkbox. It gates `stockQuantity` and nothing else. */
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

export type ProductAvailabilityValues = z.infer<typeof productAvailabilitySchema>;

/** The frame fills both limit boxes in, so they are defaults rather than placeholders — and the switch is drawn on. */
export const PRODUCT_AVAILABILITY_DEFAULTS: ProductAvailabilityValues = {
  available: true,
  limited: false,
  stockQuantity: null,
  minQuantity: 1,
  maxQuantity: 10,
};

/** `max >= min`, not `>`: a product you may buy exactly one of is a real product. */
const MAX_BELOW_MIN = "Maksymalna ilość nie może być mniejsza od minimalnej";

type AvailabilityField = "stockQuantity" | "minQuantity" | "maxQuantity";

/**
 * Every problem with a step-3 value, in the order the fields should say them.
 *
 * Split out of the schema because the order is the whole point: the form shows
 * the first message a field has, so "required" is reported before "must be a
 * whole number" before the bound, and the cross-field rule comes last.
 *
 * `stockQuantity` is checked only while `limited` is on. That is what lets the
 * field keep what was typed when the checkbox is unticked — nothing clears the
 * value, so re-ticking restores it, and an invalid number nobody can see can
 * never be the reason "Zapisz produkt" is dead.
 */
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
    // Mirrored onto both boxes on purpose. A field keeps its message hidden
    // until it has been blurred once (see `use-field-presentation.ts`) and both
    // of these start out prefilled — so an issue attached only to the maximum
    // would stay invisible to someone who edits the minimum alone, leaving
    // "Zapisz produkt" dead with nothing on screen explaining why.
    issues.push(["minQuantity", MAX_BELOW_MIN], ["maxQuantity", MAX_BELOW_MIN]);
  }

  return issues;
}

/** Everything the wizard collects, and what it starts out holding. */
export const PRODUCT_FORM_DEFAULTS = {
  ...PRODUCT_INFO_DEFAULTS,
  ...PRODUCT_PRICING_DEFAULTS,
  ...PRODUCT_AVAILABILITY_DEFAULTS,
};

export type ProductFormValues = typeof PRODUCT_FORM_DEFAULTS;

/** What each step validates against, indexed by its 1-based number. */
const STEP_SCHEMAS = [
  productInfoSchema,
  productPricingSchema,
  productAvailabilitySchema,
];

/**
 * The schema the wizard should be validating against while `step` is on
 * screen, or `undefined` past the last step — which is also how the footer
 * knows it is showing the last one.
 */
export function stepSchema(step: number) {
  return STEP_SCHEMAS[step - 1];
}

/**
 * Whether `values` satisfies `step` — the one thing "Dalej" is gated on.
 *
 * Asked of the schema rather than of the form: TanStack derives `isValid` from
 * errors, and errors do not exist until a validator has run, so a blank form
 * reports itself valid and the button would be live before anything is typed.
 * Parsing also guarantees the button and the field messages can never disagree,
 * because they are the same schema.
 */
export function isStepComplete(step: number, values: unknown): boolean {
  return stepSchema(step)?.safeParse(values).success ?? false;
}
