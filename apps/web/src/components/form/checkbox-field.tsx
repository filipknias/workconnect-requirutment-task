"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { useFieldContext } from "./context/field-context";
import { useFieldPresentation } from "./hooks/use-field-presentation";

/**
 * A single tickbox bound to the enclosing `form.AppField` — not to be confused
 * with `ChipGroupField`, which is a whole set of them behind one array value.
 *
 * Laid out and reasoned about exactly like `SwitchField`: control first, label
 * beside it, and no error slot for a value that is always one of two.
 */
export function CheckboxField({ label }: { label: string }) {
  const field = useFieldContext<boolean>();
  const { id } = useFieldPresentation("touch");

  return (
    <Field orientation="horizontal" className="gap-2">
      <Checkbox
        id={id}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
      <FieldLabel htmlFor={id} className="font-normal">
        {label}
      </FieldLabel>
    </Field>
  );
}
