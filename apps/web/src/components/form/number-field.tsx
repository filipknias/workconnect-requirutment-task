"use client";

import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useFieldContext } from "./context/field-context";
import {
  INVALID_BORDER,
  useFieldPresentation,
} from "./hooks/use-field-presentation";

export function NumberField({
  label,
  placeholder,
  required = false,
  onValueChange,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  onValueChange?: (value: number | null) => void;
}) {
  const field = useFieldContext<number | null>();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation("blur");

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        className={`h-10 ${INVALID_BORDER}`}
        // Not `0.01`: the browser would mark 19.999 `:invalid` while the schema accepts it.
        step="any"
        min="0"
        inputMode="decimal"
        value={field.state.value === null ? "" : String(field.state.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          const value =
            event.target.value === "" ? null : event.target.valueAsNumber;
          if (onValueChange) onValueChange(value);
          else field.handleChange(value);
        }}
        // Without this, scrolling over a focused number input silently changes its value.
        onWheel={(event) => event.currentTarget.blur()}
        onBlur={handleBlur}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
