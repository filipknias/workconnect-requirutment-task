"use client";

import { Field, FieldLabel } from "@repo/ui/components/field";
import { Switch } from "@repo/ui/components/switch";
import { useFieldContext } from "./context/field-context";
import { useFieldPresentation } from "./hooks/use-field-presentation";

/**
 * An on/off field bound to the enclosing `form.AppField`.
 *
 * Horizontal, with the control first and the label beside it, which is what
 * the frame draws and also what a switch wants: the thing you click is the
 * thing you read. There is no `FieldError` — a boolean that always holds one
 * of two values has nothing to complain about, and an empty slot under a row
 * would only add space the frame does not have.
 */
export function SwitchField({ label }: { label: string }) {
  const field = useFieldContext<boolean>();
  const { id } = useFieldPresentation("touch");

  return (
    <Field orientation="horizontal" className="gap-2">
      <Switch
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
