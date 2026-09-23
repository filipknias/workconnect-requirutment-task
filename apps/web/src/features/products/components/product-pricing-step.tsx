"use client";

import { FieldGroup } from "@repo/ui/components/field";
import {
  PRODUCT_CURRENCIES,
  PRODUCT_VAT_RATES,
} from "@/features/products/data/product-options";
import type { WizardForm } from "@/features/products/hooks/use-wizard-form";
import type { PriceEdit } from "@/features/products/utils/recalculate-prices";

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
