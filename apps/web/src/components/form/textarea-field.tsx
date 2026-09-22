"use client";

import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Textarea } from "@repo/ui/components/textarea";
import { useFieldContext } from "./context/field-context";
import {
  INVALID_BORDER,
  useFieldPresentation,
} from "./hooks/use-field-presentation";

/**
 * A multi-line text field bound to the enclosing `form.AppField`.
 */
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
        // `field-sizing-content` from the shared Textarea would grow the box as
        // the description is typed and push the footer around; the frame draws
        // a fixed three-row box the user can drag taller.
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
