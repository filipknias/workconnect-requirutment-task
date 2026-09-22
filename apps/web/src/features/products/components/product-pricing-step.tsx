"use client";

import { FieldGroup } from "@repo/ui/components/field";
import {
  PRODUCT_CURRENCIES,
  PRODUCT_VAT_RATES,
} from "@/features/products/data/product-options";
import type { WizardForm } from "@/features/products/hooks/use-wizard-form";
import type { PriceEdit } from "@/features/products/utils/recalculate-prices";

/**
 * Step 2 — "Cena / Dane cenowe". Four fields in the frame's 2x2 grid, stacked
 * on a phone.
 *
 * Both prices are real inputs: the frame gives no hint which is derived, and
 * a shop that knows its shelf price should not have to divide by 1.23 to enter
 * it. Whichever one is typed into, `onEdit` rewrites the other.
 */
export function ProductPricingStep({
  form,
  onEdit,
}: {
  form: WizardForm;
  onEdit: (edit: PriceEdit) => void;
}) {
  return (
    <FieldGroup>
      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="priceNet">
          {(field) => (
            <field.NumberField
              label="Cena netto"
              placeholder="0.00"
              required
              onValueChange={(value) => onEdit({ field: "priceNet", value })}
            />
          )}
        </form.AppField>
        <form.AppField name="priceGross">
          {(field) => (
            <field.NumberField
              label="Cena brutto"
              placeholder="0.00"
              required
              onValueChange={(value) => onEdit({ field: "priceGross", value })}
            />
          )}
        </form.AppField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* The frame draws this one without a chevron, unlike "Waluta" beside
            it — two controls that behave identically, drawn as if only one of
            them opens. Corrected the same way the duplicated label on step 1
            was: it is a normal select, and it looks like one. */}
        <form.AppField name="vatRate">
          {(field) => (
            <field.SelectField
              label="Stawka VAT"
              options={PRODUCT_VAT_RATES}
              required
              onValueChange={(value) => onEdit({ field: "vatRate", value })}
            />
          )}
        </form.AppField>
        <form.AppField name="currency">
          {(field) => (
            <field.SelectField
              label="Waluta"
              options={PRODUCT_CURRENCIES}
              required
            />
          )}
        </form.AppField>
      </div>
    </FieldGroup>
  );
}
