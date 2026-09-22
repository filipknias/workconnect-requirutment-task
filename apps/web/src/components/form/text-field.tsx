"use client";

import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useFieldContext } from "./context/field-context";
import {
  INVALID_BORDER,
  useFieldPresentation,
} from "./hooks/use-field-presentation";

/**
 * A single-line text field bound to the enclosing `form.AppField`. The call
 * site supplies the copy; the label/control/error wiring is not its problem.
 *
 * There is no `maxLength`: a field that silently swallows keystrokes at the
 * limit is worse than one that says what the limit is.
 */
export function TextField({
  label,
  placeholder,
  required = false,
  autoComplete,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const field = useFieldContext<string>();
  const { id, errorId, error, invalid, describedBy, handleBlur } =
    useFieldPresentation("blur");

  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        value={field.state.value}
        className={`h-10 ${INVALID_BORDER}`}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={handleBlur}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
