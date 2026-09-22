"use client";

import { FieldGroup } from "@repo/ui/components/field";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_FEATURES,
  PRODUCT_MANUFACTURERS,
} from "@/features/products/data/product-options";
import type { WizardForm } from "@/features/products/hooks/use-wizard-form";

/** Step 1 — "Informacje / Dane podstawowe". */
export function ProductInfoStep({ form }: { form: WizardForm }) {
  return (
    <FieldGroup>
      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Nazwa produktu"
              placeholder="np. MacBook Pro 14"
              required
            />
          )}
        </form.AppField>
        <form.AppField name="sku">
          {(field) => (
            <field.TextField
              label="SKU produktu"
              placeholder="np. MBP14M3PRO"
              autoComplete="off"
              required
            />
          )}
        </form.AppField>
      </div>

      {/* The frames label this one "Nazwa produktu" — a copy/paste of the
          first field, in both the desktop and the mobile export. Corrected
          deliberately: two controls with the same name are indistinguishable
          to anyone navigating by label, and the placeholder the design gives
          it ("Krótki opis produktu") says what it is actually for. */}
      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Opis produktu"
            placeholder="Krótki opis produktu"
          />
        )}
      </form.AppField>

      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="manufacturer">
          {(field) => (
            <field.SelectField
              label="Producent"
              placeholder="Wybierz producenta"
              options={PRODUCT_MANUFACTURERS}
              required
            />
          )}
        </form.AppField>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              label="Kategoria"
              placeholder="Wybierz kategorię"
              options={PRODUCT_CATEGORIES}
              required
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="features">
        {(field) => (
          <field.ChipGroupField
            legend="Cechy produktu"
            options={PRODUCT_FEATURES}
          />
        )}
      </form.AppField>
    </FieldGroup>
  );
}
