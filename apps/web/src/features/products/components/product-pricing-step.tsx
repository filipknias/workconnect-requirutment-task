"use client";

import { FieldGroup } from "@repo/ui/components/field";
import {
  PRODUCT_CURRENCIES,
  PRODUCT_VAT_RATES,
} from "@/features/products/data/product-options";
import type { WizardForm } from "@/features/products/hooks/use-add-product-wizard";
import {
  applyPriceEdit,
  type PriceEdit,
} from "@/features/products/utils/recalculate-prices";

export function ProductPricingStep({ form }: { form: WizardForm }) {
  const edit = (priceEdit: PriceEdit) => {
    const { priceNet, priceGross, vatRate } = form.state.values;
    const next = applyPriceEdit({ priceNet, priceGross, vatRate }, priceEdit);

    form.setFieldValue("priceNet", next.priceNet);
    form.setFieldValue("priceGross", next.priceGross);
    form.setFieldValue("vatRate", next.vatRate);
  };

  return (
    <FieldGroup>
      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="priceNet">
          {(field) => (
            <field.NumberField
              label="Cena netto"
              placeholder="0.00"
              required
              onValueChange={(value) => edit({ field: "priceNet", value })}
            />
          )}
        </form.AppField>
        <form.AppField name="priceGross">
          {(field) => (
            <field.NumberField
              label="Cena brutto"
              placeholder="0.00"
              required
              onValueChange={(value) => edit({ field: "priceGross", value })}
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
              onValueChange={(value) => edit({ field: "vatRate", value })}
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
