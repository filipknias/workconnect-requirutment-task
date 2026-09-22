"use client";

import { FieldGroup } from "@repo/ui/components/field";
import { Separator } from "@repo/ui/components/separator";
import type { WizardForm } from "@/features/products/hooks/use-wizard-form";

/**
 * Step 3 — "Dostępność / Stany magazynowe".
 *
 * The frame is a stack of rows separated by hairlines: the switch, the
 * checkbox, then "Limity koszyka" over a two-column row that stacks on a
 * phone. `gap-4` rather than `FieldGroup`'s default 5 because the separators
 * carry the spacing between sections here.
 *
 * "Ilość na magazynie" is not in the frame. The checkbox beside it is labelled
 * "Produkt limitowany" and gates nothing otherwise, and the listing has a
 * "Magazyn" column with no way to fill it — so the box it reveals is what that
 * checkbox is for.
 */
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

      {/* Subscribed rather than read off `form.state`: the panel has to
          re-render when the box is ticked, and nothing else here does. The
          field is unmounted while it is off, which is deliberate — the value
          stays in the form and is restored on re-tick, and the step's schema
          ignores it meanwhile, so a number nobody can see can never be why
          "Zapisz produkt" is dead. */}
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
