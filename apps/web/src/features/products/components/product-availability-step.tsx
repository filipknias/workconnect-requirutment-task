"use client";

import { FieldGroup } from "@repo/ui/components/field";
import { Separator } from "@repo/ui/components/separator";
import type { WizardForm } from "@/features/products/hooks/use-add-product-wizard";

export function ProductAvailabilityStep({ form }: { form: WizardForm }) {
  return (
    <FieldGroup className="gap-4">
      <form.AppField name="available">
        {(field) => <field.SwitchField label="Produkt jest dostępny" />}
      </form.AppField>

      <Separator className="bg-neutral-200" />

      <form.AppField name="limited">
        {(field) => <field.CheckboxField label="Produkt limitowany" />}
      </form.AppField>

      {/* Subscribed, not read off `form.state`: nothing else re-renders this
          panel when the box is ticked. */}
      <form.Subscribe selector={(state) => state.values.limited}>
        {(limited) =>
          limited && (
            <div className="grid gap-5 md:grid-cols-2">
              <form.AppField name="stockQuantity">
                {(field) => (
                  <field.NumberField
                    label="Ilość na magazynie"
                    placeholder="0"
                    required
                  />
                )}
              </form.AppField>
            </div>
          )
        }
      </form.Subscribe>

      <Separator className="bg-neutral-200" />

      <h3 className="text-base font-medium text-neutral-950">Limity koszyka</h3>

      <div className="grid gap-5 md:grid-cols-2">
        <form.AppField name="minQuantity">
          {(field) => <field.NumberField label="Minimalna ilość" required />}
        </form.AppField>
        <form.AppField name="maxQuantity">
          {(field) => <field.NumberField label="Maksymalna ilość" required />}
        </form.AppField>
      </div>
    </FieldGroup>
  );
}
