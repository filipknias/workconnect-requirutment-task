"use client";

import { Field, FieldLabel } from "@repo/ui/components/field";
import { Switch } from "@repo/ui/components/switch";
import { useFieldContext } from "./context/field-context";
import { useFieldPresentation } from "./hooks/use-field-presentation";

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
