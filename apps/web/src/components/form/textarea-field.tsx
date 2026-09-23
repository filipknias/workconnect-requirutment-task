"use client";

import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Textarea } from "@repo/ui/components/textarea";
import { useFieldContext } from "./context/field-context";
import {
  INVALID_BORDER,
  useFieldPresentation,
} from "./hooks/use-field-presentation";

export function TextareaField({
  label,
  placeholder,
  rows = 3,
}: {
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  const field = useFieldContext<string>();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation("blur");

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        value={field.state.value}
        placeholder={placeholder}
        rows={rows}
        // Overrides the shared Textarea's `field-sizing-content`, which grows the box and shifts the footer.
        className={`field-sizing-fixed resize-y ${INVALID_BORDER}`}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={handleBlur}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
